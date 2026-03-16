# NaviTracker: Plan Completo Backend + Frontend
## To-Do List + Agenda + Google Calendar + Calendario "Dia Ganado/Perdido"

---

## Contexto

NaviTracker es una app de tracking de habitos y nutricion (Next.js 15 + NestJS backend + Prisma). El usuario quiere expandirla para organizar toda su vida. Esta primera iteracion agrega:

1. **To-Do List** - Sistema de tareas con prioridades y deadlines
2. **Agenda** - Vista diaria unificada de todo lo que hay que hacer
3. **Google Calendar** - Sincronizacion de eventos externos
4. **Calendario "Dia Ganado/Perdido"** - Heatmap mensual que muestra si completaste todo cada dia

**Idea central:** Al final del dia, el sistema evalua si completaste todo (habitos + tareas + comidas + ejercicio) y pinta el dia de verde (ganado) o rojo (perdido).

---

## PARTE 1: BACKEND (NestJS + Prisma)

### 1.1 Nuevas Tablas en la Base de Datos (Prisma Schema)

```prisma
// ==========================================
// TASKS (To-Do List)
// ==========================================
model Task {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  title           String
  description     String?
  dueDate         String?   // YYYY-MM-DD (nullable = sin fecha limite)
  dueTime         String?   // HH:mm (opcional, para tareas con hora especifica)
  priority        String    @default("medium") // "low" | "medium" | "high" | "urgent"
  status          String    @default("pending") // "pending" | "in_progress" | "completed"
  completed       Boolean   @default(false)
  completedAt     DateTime?
  category        String?   // "work" | "personal" | "health" | "finance" | "study" | "other"
  tags            String?   // JSON array de strings: '["tag1","tag2"]'
  order           Int       @default(0) // para ordenar dentro del dia
  isRecurring     Boolean   @default(false)
  recurrenceRule  String?   // JSON: { frequency: "daily"|"weekly"|"monthly", days?: boolean[], endDate?: string }

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId])
  @@index([userId, dueDate])
  @@index([userId, status])
}

// ==========================================
// CALENDAR EVENTS (Eventos manuales + Google Calendar)
// ==========================================
model CalendarEvent {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  googleEventId   String?   @unique // ID del evento en Google Calendar (null si es manual)
  title           String
  description     String?
  location        String?
  startTime       DateTime
  endTime         DateTime
  allDay          Boolean   @default(false)
  color           String?
  source          String    @default("manual") // "manual" | "google"
  syncedAt        DateTime? // ultima vez que se sincronizo con Google

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId])
  @@index([userId, startTime])
  @@index([googleEventId])
}

// ==========================================
// GOOGLE CALENDAR CONNECTION
// ==========================================
model GoogleCalendarConnection {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  accessToken     String    // encriptado
  refreshToken    String    // encriptado
  tokenExpiresAt  DateTime
  calendarId      String    @default("primary") // cual calendario sincronizar
  syncEnabled     Boolean   @default(true)
  lastSyncAt      DateTime?
  syncToken       String?   // token incremental de Google para sync eficiente

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// ==========================================
// DAY SCORE (Dia Ganado/Perdido - cache calculado)
// ==========================================
model DayScore {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  date            String    // YYYY-MM-DD
  totalItems      Int       // total de items que tenia que hacer
  completedItems  Int       // cuantos completo
  percentage      Float     // 0-100
  status          String    // "won" | "partial" | "lost" | "no_data"

  // Desglose por modulo (JSON)
  habitsTotal     Int       @default(0)
  habitsCompleted Int       @default(0)
  tasksTotal      Int       @default(0)
  tasksCompleted  Int       @default(0)
  nutritionLogged Boolean   @default(false)
  exerciseLogged  Boolean   @default(false)
  reflectionLogged Boolean  @default(false)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@unique([userId, date])
  @@index([userId, date])
  @@index([userId, status])
}
```

**Agregar relaciones al modelo User existente:**
```prisma
model User {
  // ... campos existentes ...

  // Nuevas relaciones
  tasks                    Task[]
  calendarEvents           CalendarEvent[]
  googleCalendarConnection GoogleCalendarConnection?
  dayScores                DayScore[]
}
```

**Agregar nueva XpAction al enum existente:**
```typescript
// En el enum XpAction agregar:
TASK_COMPLETE = "task_complete",
DAY_WON = "day_won",
DAY_PARTIAL = "day_partial",
WIN_STREAK_BONUS = "win_streak_bonus"
```

---

### 1.2 Migracion de Base de Datos

```bash
# Generar migracion
npx prisma migrate dev --name add_tasks_calendar_dayscores

# En produccion
npx prisma migrate deploy
```

---

### 1.3 Modulo de Tasks (NestJS)

**Estructura de archivos:**
```
src/
  tasks/
    tasks.module.ts
    tasks.controller.ts
    tasks.service.ts
    dto/
      create-task.dto.ts
      update-task.dto.ts
```

**DTOs:**

```typescript
// create-task.dto.ts
export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  dueDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  dueTime?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsObject()
  recurrenceRule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    days?: boolean[];
    endDate?: string;
  };
}

// update-task.dto.ts
export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsIn(['pending', 'in_progress', 'completed'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}
```

**Controller - Endpoints:**

```typescript
// tasks.controller.ts
@Controller('api/tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // GET /api/tasks - Obtener todas las tareas del usuario
  // Query params opcionales: ?date=YYYY-MM-DD&status=pending&category=work
  @Get()
  async findAll(
    @Request() req,
    @Query('date') date?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('from') from?: string,    // rango de fechas
    @Query('to') to?: string,
  ) {
    return this.tasksService.findAll(req.user.id, { date, status, category, from, to });
  }

  // GET /api/tasks/:id - Obtener tarea por ID
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.tasksService.findOne(req.user.id, id);
  }

  // POST /api/tasks - Crear tarea
  @Post()
  async create(@Request() req, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(req.user.id, dto);
  }

  // PUT /api/tasks/:id - Actualizar tarea
  @Put(':id')
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(req.user.id, id, dto);
  }

  // DELETE /api/tasks/:id - Eliminar tarea
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return this.tasksService.remove(req.user.id, id);
  }

  // POST /api/tasks/:id/toggle - Marcar como completada/pendiente
  @Post(':id/toggle')
  async toggle(@Request() req, @Param('id') id: string) {
    return this.tasksService.toggle(req.user.id, id);
  }

  // PUT /api/tasks/reorder - Reordenar tareas
  @Put('reorder')
  async reorder(@Request() req, @Body() body: { taskIds: string[] }) {
    return this.tasksService.reorder(req.user.id, body.taskIds);
  }
}
```

