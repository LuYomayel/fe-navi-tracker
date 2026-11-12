// Checklist del día (pantalla /foco): qué de lo básico falta hoy y a dónde ir.
// Lógica pura, sin store ni fetch, para poder testearla (day-checklist.test.ts).

export const VENTAS_COURSE_URL = "https://platzi.com/mis-rutas/17222033/";

export type ChecklistItemId =
  | "comida"
  | "agua"
  | "habitos"
  | "tareas"
  | "ejercicio"
  | "curso"
  | "ventas-mensajes"
  | "reflexion";

export const VENTAS_MENSAJES_KEY = "ventas-mensajes";
export const VENTAS_MENSAJES_URL = "https://web.whatsapp.com/";
export const VENTAS_MENSAJES_GOAL = 5;
// La práctica de ventas (5 mensajes/día) arranca el lunes 16-nov-2026.
const VENTAS_PRACTICE_START = new Date(2026, 10, 16);
const REFLECTION_FROM_HOUR = 20;

export interface ChecklistHabit {
  id: string;
  name: string;
  done: boolean;
}

export interface DayChecklistInput {
  now: Date;
  mealsToday: number;
  glasses: number;
  waterGoal: number;
  /** Hábitos que tocan hoy, SIN el del curso */
  habits: ChecklistHabit[];
  tasksPending: number;
  tasksTotal: number;
  /** Hábito "Clase de ventas" (null si no existe) */
  course: { id: string; scheduledToday: boolean; done: boolean } | null;
  /** undefined = no se muestra */
  exerciseLogged?: boolean;
  reflectionLogged?: boolean;
  /** Mensajes de venta del día; null/undefined = práctica no activa hoy */
  ventasMensajes?: number | null;
}

export interface ChecklistItem {
  id: ChecklistItemId;
  label: string;
  detail: string;
  done: boolean;
  href: string;
  external?: boolean;
  /** Se puede seguir abriendo aunque esté hecho (ej. Platzi tras marcar la clase) */
  alwaysOpen?: boolean;
}

// Desayuno 10hs, almuerzo 14hs, merienda 18hs, cena 22hs: a partir de esa hora
// ya debería estar cargada.
const MEAL_DEADLINES = [10, 14, 18, 22];

export function expectedMeals(now: Date): number {
  const h = now.getHours() + now.getMinutes() / 60;
  return MEAL_DEADLINES.filter((deadline) => h >= deadline).length;
}

// El agua se reparte parejo entre las 8 y las 22.
const WATER_START = 8;
const WATER_END = 22;

export function expectedGlasses(now: Date, goal: number): number {
  const h = now.getHours() + now.getMinutes() / 60;
  const ratio = Math.min(1, Math.max(0, (h - WATER_START) / (WATER_END - WATER_START)));
  return Math.round(goal * ratio);
}

export function buildDayChecklist(input: DayChecklistInput): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  const mealsDue = expectedMeals(input.now);
  items.push({
    id: "comida",
    label: "Cargar comida",
    detail:
      mealsDue === 0
        ? `${input.mealsToday} cargadas · todavía no toca`
        : `${input.mealsToday} de ${mealsDue} cargadas`,
    done: input.mealsToday >= mealsDue,
    href: "/salud?tab=comidas&log=1",
  });

  const glassesDue = expectedGlasses(input.now, input.waterGoal);
  items.push({
    id: "agua",
    label: "Tomar agua",
    detail: `${input.glasses}/${input.waterGoal} vasos · a esta hora ${glassesDue}`,
    done: input.glasses >= glassesDue,
    href: "/salud?tab=agua",
  });

  if (input.habits.length > 0) {
    const done = input.habits.filter((h) => h.done).length;
    items.push({
      id: "habitos",
      label: "Hábitos",
      detail: `${done}/${input.habits.length}`,
      done: done === input.habits.length,
      href: "/habitos",
    });
  }

  if (input.tasksTotal > 0) {
    items.push({
      id: "tareas",
      label: "Tareas de hoy",
      detail: `${input.tasksTotal - input.tasksPending}/${input.tasksTotal}`,
      done: input.tasksPending === 0,
      href: "/tasks",
    });
  }

  if (input.exerciseLogged !== undefined) {
    items.push({
      id: "ejercicio",
      label: "Entrenar",
      detail: input.exerciseLogged ? "Actividad registrada" : "Registrá lo que entrenaste hoy",
      done: input.exerciseLogged,
      href: "/salud?tab=ejercicio",
    });
  }

  if (input.course?.scheduledToday) {
    items.push({
      id: "curso",
      label: "Clase de ventas",
      detail: input.course.done ? "Clase de hoy hecha" : "1 clase de la ruta Ventas",
      done: input.course.done,
      href: VENTAS_COURSE_URL,
      external: true,
      alwaysOpen: true,
    });
  }

  if (input.ventasMensajes != null) {
    items.push({
      id: "ventas-mensajes",
      label: "Mensajes de venta",
      detail: `${input.ventasMensajes}/${VENTAS_MENSAJES_GOAL} mensajes`,
      done: input.ventasMensajes >= VENTAS_MENSAJES_GOAL,
      href: VENTAS_MENSAJES_URL,
      external: true,
    });
  }

  if (
    input.reflectionLogged === true ||
    (input.reflectionLogged === false && input.now.getHours() >= REFLECTION_FROM_HOUR)
  ) {
    items.push({
      id: "reflexion",
      label: "Reflexión del día",
      detail: input.reflectionLogged ? "Hecha" : "Cerrá el día: cómo te fue",
      done: input.reflectionLogged,
      href: "/habitos",
    });
  }

  // Pendientes arriba; dentro de cada grupo se mantiene el orden de arriba.
  return [...items.filter((i) => !i.done), ...items.filter((i) => i.done)];
}

