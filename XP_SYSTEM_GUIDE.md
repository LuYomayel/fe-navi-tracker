# 🎮 Sistema de Experiencia y Niveles (XP System)

## ¡Sistema gamificado completamente implementado! ✨

### 🏆 Características Principales

#### 1. **Progresión de Niveles Inteligente**

- **Nivel 1**: 100 XP
- **Nivel 2**: 220 XP (+120)
- **Nivel 3**: 360 XP (+140)
- **Nivel 4**: 520 XP (+160)
- **Progresión**: Cada nivel requiere +20 XP adicional que el anterior

#### 2. **Sistema de Rachas con Bonus Acumulativo** 🔥

- **Día 1**: Sin bonus
- **Día 2**: +5 XP bonus
- **Día 3**: +10 XP bonus
- **Día 7**: +30 XP bonus
- **Máximo**: 50 XP de bonus por racha

#### 3. **Acciones que Otorgan XP**

- ✅ **Completar hábito**: 10 XP + bonus de racha
- 🍽️ **Registrar comida**: 5 XP
- 📝 **Reflexión diaria**: 15 XP

### 🗄️ Base de Datos

#### Nuevos Campos en el Modelo User:

```prisma
model User {
  // ... campos existentes
  level         Int      @default(1)
  xp            Int      @default(0)
  totalXp       Int      @default(0)
  streak        Int      @default(0)
  lastStreakDate String?
  xpLogs        XpLog[]
}
```

#### Nuevo Modelo XpLog:

```prisma
model XpLog {
  id          String   @id @default(cuid())
  userId      String   @default("default")
  action      String   // "habit_complete", "nutrition_log", etc.
  xpEarned    Int
  description String
  date        String
  metadata    Json?
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}
```

### 🚀 Backend (NestJS)

#### Módulos Implementados:

- **XpModule**: Gestión completa del sistema de XP
- **XpService**: Lógica de cálculo de niveles y rachas
- **XpController**: Endpoints REST para el frontend

#### Endpoints Disponibles:

- `GET /api/xp/stats` - Obtener estadísticas del usuario
- `POST /api/xp/habit-complete` - Agregar XP por hábito
- `POST /api/xp/nutrition-log` - Agregar XP por nutrición
- `POST /api/xp/daily-comment` - Agregar XP por reflexión

#### ✨ Integración Automática:

- **CompletionsService**: Automáticamente agrega XP al marcar hábitos
- **Autenticación**: Usa JWT para identificar usuarios
- **Sistema de Logs**: Registra toda la actividad de XP

### 🎨 Frontend (Next.js + React)

#### Componentes Creados:

- **XpBar**: Barra de progreso principal con animaciones
- **XpLogWidget**: Historial de actividad reciente
- **XpDashboard**: Vista completa con estadísticas

#### Hooks Personalizados:

- **useXp**: Gestión completa del estado de XP
  - Cargar estadísticas
  - Agregar XP por acciones
  - Notificaciones automáticas de level up
  - Cálculos de progreso

#### 🎯 Notificaciones Inteligentes:

- **Level Up**: Animación especial + toast de celebración
- **XP Ganada**: Toast con detalles de la acción
- **Racha**: Notificación de días consecutivos
- **Bonus**: Indicador visual de bonus de racha

### 📱 UI/UX Features

#### Efectos Visuales:

- ✨ **Level Up**: Animaciones con bounce y pulso
- 🔥 **Racha activa**: Badge destacado con icono de fuego
- 📊 **Barra de progreso**: Visual del % hacia siguiente nivel
- 🏆 **Logros**: Sistema de badges por acciones

#### Responsive Design:

- **Móvil**: Versión compacta de la barra de XP
- **Desktop**: Dashboard completo con estadísticas
- **Sticky Header**: Barra de XP siempre visible

### 🎮 Experiencia Gamificada

#### Psicología del Juego:

- **Progresión clara**: Siempre sabes cuánto falta para el siguiente nivel
- **Recompensas inmediatas**: XP instantánea al completar acciones
- **Rachas**: Incentiva la constancia diaria
- **Feedback visual**: Animaciones y colores que motivan

#### Sistema de Logros (Preparado para futuro):

- **Estructura**: Ya implementada para agregar achievements
- **Metadatos**: Sistema flexible para tracking de logros
- **Historial**: Completo log de todas las acciones

### 🔄 Flujo de Trabajo

1. **Usuario completa hábito** → Checkbox en WeeklyCalendar
2. **Frontend llama API** → `api.completions.toggle()`
3. **Backend procesa** → CompletionsService + XpService
4. **Cálculo automático** → Nivel, racha, bonus
5. **Respuesta al frontend** → Nuevos datos de XP
6. **UI se actualiza** → Barra de progreso + notificaciones
7. **Log guardado** → Historial para analytics

### 🚀 Próximos Pasos Sugeridos

#### Características Avanzadas:

- **Enemigos**: Sistema de desafíos personales
- **Logros**: Badges por metas específicas
- **Tienda**: Recompensas canjeables con XP
- **Social**: Comparar progreso con amigos
- **Eventos**: Bonus temporales de XP
- **Estadísticas**: Gráficos de progreso histórico

#### Optimizaciones:

- **Cache**: Redis para estadísticas frecuentes
- **Batch processing**: Procesar múltiples XP juntas
- **Analytics**: Tracking detallado de engagement
- **A/B Testing**: Diferentes sistemas de recompensas

### 🛠️ Comandos de Desarrollo

```bash
# Backend
cd backend
npm run start:dev

# Frontend
npm run dev

# Base de datos
cd backend
npx prisma db push
npx prisma studio
```

### 📊 Métricas de Éxito

- ✅ **Retención**: Users regresan por las rachas
- ✅ **Engagement**: Más hábitos completados
- ✅ **Motivación**: Feedback positivo inmediato
- ✅ **Progresión**: Sensación clara de avance

---

## 🎉 ¡El sistema está 100% funcional y listo para hacer que los hábitos sean adictivos como un videojuego!

**Características implementadas:**

- ✅ Niveles progresivos
- ✅ Sistema de rachas
- ✅ Bonus acumulativos
- ✅ Notificaciones gamificadas
- ✅ UI responsiva y hermosa
- ✅ Integración automática
- ✅ Sistema de logs completo
- ✅ Base para futuras expansiones

¡Tu aplicación de hábitos ahora es oficialmente un RPG! 🎮✨