**Service - Logica de negocio:**

```typescript
// tasks.service.ts
@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private xpService: XpService,
  ) {}

  async findAll(userId: string, filters: {
    date?: string;
    status?: string;
    category?: string;
    from?: string;
    to?: string;
  }) {
    const where: any = { userId };

    if (filters.date) {
      where.dueDate = filters.date;
    }
    if (filters.from && filters.to) {
      where.dueDate = { gte: filters.from, lte: filters.to };
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.category) {
      where.category = filters.category;
    }

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { priority: 'desc' }, // urgent primero
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return { success: true, data: tasks };
  }

  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, userId },
    });
    if (!task) throw new NotFoundException('Task not found');
    return { success: true, data: task };
  }

  async create(userId: string, dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate,
        dueTime: dto.dueTime,
        priority: dto.priority || 'medium',
        category: dto.category,
        tags: dto.tags ? JSON.stringify(dto.tags) : null,
        isRecurring: dto.isRecurring || false,
        recurrenceRule: dto.recurrenceRule ? JSON.stringify(dto.recurrenceRule) : null,
      },
    });

    return { success: true, data: task };
  }

  async update(userId: string, id: string, dto: UpdateTaskDto) {
    const existing = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Task not found');

    const data: any = { ...dto };
    if (dto.tags) data.tags = JSON.stringify(dto.tags);
    if (dto.recurrenceRule) data.recurrenceRule = JSON.stringify(dto.recurrenceRule);

    // Si se marca como completada, setear completedAt
    if (dto.completed === true && !existing.completed) {
      data.completedAt = new Date();
      data.status = 'completed';
    }
    if (dto.completed === false) {
      data.completedAt = null;
      data.status = 'pending';
    }

    const task = await this.prisma.task.update({
      where: { id },
      data,
    });

    return { success: true, data: task };
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Task not found');

    await this.prisma.task.delete({ where: { id } });
    return { success: true, message: 'Task deleted' };
  }

  async toggle(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException('Task not found');

    const nowCompleted = !task.completed;

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        completed: nowCompleted,
        completedAt: nowCompleted ? new Date() : null,
        status: nowCompleted ? 'completed' : 'pending',
      },
    });

    // Dar XP al completar
    if (nowCompleted) {
      const xpAmount = task.priority === 'urgent' ? 20 : task.priority === 'high' ? 15 : 10;
      await this.xpService.addXp(userId, {
        action: 'task_complete',
        xpAmount,
        description: `Tarea completada: ${task.title}`,
        metadata: { taskId: id, priority: task.priority },
      });
    }

    return { success: true, data: updated };
  }

  async reorder(userId: string, taskIds: string[]) {
    const updates = taskIds.map((id, index) =>
      this.prisma.task.updateMany({
        where: { id, userId },
        data: { order: index },
      })
    );
    await this.prisma.$transaction(updates);
    return { success: true, message: 'Tasks reordered' };
  }
}
```

---

### 1.4 Modulo de Calendar Events (NestJS)

**Estructura de archivos:**
```
src/
  calendar/
    calendar.module.ts
    calendar.controller.ts
    calendar.service.ts
    google-calendar.service.ts
    dto/
      create-event.dto.ts
      update-event.dto.ts
```

**DTOs:**

```typescript
// create-event.dto.ts
export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsDateString()
  startTime: string; // ISO 8601

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  syncToGoogle?: boolean; // si crear tambien en Google Calendar
}

// update-event.dto.ts
export class UpdateEventDto extends PartialType(CreateEventDto) {}
```

**Controller - Endpoints:**

```typescript
// calendar.controller.ts
@Controller('api/calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly googleCalendarService: GoogleCalendarService,
  ) {}

  // GET /api/calendar/events - Obtener eventos
  // Query: ?from=YYYY-MM-DD&to=YYYY-MM-DD
  @Get('events')
  async getEvents(
    @Request() req,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.calendarService.getEvents(req.user.id, from, to);
  }

  // POST /api/calendar/events - Crear evento
  @Post('events')
  async createEvent(@Request() req, @Body() dto: CreateEventDto) {
    return this.calendarService.createEvent(req.user.id, dto);
  }

  // PUT /api/calendar/events/:id - Actualizar evento
  @Put('events/:id')
  async updateEvent(@Request() req, @Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.calendarService.updateEvent(req.user.id, id, dto);
  }

  // DELETE /api/calendar/events/:id - Eliminar evento
  @Delete('events/:id')
  async deleteEvent(@Request() req, @Param('id') id: string) {
    return this.calendarService.deleteEvent(req.user.id, id);
  }

  // ==========================================
  // GOOGLE CALENDAR
  // ==========================================

  // GET /api/calendar/google/auth-url - Obtener URL de autorizacion OAuth2
  @Get('google/auth-url')
  async getGoogleAuthUrl(@Request() req) {
    return this.googleCalendarService.getAuthUrl(req.user.id);
  }

  // POST /api/calendar/google/callback - Procesar callback de OAuth2
  @Post('google/callback')
  async googleCallback(@Request() req, @Body() body: { code: string }) {
    return this.googleCalendarService.handleCallback(req.user.id, body.code);
  }

  // POST /api/calendar/google/sync - Forzar sincronizacion
  @Post('google/sync')
  async syncGoogle(@Request() req) {
    return this.googleCalendarService.sync(req.user.id);
  }

  // DELETE /api/calendar/google/disconnect - Desconectar Google Calendar
  @Delete('google/disconnect')
  async disconnectGoogle(@Request() req) {
    return this.googleCalendarService.disconnect(req.user.id);
  }

  // GET /api/calendar/google/status - Estado de la conexion
  @Get('google/status')
  async googleStatus(@Request() req) {
    return this.googleCalendarService.getStatus(req.user.id);
  }
}
```