export function ventasPracticeActive(now: Date): boolean {
  const dow = now.getDay();
  return now >= VENTAS_PRACTICE_START && dow >= 1 && dow <= 5;
}

export interface NextEvent {
  title: string;
  time: string; // HH:mm
  minutesUntil: number;
}

/** Próximo evento de HOY que todavía no empezó (ignora los de todo el día). */
export function nextEvent(
  events: { title: string; startTime: string; allDay: boolean }[],
  now: Date
): NextEvent | null {
  const upcoming = events
    .filter((e) => !e.allDay)
    .map((e) => ({ title: e.title, start: new Date(e.startTime) }))
    .filter(
      (e) =>
        e.start > now &&
        e.start.getFullYear() === now.getFullYear() &&
        e.start.getMonth() === now.getMonth() &&
        e.start.getDate() === now.getDate()
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime());
  const first = upcoming[0];
  if (!first) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    title: first.title,
    time: `${pad(first.start.getHours())}:${pad(first.start.getMinutes())}`,
    minutesUntil: Math.round((first.start.getTime() - now.getTime()) / 60000),
  };
}

const CLOSED_ORDER_STATUSES = ["entregado", "cancelado"];

/** Pedidos 3D que todavía requieren algo (no entregados ni cancelados). */
export function pendingPrintOrders(orders: { status: string }[]): number {
  return orders.filter((o) => !CLOSED_ORDER_STATUSES.includes(o.status)).length;
}

// ── Lo más importante ahora ──

export interface TopTaskInput {
  id: string;
  title: string;
  dueDate?: string;
  priority: string;
  status: string;
  completed: boolean;
  project?: string | null;
  projectStatus?: string | null;
}

export interface TopTask {
  id: string;
  title: string;
  project?: string | null;
  reason: string;
}

const PRIORITY_WEIGHT: Record<string, number> = { urgent: 3, high: 2, medium: 1, low: 0 };
const PRIORITY_LABEL: Record<string, string> = {
  urgent: "urgente",
  high: "alta",
  medium: "media",
  low: "baja",
};
const SOON_DAYS = 7;

function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86400000);
}

/**
 * La tarea que más pesa ahora: primero lo vencido o que vence en los próximos
 * 7 días (la fecha más cercana gana); si no hay, la de mayor prioridad, y a
 * igual prioridad la que ya está en curso.
 */
export function pickTopTask(tasks: TopTaskInput[], today: string): TopTask | null {
  const open = tasks.filter(
    (t) => !t.completed && t.projectStatus !== "paused" && t.projectStatus !== "archived"
  );
  const weight = (t: TopTaskInput) => PRIORITY_WEIGHT[t.priority] ?? 0;

  const soon = open
    .filter((t) => t.dueDate && daysBetween(today, t.dueDate.slice(0, 10)) <= SOON_DAYS)
    .sort(
      (a, b) =>
        a.dueDate!.slice(0, 10).localeCompare(b.dueDate!.slice(0, 10)) || weight(b) - weight(a)
    );
  if (soon[0]) {
    const t = soon[0];
    const d = daysBetween(today, t.dueDate!.slice(0, 10));
    const reason =
      d < 0
        ? `Vencida hace ${-d} ${d === -1 ? "día" : "días"}`
        : d === 0
          ? "Vence hoy"
          : d === 1
            ? "Vence mañana"
            : `Vence en ${d} días`;
    return { id: t.id, title: t.title, project: t.project, reason };
  }

  const inProgress = (t: TopTaskInput) => (t.status === "in_progress" ? 1 : 0);
  const byPriority = [...open].sort(
    (a, b) => weight(b) - weight(a) || inProgress(b) - inProgress(a)
  );
  const t = byPriority[0];
  if (!t) return null;
  return {
    id: t.id,
    title: t.title,
    project: t.project,
    reason: `Prioridad ${PRIORITY_LABEL[t.priority] ?? t.priority}${
      t.status === "in_progress" ? " · en curso" : ""
    }`,
  };
}

// ── Tiempo recuperado: lo manda el hook de Claude Code en la URL (?min=&veces=) ──

export function parseWaitStats(search: string): { minutes: number; count: number } | null {
  const p = new URLSearchParams(search);
  const minutes = Number(p.get("min"));
  const count = Number(p.get("veces"));
  if (!Number.isFinite(minutes) || !Number.isFinite(count) || count <= 0 || minutes < 0) {
    return null;
  }
  return { minutes: Math.round(minutes), count: Math.round(count) };
}
