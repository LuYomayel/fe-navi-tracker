/**
 * Filtrado de tareas. Funcion PURA (sin React) para poder razonarla y
 * testearla aparte de la UI: TaskList solo la llama desde un useMemo.
 *
 * Tres ejes independientes que se combinan con AND:
 *   1. cuando  -> range   (hoy / semana / vencidas / todas)
 *   2. que     -> categories + priorities + search
 *   3. estado  -> status  (pendientes / completadas / todas)
 */
import type { Task, TaskCategory, TaskPriority } from "@/types";

export type DateRange = "today" | "week" | "overdue" | "all";
export type StatusFilter = "all" | "pending" | "completed";

export interface TaskFilters {
  range: DateRange;
  status: StatusFilter;
  categories: TaskCategory[]; // vacio = todas
  priorities: TaskPriority[]; // vacio = todas
  search: string;
}

export const EMPTY_FILTERS: TaskFilters = {
  range: "today",
  status: "all",
  categories: [],
  priorities: [],
  search: "",
};

/** Categoria "de fondo": el roadmap NZ no debe ensuciar el dia a dia. */
const BACKLOG_CATEGORY: TaskCategory = "nz";

/** Fuente unica de los nombres de categoria (los usan los chips y TaskItem). */
export const CATEGORY_META: Record<TaskCategory, { label: string; emoji: string }> = {
  work: { label: "Trabajo", emoji: "💼" },
  personal: { label: "Personal", emoji: "🏠" },
  health: { label: "Salud", emoji: "🩺" },
  finance: { label: "Finanzas", emoji: "💰" },
  study: { label: "Estudio", emoji: "📚" },
  other: { label: "Otro", emoji: "📦" },
  nz: { label: "NZ", emoji: "🇳🇿" },
};

export function categoryLabel(c: TaskCategory): string {
  return CATEGORY_META[c]?.label ?? c;
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: "Urgente",
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

/** Orden de mayor a menor, para los chips y el sort. */
export const PRIORITY_ORDER: TaskPriority[] = ["urgent", "high", "medium", "low"];

/** minusculas y sin acentos: buscar "auditoria" tiene que encontrar "Auditoría". */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Texto donde busca el buscador. Incluye los tags porque el titulo suele
 * llevar el proyecto adelante ("Stampia - ...", "PulpoU - ...") y asi
 * buscar "stampia" alcanza para ver todo lo de ese proyecto.
 */
function haystack(t: Task): string {
  return normalize(
    [t.title, t.description ?? "", ...(t.tags ?? [])].join(" "),
  );
}

export function matchesSearch(task: Task, search: string): boolean {
  const q = normalize(search).trim();
  if (!q) return true;
  // Todos los terminos tienen que aparecer (AND), en cualquier orden.
  const hay = haystack(task);
  return q.split(/\s+/).every((term) => hay.includes(term));
}

function matchesRange(
  task: Task,
  range: DateRange,
  today: string,
  weekEnd: string,
  hideBacklog: boolean,
): boolean {
  // Una tarea sin fecha es "pendiente de siempre": entra en hoy y en la
  // semana, salvo que sea del backlog de fondo (NZ) y no lo hayan pedido.
  const floating =
    !task.dueDate &&
    !task.completed &&
    !(hideBacklog && task.category === BACKLOG_CATEGORY);

  switch (range) {
    case "today":
      return task.dueDate === today || floating;
    case "week":
      return (
        (!!task.dueDate && task.dueDate >= today && task.dueDate <= weekEnd) ||
        floating
      );
    case "overdue":
      return !!task.dueDate && task.dueDate < today && !task.completed;
    case "all":
      return true;
  }
}

function matchesStatus(task: Task, status: StatusFilter): boolean {
  if (status === "pending") return !task.completed;
  if (status === "completed") return task.completed;
  return true;
}

function byOrderThenPriority(a: Task, b: Task): number {
  if (a.completed !== b.completed) return a.completed ? 1 : -1;
  if (a.order !== b.order) return a.order - b.order;
  return (
    PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
  );
}

/** Fin de la semana en curso (domingo), en formato YYYY-MM-DD. */
export function getWeekEnd(today: Date): string {
  const d = new Date(today);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? 0 : 7 - day));
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export function filterTasks(
  tasks: Task[],
  filters: TaskFilters,
  today: string,
  weekEnd: string,
): Task[] {
  // Si el usuario pidio explicitamente la categoria de fondo, no la escondemos.
  const hideBacklog = !filters.categories.includes(BACKLOG_CATEGORY);

  return tasks
    .filter(
      (t) =>
        matchesRange(t, filters.range, today, weekEnd, hideBacklog) &&
        matchesStatus(t, filters.status) &&
        (filters.categories.length === 0 ||
          (!!t.category && filters.categories.includes(t.category))) &&
        (filters.priorities.length === 0 ||
          filters.priorities.includes(t.priority)) &&
        matchesSearch(t, filters.search),
    )
    .sort(byOrderThenPriority);
}

/**
 * Cuantas tareas caerian en cada categoria con los OTROS filtros aplicados.
 * Sirve para mostrar el numero en el chip y para no ofrecer categorias que
 * no existen en los datos (si nunca cargaste "study", el chip no aparece).
 */
export function countByCategory(
  tasks: Task[],
  filters: TaskFilters,
  today: string,
  weekEnd: string,
): Map<TaskCategory, number> {
  const counts = new Map<TaskCategory, number>();
  for (const cat of Object.keys(CATEGORY_META) as TaskCategory[]) {
    const n = filterTasks(
      tasks,
      { ...filters, categories: [cat] },
      today,
      weekEnd,
    ).length;
    if (n > 0) counts.set(cat, n);
  }
  return counts;
}

/** Cuantas tareas quedan sin categoria (con los otros filtros aplicados). */
export function countUncategorized(
  tasks: Task[],
  filters: TaskFilters,
  today: string,
  weekEnd: string,
): number {
  return filterTasks(tasks, { ...filters, categories: [] }, today, weekEnd)
    .filter((t) => !t.category).length;
}

export function activeFilterCount(filters: TaskFilters): number {
  return (
    filters.categories.length +
    filters.priorities.length +
    (filters.search.trim() ? 1 : 0) +
    (filters.status !== "all" ? 1 : 0)
  );
}