**Google Calendar Service:**

```typescript
// google-calendar.service.ts
import { google } from 'googleapis';

@Injectable()
export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;

  constructor(private prisma: PrismaService) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI, // ej: https://api-navi-tracker.../api/calendar/google/callback
    );
  }

  async getAuthUrl(userId: string) {
    const url = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.readonly',
              'https://www.googleapis.com/auth/calendar.events'],
      state: userId, // para identificar al usuario en el callback
      prompt: 'consent', // forzar refresh token
    });
    return { success: true, data: { url } };
  }

  async handleCallback(userId: string, code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);

    // Guardar/actualizar conexion
    await this.prisma.googleCalendarConnection.upsert({
      where: { userId },
      create: {
        userId,
        accessToken: this.encrypt(tokens.access_token),
        refreshToken: this.encrypt(tokens.refresh_token),
        tokenExpiresAt: new Date(tokens.expiry_date),
      },
      update: {
        accessToken: this.encrypt(tokens.access_token),
        refreshToken: tokens.refresh_token
          ? this.encrypt(tokens.refresh_token)
          : undefined,
        tokenExpiresAt: new Date(tokens.expiry_date),
      },
    });

    // Sincronizar inmediatamente
    await this.sync(userId);

    return { success: true, message: 'Google Calendar connected' };
  }

  async sync(userId: string) {
    const connection = await this.prisma.googleCalendarConnection.findUnique({
      where: { userId },
    });
    if (!connection) throw new NotFoundException('Google Calendar not connected');

    // Configurar client con tokens del usuario
    this.oauth2Client.setCredentials({
      access_token: this.decrypt(connection.accessToken),
      refresh_token: this.decrypt(connection.refreshToken),
    });

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    // Traer eventos de los proximos 30 dias
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
      calendarId: connection.calendarId || 'primary',
      timeMin: now.toISOString(),
      timeMax: thirtyDaysLater.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      syncToken: connection.syncToken || undefined,
    });

    const events = response.data.items || [];

    // Upsert cada evento
    for (const event of events) {
      if (event.status === 'cancelled') {
        // Eliminar evento cancelado
        await this.prisma.calendarEvent.deleteMany({
          where: { googleEventId: event.id, userId },
        });
        continue;
      }

      const startTime = event.start?.dateTime || event.start?.date;
      const endTime = event.end?.dateTime || event.end?.date;
      const allDay = !event.start?.dateTime;

      await this.prisma.calendarEvent.upsert({
        where: { googleEventId: event.id },
        create: {
          userId,
          googleEventId: event.id,
          title: event.summary || '(Sin titulo)',
          description: event.description,
          location: event.location,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          allDay,
          source: 'google',
          syncedAt: new Date(),
        },
        update: {
          title: event.summary || '(Sin titulo)',
          description: event.description,
          location: event.location,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          allDay,
          syncedAt: new Date(),
        },
      });
    }

    // Guardar syncToken para proxima sync incremental
    if (response.data.nextSyncToken) {
      await this.prisma.googleCalendarConnection.update({
        where: { userId },
        data: {
          syncToken: response.data.nextSyncToken,
          lastSyncAt: new Date(),
        },
      });
    }

    return { success: true, message: `Synced ${events.length} events` };
  }

  async disconnect(userId: string) {
    // Eliminar conexion y todos los eventos de Google
    await this.prisma.calendarEvent.deleteMany({
      where: { userId, source: 'google' },
    });
    await this.prisma.googleCalendarConnection.delete({
      where: { userId },
    });
    return { success: true, message: 'Google Calendar disconnected' };
  }

  async getStatus(userId: string) {
    const connection = await this.prisma.googleCalendarConnection.findUnique({
      where: { userId },
    });
    return {
      success: true,
      data: {
        connected: !!connection,
        syncEnabled: connection?.syncEnabled ?? false,
        lastSyncAt: connection?.lastSyncAt,
        calendarId: connection?.calendarId,
      },
    };
  }

  // Helpers de encriptacion (usar crypto de Node.js)
  private encrypt(text: string): string {
    // Implementar con crypto.createCipheriv usando process.env.ENCRYPTION_KEY
    // AES-256-GCM recomendado
    return text; // placeholder
  }

  private decrypt(text: string): string {
    // Implementar con crypto.createDecipheriv
    return text; // placeholder
  }
}
```

**Variables de entorno necesarias para Google Calendar:**
```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_REDIRECT_URI=https://api-navi-tracker.luciano-yomayel.com/api/calendar/google/callback
ENCRYPTION_KEY=una-clave-de-32-bytes-para-aes256
```

**Pasos para configurar en Google Cloud Console:**
1. Ir a https://console.cloud.google.com
2. Crear proyecto o usar existente
3. Habilitar "Google Calendar API"
4. Crear credenciales OAuth 2.0 (Web Application)
5. Agregar redirect URI autorizada
6. Copiar Client ID y Client Secret al .env

---

### 1.5 Modulo de Day Score (NestJS)

**Estructura de archivos:**
```
src/
  day-score/
    day-score.module.ts
    day-score.controller.ts
    day-score.service.ts
```

**Controller - Endpoints:**

```typescript
// day-score.controller.ts
@Controller('api/day-score')
@UseGuards(JwtAuthGuard)
export class DayScoreController {
  constructor(private readonly dayScoreService: DayScoreService) {}

  // GET /api/day-score/:date - Obtener score de un dia especifico
  @Get(':date')
  async getByDate(@Request() req, @Param('date') date: string) {
    return this.dayScoreService.getOrCalculate(req.user.id, date);
  }

  // GET /api/day-score/range/:from/:to - Obtener scores de un rango (para el calendario mensual)
  @Get('range/:from/:to')
  async getRange(
    @Request() req,
    @Param('from') from: string,
    @Param('to') to: string,
  ) {
    return this.dayScoreService.getRange(req.user.id, from, to);
  }

  // POST /api/day-score/:date/recalculate - Forzar recalculo
  @Post(':date/recalculate')
  async recalculate(@Request() req, @Param('date') date: string) {
    return this.dayScoreService.calculate(req.user.id, date);
  }

  // GET /api/day-score/stats/monthly - Estadisticas mensuales
  // Query: ?month=2026-03
  @Get('stats/monthly')
  async monthlyStats(@Request() req, @Query('month') month: string) {
    return this.dayScoreService.getMonthlyStats(req.user.id, month);
  }

  // GET /api/day-score/stats/streak - Racha actual de dias ganados
  @Get('stats/streak')
  async winStreak(@Request() req) {
    return this.dayScoreService.getWinStreak(req.user.id);
  }
}
```

