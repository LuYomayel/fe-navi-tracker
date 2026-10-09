/**
 * Filtrado de tareas. Funcion PURA (sin React) para poder razonarla y
 * testearla aparte de la UI: TaskList solo la llama desde un useMemo.
 *
 * Ejes independientes que se combinan con AND:
 *   1. cuando   -> range    (hoy / semana / vencidas / todas)
 *   2. de quien -> projects (EaseTrain, Stampia... vacio = todos)
 *   3. que      -> categories + priorities + search
 *   4. estado   -> status   (pendientes / en curso / completadas / todas)
 *
 * Y uno transversal: los proyectos EN PAUSA no aparecen en ningun lado,
 * salvo que se elija ese proyecto a mano o se active "mostrar pausados".
 * Es lo que saca el ruido de un proyecto que hoy no se puede tocar.
 */
import type { Task, TaskCategory, TaskPriority } from "@/types";

export type DateRange = "today" | "week" | "overdue" | "all";
export type StatusFilter = "all" | "pending" | "in_progress" | "completed";

export interface TaskFilters {
  range: DateRange;
  status: StatusFilter;
  projects: string[]; // projectKey(); NO_PROJECT = sin proyecto; vacio = todos
  showPaused: boolean;
  categories: TaskCategory[]; // vacio = todas
  priorities: TaskPriority[]; // vacio = todas
  search: string;
}

export const EMPTY_FILTERS: TaskFilters = {
  range: "today",
  status: "all",
  projects: [],
  showPaused: false,
  categories: [],
  priorities: [],
  search: "",
};

/** Clave del chip "Sin proyecto". */
export const NO_PROJECT = "__none__";

/** Comparacion sin mayusculas: "PulpoU" y "Pulpou" son el mismo proyecto. */
export function projectKey(p: string | null | undefined): string {
  const k = (p ?? "").trim().toLowerCase();
  return k || NO_PROJECT;
}

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
  if (status === "in_progress")
    return !task.completed && task.status === "in_progress";
  if (status === "completed") return task.completed;
  return true;
}

