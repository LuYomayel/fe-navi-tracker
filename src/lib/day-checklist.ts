// Checklist del día (pantalla /foco): qué de lo básico falta hoy y a dónde ir.
// Lógica pura, sin store ni fetch, para poder testearla (day-checklist.test.ts).

export const VENTAS_COURSE_URL = "https://platzi.com/mis-rutas/17222033/";

export type ChecklistItemId = "comida" | "agua" | "habitos" | "tareas" | "curso";

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
}

export interface ChecklistItem {
  id: ChecklistItemId;
  label: string;
  detail: string;
  done: boolean;
  href: string;
  external?: boolean;
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

  if (input.course?.scheduledToday) {
    items.push({
      id: "curso",
      label: "Clase de ventas",
      detail: input.course.done ? "Clase de hoy hecha" : "1 clase de la ruta Ventas",
      done: input.course.done,
      href: VENTAS_COURSE_URL,
      external: true,
    });
  }

  // Pendientes arriba; dentro de cada grupo se mantiene el orden de arriba.
  return [...items.filter((i) => !i.done), ...items.filter((i) => i.done)];
}