**Service - Logica de calculo:**

```typescript
// day-score.service.ts
@Injectable()
export class DayScoreService {
  constructor(
    private prisma: PrismaService,
    private xpService: XpService,
  ) {}

  // Calcular el score de un dia basado en TODOS los modulos
  async calculate(userId: string, date: string): Promise<DayScore> {
    // 1. HABITOS: Cuantos habitos tenia que hacer ese dia y cuantos completo
    const dayOfWeek = new Date(date + 'T12:00:00').getDay(); // 0=Dom, 1=Lun...
    // Convertir a indice del array days[] donde 0=Lunes
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const activities = await this.prisma.activity.findMany({
      where: {
        userId,
        archived: false,
        createdAt: { lte: new Date(date + 'T23:59:59') },
      },
      include: {
        completions: {
          where: { date },
        },
      },
    });

    // Filtrar solo las actividades programadas para ese dia
    const scheduledActivities = activities.filter(a => {
      const days = typeof a.days === 'string' ? JSON.parse(a.days) : a.days;
      return days[dayIndex] === true;
    });

    const habitsTotal = scheduledActivities.length;
    const habitsCompleted = scheduledActivities.filter(a =>
      a.completions.some(c => c.completed)
    ).length;

    // 2. TAREAS: Tareas con dueDate para ese dia
    const tasks = await this.prisma.task.findMany({
      where: { userId, dueDate: date },
    });
    const tasksTotal = tasks.length;
    const tasksCompleted = tasks.filter(t => t.completed).length;

    // 3. NUTRICION: Si registro al menos una comida
    const nutritionCount = await this.prisma.nutritionAnalysis.count({
      where: { userId, date },
    });
    const nutritionLogged = nutritionCount > 0;

    // 4. EJERCICIO: Si registro actividad fisica
    const exerciseCount = await this.prisma.physicalActivity.count({
      where: { userId, date },
    });
    const exerciseLogged = exerciseCount > 0;

    // 5. REFLEXION: Si escribio nota del dia
    const noteCount = await this.prisma.dailyNote.count({
      where: { userId: undefined, date }, // ajustar segun schema real
    });
    const reflectionLogged = noteCount > 0;

    // Calcular score total
    // Pesos: habitos y tareas cuentan por item, nutricion/ejercicio/reflexion como 1 item cada uno
    let totalItems = habitsTotal + tasksTotal;
    let completedItems = habitsCompleted + tasksCompleted;

    // Los modulos booleanos cuentan como 1 item si el usuario los usa
    // Solo contar si el usuario tiene historial de uso (no penalizar por modulos que no usa)
    const booleanModules = [
      { logged: nutritionLogged, label: 'nutrition' },
      { logged: exerciseLogged, label: 'exercise' },
      { logged: reflectionLogged, label: 'reflection' },
    ];

    // Siempre contar nutricion y ejercicio como items (son parte de organizar la vida)
    totalItems += 2; // nutricion + ejercicio
    if (nutritionLogged) completedItems += 1;
    if (exerciseLogged) completedItems += 1;

    // Reflexion es opcional, solo cuenta si el usuario suele hacerla
    // (simplificado: siempre contar)
    totalItems += 1;
    if (reflectionLogged) completedItems += 1;

    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    let status: string;
    if (totalItems === 0) status = 'no_data';
    else if (percentage === 100) status = 'won';
    else if (percentage >= 50) status = 'partial';
    else status = 'lost';

    // Guardar/actualizar en DB
    const dayScore = await this.prisma.dayScore.upsert({
      where: {
        userId_date: { userId, date },
      },
      create: {
        userId,
        date,
        totalItems,
        completedItems,
        percentage,
        status,
        habitsTotal,
        habitsCompleted,
        tasksTotal,
        tasksCompleted,
        nutritionLogged,
        exerciseLogged,
        reflectionLogged,
      },
      update: {
        totalItems,
        completedItems,
        percentage,
        status,
        habitsTotal,
        habitsCompleted,
        tasksTotal,
        tasksCompleted,
        nutritionLogged,
        exerciseLogged,
        reflectionLogged,
      },
    });

    // Dar XP si el dia esta ganado y no se dio XP antes
    if (status === 'won') {
      await this.xpService.addXp(userId, {
        action: 'day_won',
        xpAmount: 25,
        description: `Dia ganado: ${date}`,
        metadata: { date, percentage },
      });
    } else if (status === 'partial' && percentage >= 75) {
      await this.xpService.addXp(userId, {
        action: 'day_partial',
        xpAmount: 15,
        description: `Dia parcial (${percentage}%): ${date}`,
        metadata: { date, percentage },
      });
    }

    return dayScore;
  }

  async getOrCalculate(userId: string, date: string) {
    // Si el dia es hoy, siempre recalcular (datos pueden haber cambiado)
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      const score = await this.calculate(userId, date);
      return { success: true, data: score };
    }

    // Para dias pasados, buscar en cache
    const cached = await this.prisma.dayScore.findUnique({
      where: { userId_date: { userId, date } },
    });

    if (cached) {
      return { success: true, data: cached };
    }

    // Si no hay cache, calcular
    const score = await this.calculate(userId, date);
    return { success: true, data: score };
  }

  async getRange(userId: string, from: string, to: string) {
    // Para el calendario mensual: traer todos los scores del rango
    const scores = await this.prisma.dayScore.findMany({
      where: {
        userId,
        date: { gte: from, lte: to },
      },
      orderBy: { date: 'asc' },
    });

    // Para dias sin score (no calculados), calcular on-demand
    // Generar array de todas las fechas en el rango
    const allDates = this.generateDateRange(from, to);
    const scoreMap = new Map(scores.map(s => [s.date, s]));

    const today = new Date().toISOString().split('T')[0];
    const result = [];

    for (const date of allDates) {
      if (date > today) {
        // Dias futuros: no calcular
        result.push({ date, status: 'future', percentage: 0 });
      } else if (scoreMap.has(date)) {
        result.push(scoreMap.get(date));
      } else {
        // Calcular y cachear
        const score = await this.calculate(userId, date);
        result.push(score);
      }
    }

    return { success: true, data: result };
  }

  async getMonthlyStats(userId: string, month: string) {
    // month = "2026-03"
    const from = `${month}-01`;
    const lastDay = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate();
    const to = `${month}-${String(lastDay).padStart(2, '0')}`;

    const scores = await this.prisma.dayScore.findMany({
      where: { userId, date: { gte: from, lte: to } },
    });

    const won = scores.filter(s => s.status === 'won').length;
    const partial = scores.filter(s => s.status === 'partial').length;
    const lost = scores.filter(s => s.status === 'lost').length;
    const avgPercentage = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.percentage, 0) / scores.length)
      : 0;

    return {
      success: true,
      data: {
        month,
        totalDays: scores.length,
        won,
        partial,
        lost,
        avgPercentage,
        bestDay: scores.reduce((best, s) => s.percentage > (best?.percentage || 0) ? s : best, null),
        worstDay: scores.reduce((worst, s) => s.percentage < (worst?.percentage || 100) ? s : worst, null),
      },
    };
  }

  async getWinStreak(userId: string) {
    // Calcular racha actual de dias ganados consecutivos
    const today = new Date().toISOString().split('T')[0];
    const scores = await this.prisma.dayScore.findMany({
      where: { userId, date: { lte: today } },
      orderBy: { date: 'desc' },
      take: 365, // maximo un ano atras
    });

    let streak = 0;
    const sortedDates = scores.sort((a, b) => b.date.localeCompare(a.date));

    for (const score of sortedDates) {
      if (score.status === 'won') {
        streak++;
      } else {
        break;
      }
    }

    // Mejor racha historica
    let bestStreak = 0;
    let currentStreak = 0;
    const chronological = scores.sort((a, b) => a.date.localeCompare(b.date));
    for (const score of chronological) {
      if (score.status === 'won') {
        currentStreak++;
        bestStreak = Math.max(bestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return {
      success: true,
      data: {
        currentStreak: streak,
        bestStreak,
        lastWonDate: sortedDates.find(s => s.status === 'won')?.date,
      },
    };
  }

  private generateDateRange(from: string, to: string): string[] {
    const dates: string[] = [];
    const current = new Date(from + 'T12:00:00');
    const end = new Date(to + 'T12:00:00');

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }
}
```