function byOrderThenPriority(a: Task, b: Task): number {
  if (a.completed !== b.completed) return a.completed ? 1 : -1;
  // Lo que esta en curso va arriba de lo pendiente.
  const ap = a.status === "in_progress" ? 0 : 1;
  const bp = b.status === "in_progress" ? 0 : 1;
  if (ap !== bp) return ap - bp;
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

/**
 * Una tarea queda oculta por pausa si su proyecto esta pausado y no se pidio
 * verla: ni con "mostrar pausados" ni eligiendo ese proyecto en los chips.
 */
function hiddenByPause(
  task: Task,
  filters: TaskFilters,
  paused: Set<string>,
): boolean {
  if (filters.showPaused || paused.size === 0) return false;
  const key = projectKey(task.project);
  return paused.has(key) && !filters.projects.includes(key);
}

export function filterTasks(
  tasks: Task[],
  filters: TaskFilters,
  today: string,
  weekEnd: string,
  pausedProjects: string[] = [],
): Task[] {
  // Si el usuario pidio explicitamente la categoria de fondo, no la escondemos.
  const hideBacklog = !filters.categories.includes(BACKLOG_CATEGORY);
  const paused = new Set(pausedProjects.map(projectKey));

  return tasks
    .filter(
      (t) =>
        !hiddenByPause(t, filters, paused) &&
        matchesRange(t, filters.range, today, weekEnd, hideBacklog) &&
        matchesStatus(t, filters.status) &&
        (filters.projects.length === 0 ||
          filters.projects.includes(projectKey(t.project))) &&
        (filters.categories.length === 0 ||
          (!!t.category && filters.categories.includes(t.category))) &&
        (filters.priorities.length === 0 ||
          filters.priorities.includes(t.priority)) &&
        matchesSearch(t, filters.search),
    )
    .sort(byOrderThenPriority);
}

export interface ProjectCount {
  key: string;
  label: string;
  count: number;
  paused: boolean;
}

/**
 * Proyectos que existen en las tareas, con cuantas caerian en cada uno segun
 * los OTROS filtros. Los pausados se cuentan igual (para decir "EaseTrain:
 * 10 ocultas"). Orden: mas tareas primero, "Sin proyecto" al final.
 */
export function countByProject(
  tasks: Task[],
  filters: TaskFilters,
  today: string,
  weekEnd: string,
  pausedProjects: string[] = [],
): ProjectCount[] {
  const paused = new Set(pausedProjects.map(projectKey));
  const labels = new Map<string, string>();
  for (const t of tasks) {
    const key = projectKey(t.project);
    if (!labels.has(key)) {
      labels.set(key, key === NO_PROJECT ? "Sin proyecto" : t.project!.trim());
    }
  }

  const out: ProjectCount[] = [];
  for (const [key, label] of labels) {
    const count = filterTasks(
      tasks,
      { ...filters, projects: [key] },
      today,
      weekEnd,
      pausedProjects,
    ).length;
    out.push({ key, label, count, paused: paused.has(key) });
  }
  return out.sort((a, b) => {
    if (a.key === NO_PROJECT) return 1;
    if (b.key === NO_PROJECT) return -1;
    return b.count - a.count || a.label.localeCompare(b.label);
  });
}

/** Nombres de proyecto existentes (para sugerir al crear/editar). */
export function knownProjects(tasks: Task[]): string[] {
  const byKey = new Map<string, string>();
  for (const t of tasks) {
    const key = projectKey(t.project);
    if (key !== NO_PROJECT && !byKey.has(key)) byKey.set(key, t.project!.trim());
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b));
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
  pausedProjects: string[] = [],
): Map<TaskCategory, number> {
  const counts = new Map<TaskCategory, number>();
  for (const cat of Object.keys(CATEGORY_META) as TaskCategory[]) {
    const n = filterTasks(
      tasks,
      { ...filters, categories: [cat] },
      today,
      weekEnd,
      pausedProjects,
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
  pausedProjects: string[] = [],
): number {
  return filterTasks(
    tasks,
    { ...filters, categories: [] },
    today,
    weekEnd,
    pausedProjects,
  )
    .filter((t) => !t.category).length;
}

export function activeFilterCount(filters: TaskFilters): number {
  return (
    filters.projects.length +
    (filters.showPaused ? 1 : 0) +
    filters.categories.length +
    filters.priorities.length +
    (filters.search.trim() ? 1 : 0) +
    (filters.status !== "all" ? 1 : 0)
  );
}

/** Como el filtro de rango "hoy", sin los proyectos en pausa: el progreso del dia. */
export function todayTasksFor(
  tasks: Task[],
  today: string,
  pausedProjects: string[] = [],
): Task[] {
  const paused = new Set(pausedProjects.map(projectKey));
  return tasks.filter(
    (t) =>
      !paused.has(projectKey(t.project)) &&
      (t.dueDate === today ||
        (!t.dueDate && !t.completed && t.category !== BACKLOG_CATEGORY)),
  );
}

// ── Persistencia de filtros (por dispositivo) ───────────────────
// La busqueda no se guarda: es de un momento. Todo lo demas si, para que
// volver a /tasks no te devuelva a "Hoy · todo" cada vez.
const STORAGE_KEY = "navi.tasks.filters.v1";

export function loadFilters(): TaskFilters {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_FILTERS;
    const saved = JSON.parse(raw) as Partial<TaskFilters>;
    return {
      ...EMPTY_FILTERS,
      range: saved.range ?? EMPTY_FILTERS.range,
      status: saved.status ?? EMPTY_FILTERS.status,
      projects: Array.isArray(saved.projects) ? saved.projects : [],
      showPaused: !!saved.showPaused,
      categories: Array.isArray(saved.categories) ? saved.categories : [],
      priorities: Array.isArray(saved.priorities) ? saved.priorities : [],
    };
  } catch {
    return EMPTY_FILTERS;
  }
}

export function saveFilters(filters: TaskFilters): void {
  try {
    const { search: _search, ...rest } = filters;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch {
    // modo privado / storage bloqueado: los filtros simplemente no persisten
  }
}