---

### 1.6 Registrar Nuevos Modulos en app.module.ts

```typescript
// app.module.ts - agregar imports
import { TasksModule } from './tasks/tasks.module';
import { CalendarModule } from './calendar/calendar.module';
import { DayScoreModule } from './day-score/day-score.module';

@Module({
  imports: [
    // ... modulos existentes ...
    TasksModule,
    CalendarModule,
    DayScoreModule,
  ],
})
export class AppModule {}
```

**Dependencias npm a instalar en el backend:**
```bash
npm install googleapis
# googleapis incluye el cliente de Google Calendar
```

---

### 1.7 Recalculo Automatico del Day Score

El Day Score debe recalcularse cada vez que cambia algo en los modulos. Opciones:

**Opcion A (recomendada): Recalculo on-demand**
- Cuando el frontend pide el score del dia actual, siempre recalcular
- Para dias pasados, usar cache (ya calculado)

**Opcion B: Event-driven**
- Agregar un hook en cada service (completions, tasks, nutrition, etc.) que recalcule el DayScore despues de cada accion
- Mas preciso en tiempo real, pero mas complejo

**Recomendacion:** Empezar con Opcion A, migrar a B si el usuario necesita tiempo real.

---

## PARTE 2: FRONTEND (Next.js + React)

### 2.1 Nuevos Tipos (`src/types/index.ts`)

```typescript
// ==========================================
// TASKS
// ==========================================
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskCategory = 'work' | 'personal' | 'health' | 'finance' | 'study' | 'other';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority: TaskPriority;
  status: TaskStatus;
  completed: boolean;
  completedAt?: string;
  category?: TaskCategory;
  tags?: string[];
  order: number;
  isRecurring: boolean;
  recurrenceRule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    days?: boolean[];
    endDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// CALENDAR EVENTS
// ==========================================
export interface CalendarEvent {
  id: string;
  userId: string;
  googleEventId?: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  color?: string;
  source: 'manual' | 'google';
  syncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleCalendarStatus {
  connected: boolean;
  syncEnabled: boolean;
  lastSyncAt?: string;
  calendarId?: string;
}

// ==========================================
// DAY SCORE
// ==========================================
export type DayStatus = 'won' | 'partial' | 'lost' | 'no_data' | 'future';

export interface DayScore {
  id?: string;
  date: string;
  totalItems: number;
  completedItems: number;
  percentage: number;
  status: DayStatus;
  habitsTotal: number;
  habitsCompleted: number;
  tasksTotal: number;
  tasksCompleted: number;
  nutritionLogged: boolean;
  exerciseLogged: boolean;
  reflectionLogged: boolean;
}

export interface MonthlyStats {
  month: string;
  totalDays: number;
  won: number;
  partial: number;
  lost: number;
  avgPercentage: number;
  bestDay?: DayScore;
  worstDay?: DayScore;
}

export interface WinStreak {
  currentStreak: number;
  bestStreak: number;
  lastWonDate?: string;
}
```

---

### 2.2 API Client (`src/lib/api-client.ts`)

Agregar al objeto `api` existente:

```typescript
export const api = {
  // ... endpoints existentes ...

  // TASKS
  tasks: {
    getAll: (params?: { date?: string; status?: string; category?: string; from?: string; to?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return apiClient.get<Task[]>(`/tasks${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => apiClient.get<Task>(`/tasks/${id}`),
    create: (data: Partial<Task>) => apiClient.post<Task>('/tasks', data),
    update: (id: string, data: Partial<Task>) => apiClient.put<Task>(`/tasks/${id}`, data),
    delete: (id: string) => apiClient.delete(`/tasks/${id}`),
    toggle: (id: string) => apiClient.post<Task>(`/tasks/${id}/toggle`),
    reorder: (taskIds: string[]) => apiClient.put('/tasks/reorder', { taskIds }),
  },

  // CALENDAR
  calendar: {
    getEvents: (from: string, to: string) =>
      apiClient.get<CalendarEvent[]>(`/calendar/events?from=${from}&to=${to}`),
    createEvent: (data: Partial<CalendarEvent>) =>
      apiClient.post<CalendarEvent>('/calendar/events', data),
    updateEvent: (id: string, data: Partial<CalendarEvent>) =>
      apiClient.put<CalendarEvent>(`/calendar/events/${id}`, data),
    deleteEvent: (id: string) =>
      apiClient.delete(`/calendar/events/${id}`),
    // Google Calendar
    google: {
      getAuthUrl: () => apiClient.get<{ url: string }>('/calendar/google/auth-url'),
      callback: (code: string) => apiClient.post('/calendar/google/callback', { code }),
      sync: () => apiClient.post('/calendar/google/sync'),
      disconnect: () => apiClient.delete('/calendar/google/disconnect'),
      getStatus: () => apiClient.get<GoogleCalendarStatus>('/calendar/google/status'),
    },
  },

  // DAY SCORE
  dayScore: {
    getByDate: (date: string) => apiClient.get<DayScore>(`/day-score/${date}`),
    getRange: (from: string, to: string) =>
      apiClient.get<DayScore[]>(`/day-score/range/${from}/${to}`),
    recalculate: (date: string) => apiClient.post<DayScore>(`/day-score/${date}/recalculate`),
    getMonthlyStats: (month: string) =>
      apiClient.get<MonthlyStats>(`/day-score/stats/monthly?month=${month}`),
    getWinStreak: () => apiClient.get<WinStreak>('/day-score/stats/streak'),
  },
};
```

---

### 2.3 Store de Zustand (`src/store/index.ts`)

Agregar al store existente `useNaviTrackerStore`:

```typescript
// Agregar al interface NaviTrackerState:
interface NaviTrackerState {
  // ... estado existente ...

  // TASKS
  tasks: Task[];
  tasksLoading: boolean;
  fetchTasks: (params?: { date?: string; status?: string }) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  reorderTasks: (taskIds: string[]) => Promise<void>;

  // CALENDAR EVENTS
  calendarEvents: CalendarEvent[];
  calendarEventsLoading: boolean;
  fetchCalendarEvents: (from: string, to: string) => Promise<void>;
  createCalendarEvent: (data: Partial<CalendarEvent>) => Promise<void>;
  updateCalendarEvent: (id: string, data: Partial<CalendarEvent>) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;

  // GOOGLE CALENDAR
  googleCalendarStatus: GoogleCalendarStatus | null;
  fetchGoogleCalendarStatus: () => Promise<void>;
  syncGoogleCalendar: () => Promise<void>;
  disconnectGoogleCalendar: () => Promise<void>;

  // DAY SCORE
  dayScores: DayScore[];
  dayScoresLoading: boolean;
  currentDayScore: DayScore | null;
  winStreak: WinStreak | null;
  monthlyStats: MonthlyStats | null;
  fetchDayScore: (date: string) => Promise<void>;
  fetchDayScoreRange: (from: string, to: string) => Promise<void>;
  fetchWinStreak: () => Promise<void>;
  fetchMonthlyStats: (month: string) => Promise<void>;
  recalculateDayScore: (date: string) => Promise<void>;
}

// Implementacion de las acciones (dentro del create):
{
  // TASKS
  tasks: [],
  tasksLoading: false,

  fetchTasks: async (params) => {
    set({ tasksLoading: true });
    try {
      const res = await api.tasks.getAll(params);
      if (res.success) set({ tasks: res.data });
    } catch (e) { console.error(e); }
    set({ tasksLoading: false });
  },

  createTask: async (data) => {
    try {
      const res = await api.tasks.create(data);
      if (res.success) {
        set(state => ({ tasks: [...state.tasks, res.data] }));
        toast({ title: 'Tarea creada' });
      }
    } catch (e) { toast({ title: 'Error', description: e.message, variant: 'destructive' }); }
  },

  updateTask: async (id, data) => {
    try {
      const res = await api.tasks.update(id, data);
      if (res.success) {
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? res.data : t)
        }));
      }
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  },

  deleteTask: async (id) => {
    try {
      const res = await api.tasks.delete(id);
      if (res.success) {
        set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
        toast({ title: 'Tarea eliminada' });
      }
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  },

  toggleTask: async (id) => {
    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed, status: !t.completed ? 'completed' : 'pending' } : t
      )
    }));
    try {
      const res = await api.tasks.toggle(id);
      if (res.success) {
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? res.data : t)
        }));
        if (res.data.completed) {
          toast({ title: 'Tarea completada! +XP' });
        }
      }
    } catch (e) {
      // Revert optimistic update
      set(state => ({
        tasks: state.tasks.map(t =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      }));
    }
  },

  reorderTasks: async (taskIds) => {
    try { await api.tasks.reorder(taskIds); } catch (e) { console.error(e); }
  },

  // CALENDAR
  calendarEvents: [],
  calendarEventsLoading: false,

  fetchCalendarEvents: async (from, to) => {
    set({ calendarEventsLoading: true });
    try {
      const res = await api.calendar.getEvents(from, to);
      if (res.success) set({ calendarEvents: res.data });
    } catch (e) { console.error(e); }
    set({ calendarEventsLoading: false });
  },

  createCalendarEvent: async (data) => {
    try {
      const res = await api.calendar.createEvent(data);
      if (res.success) {
        set(state => ({ calendarEvents: [...state.calendarEvents, res.data] }));
        toast({ title: 'Evento creado' });
      }
    } catch (e) { toast({ title: 'Error', variant: 'destructive' }); }
  },

  // ... updateCalendarEvent y deleteCalendarEvent siguen el mismo patron ...

  // GOOGLE CALENDAR
  googleCalendarStatus: null,

  fetchGoogleCalendarStatus: async () => {
    try {
      const res = await api.calendar.google.getStatus();
      if (res.success) set({ googleCalendarStatus: res.data });
    } catch (e) { console.error(e); }
  },

  syncGoogleCalendar: async () => {
    try {
      await api.calendar.google.sync();
      toast({ title: 'Google Calendar sincronizado' });
      // Re-fetch events
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      get().fetchCalendarEvents(today, thirtyDaysLater);
    } catch (e) { toast({ title: 'Error al sincronizar', variant: 'destructive' }); }
  },

  // DAY SCORE
  dayScores: [],
  dayScoresLoading: false,
  currentDayScore: null,
  winStreak: null,
  monthlyStats: null,

  fetchDayScore: async (date) => {
    try {
      const res = await api.dayScore.getByDate(date);
      if (res.success) set({ currentDayScore: res.data });
    } catch (e) { console.error(e); }
  },

  fetchDayScoreRange: async (from, to) => {
    set({ dayScoresLoading: true });
    try {
      const res = await api.dayScore.getRange(from, to);
      if (res.success) set({ dayScores: res.data });
    } catch (e) { console.error(e); }
    set({ dayScoresLoading: false });
  },

  fetchWinStreak: async () => {
    try {
      const res = await api.dayScore.getWinStreak();
      if (res.success) set({ winStreak: res.data });
    } catch (e) { console.error(e); }
  },

  fetchMonthlyStats: async (month) => {
    try {
      const res = await api.dayScore.getMonthlyStats(month);
      if (res.success) set({ monthlyStats: res.data });
    } catch (e) { console.error(e); }
  },

  recalculateDayScore: async (date) => {
    try {
      const res = await api.dayScore.recalculate(date);
      if (res.success) {
        set(state => ({
          dayScores: state.dayScores.map(d => d.date === date ? res.data : d),
          currentDayScore: state.currentDayScore?.date === date ? res.data : state.currentDayScore,
        }));
      }
    } catch (e) { console.error(e); }
  },
}
```

---

### 2.4 Nuevas Paginas y Componentes

#### Pagina de Tasks: `src/app/(app)/tasks/page.tsx`

```
Componentes necesarios:
├── src/components/tasks/TaskList.tsx          - Lista principal de tareas
│   ├── Filtros: Hoy / Esta semana / Todas / Por categoria
│   ├── Ordenar: Por prioridad / Por fecha / Manual (drag)
│   └── Barra de progreso del dia (X de Y completadas)
│
├── src/components/tasks/TaskItem.tsx          - Item individual
│   ├── Checkbox para toggle completar
│   ├── Titulo (tachado si completado)
│   ├── Badge de prioridad (colores: rojo=urgente, naranja=alta, azul=media, gris=baja)
│   ├── Fecha limite
│   ├── Categoria badge
│   └── Menu contextual (editar, eliminar, cambiar prioridad)
│
├── src/components/tasks/AddTaskModal.tsx      - Modal crear tarea
│   ├── Campo titulo (obligatorio)
│   ├── Campo descripcion (opcional)
│   ├── Selector de fecha (date picker)
│   ├── Selector de hora (opcional)
│   ├── Selector de prioridad (4 opciones)
│   ├── Selector de categoria
│   ├── Tags input
│   └── Toggle recurrente + config
│
├── src/components/tasks/EditTaskModal.tsx     - Modal editar tarea
│   └── Mismos campos que AddTaskModal pre-llenados
│
└── src/components/tasks/TasksWidget.tsx       - Widget para Dashboard
    ├── Mini lista de tareas de hoy
    ├── Contador: 3/5 completadas
    └── Link a pagina completa
```

#### Pagina de Agenda: `src/app/(app)/agenda/page.tsx`

```
Componentes necesarios:
├── src/components/agenda/DailyAgenda.tsx      - Vista principal
│   ├── Selector de fecha (flechas izq/der + hoy)
│   ├── Timeline vertical del dia (7am - 11pm)
│   │   ├── Eventos de Google Calendar (bloques coloreados)
│   │   ├── Tareas del dia (con checkbox inline)
│   │   └── Habitos programados (del modulo existente)
│   │
│   ├── Seccion "Registro del dia"
│   │   ├── Comidas registradas (links al modulo nutricion)
│   │   ├── Actividad fisica (link al modulo existente)
│   │   └── Reflexion del dia (link al modulo existente)
│   │
│   └── Barra de progreso "Dia Ganado"
│       ├── Porcentaje en tiempo real
│       ├── Color segun el heatmap (verde/amarillo/rojo)
│       └── Desglose: "5/7 habitos - 3/4 tareas - Comida OK - Ejercicio pendiente"
│
└── src/components/agenda/AgendaWidget.tsx     - Widget para Dashboard
    ├── Proximos 3 eventos/tareas
    └── Indicador de progreso del dia
```

#### Pagina de Calendario: `src/app/(app)/calendar/page.tsx`

```
Componentes necesarios:
├── src/components/calendar/MonthlyCalendar.tsx   - Grilla mensual principal
│   ├── Header: < Febrero 2026  Marzo 2026  Abril 2026 >
│   ├── Dias de la semana: Lu Ma Mi Ju Vi Sa Do
│   ├── Celdas del mes:
│   │   ├── Cada celda = un dia
│   │   ├── Fondo coloreado segun DayScore:
│   │   │   ├── #22c55e (verde fuerte) = 100% (DIA GANADO)
│   │   │   ├── #86efac (verde claro) = 75-99%
│   │   │   ├── #facc15 (amarillo) = 50-74%
│   │   │   ├── #ef4444 (rojo) = <50% (DIA PERDIDO)
│   │   │   └── #374151 (gris) = sin datos
│   │   ├── Numero del dia en la esquina
│   │   ├── Mini indicadores (iconos chiquitos de habitos/tareas/comida)
│   │   └── Click abre DayDetailModal
│   │
│   └── Footer: Estadisticas del mes
│       ├── "15 dias ganados | 5 parciales | 3 perdidos"
│       ├── "Promedio: 78%"
│       └── "Racha actual: 5 dias"
│
├── src/components/calendar/DayScoreIndicator.tsx - Celda individual
│   ├── Color de fondo segun porcentaje
│   ├── Numero del dia
│   ├── Tooltip con preview al hover
│   └── onClick -> abre DayDetailModal
│
├── src/components/calendar/DayDetailModal.tsx    - Modal al clickear un dia
│   ├── Fecha y estado (DIA GANADO / PERDIDO / PARCIAL)
│   ├── Score: "85% completado (6 de 7 items)"
│   ├── Desglose:
│   │   ├── Habitos: [v] Meditar [v] Ejercicio [x] Leer [v] Estudiar
│   │   ├── Tareas: [v] Presentacion trabajo [v] Pagar factura [x] Llamar medico
│   │   ├── Nutricion: Registrado (3 comidas) / No registrado
│   │   ├── Ejercicio: Registrado (45 min, 8000 pasos) / No registrado
│   │   └── Reflexion: Registrada / No registrada
│   ├── Comparacion con promedio del mes
│   └── Notas/reflexion del dia (si existe)
│
├── src/components/calendar/MonthSummary.tsx       - Stats del mes
│   ├── Grafico de barras (dias ganados vs perdidos por semana)
│   ├── Mejor/peor dia del mes
│   └── Tendencia vs mes anterior
│
├── src/components/calendar/WinStreakWidget.tsx     - Widget para Dashboard
│   ├── Racha actual de dias ganados (numero grande)
│   ├── Mejor racha historica
│   ├── Icono de fuego si racha > 3
│   └── Mini calendario del mes actual (version compacta)
│
└── src/components/calendar/GoogleCalendarSync.tsx  - Config de Google Calendar
    ├── Boton "Conectar Google Calendar"
    ├── Si conectado: ultimo sync, boton re-sync, boton desconectar
    └── Selector de calendario (si tiene varios)
```

---

### 2.5 Navegacion - Actualizar Layout

**Archivo:** `src/app/(app)/layout.tsx`

Agregar al menu de navegacion:
```typescript
// Nuevos items de navegacion
{ href: '/tasks', label: 'Tareas', icon: CheckSquare },    // lucide-react
{ href: '/agenda', label: 'Agenda', icon: CalendarClock },  // lucide-react
{ href: '/calendar', label: 'Calendario', icon: Calendar },  // lucide-react
```

---

### 2.6 Dashboard - Nuevos Widgets

Agregar a la pagina de dashboard existente:

1. **TasksWidget** - "Tareas de hoy: 3/5 completadas" + mini lista
2. **AgendaWidget** - "Proximos eventos" + timeline mini
3. **WinStreakWidget** - "Racha: 5 dias" + mini heatmap del mes
4. **DayProgressWidget** - Barra circular con % del dia actual

---

## PARTE 3: RESUMEN DE ENDPOINTS

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| `GET` | `/api/tasks` | Listar tareas (filtros: date, status, category, from, to) |
| `GET` | `/api/tasks/:id` | Obtener tarea por ID |
| `POST` | `/api/tasks` | Crear tarea |
| `PUT` | `/api/tasks/:id` | Actualizar tarea |
| `DELETE` | `/api/tasks/:id` | Eliminar tarea |
| `POST` | `/api/tasks/:id/toggle` | Toggle completar/descompletar |
| `PUT` | `/api/tasks/reorder` | Reordenar tareas |
| `GET` | `/api/calendar/events` | Listar eventos (from, to) |
| `POST` | `/api/calendar/events` | Crear evento |
| `PUT` | `/api/calendar/events/:id` | Actualizar evento |
| `DELETE` | `/api/calendar/events/:id` | Eliminar evento |
| `GET` | `/api/calendar/google/auth-url` | URL de autorizacion Google |
| `POST` | `/api/calendar/google/callback` | Callback OAuth2 |
| `POST` | `/api/calendar/google/sync` | Forzar sync |
| `DELETE` | `/api/calendar/google/disconnect` | Desconectar |
| `GET` | `/api/calendar/google/status` | Estado conexion |
| `GET` | `/api/day-score/:date` | Score de un dia |
| `GET` | `/api/day-score/range/:from/:to` | Scores de un rango |
| `POST` | `/api/day-score/:date/recalculate` | Forzar recalculo |
| `GET` | `/api/day-score/stats/monthly` | Stats mensuales |
| `GET` | `/api/day-score/stats/streak` | Racha de wins |

---

## PARTE 4: ORDEN DE IMPLEMENTACION

### Backend:
1. Agregar tablas al schema de Prisma + migrar
2. Modulo Tasks (CRUD + toggle + XP)
3. Modulo Calendar Events (CRUD basico)
4. Modulo Google Calendar (OAuth + sync)
5. Modulo Day Score (calculo + cache + stats + streak)
6. Agregar nuevas XpActions al modulo XP existente

### Frontend:
1. Agregar tipos a `src/types/index.ts`
2. Agregar endpoints a `src/lib/api-client.ts`
3. Agregar state/actions al store Zustand
4. Crear pagina de Tasks + componentes
5. Crear pagina de Agenda + componentes
6. Crear pagina de Calendario (heatmap) + componentes
7. Integrar Google Calendar (boton conectar + sync)
8. Agregar widgets al Dashboard
9. Actualizar navegacion en layout

---

## PARTE 5: VERIFICACION

1. **Tasks:** Crear tarea -> completarla -> verificar XP sumado
2. **Agenda:** Ver vista diaria con habitos + tareas + eventos consolidados
3. **Google Calendar:** Conectar cuenta -> ver eventos sincronizados en agenda
4. **Heatmap:** Navegar meses -> verificar colores correctos por dia
5. **Day Detail:** Clickear un dia -> ver desglose completo
6. **Streak:** Completar todo un dia -> verificar racha incrementa
7. **Dashboard:** Verificar que los nuevos widgets muestran datos correctos
