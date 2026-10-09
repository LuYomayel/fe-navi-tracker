"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useNaviTrackerStore } from "@/store";
import { Task } from "@/types";
import { getDateKey } from "@/lib/utils";
import {
  filterTasks,
  countByProject,
  todayTasksFor,
  loadFilters,
  saveFilters,
  countByCategory,
  countUncategorized,
  activeFilterCount,
  getWeekEnd,
  CATEGORY_META,
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  EMPTY_FILTERS,
  type TaskFilters,
  type DateRange,
  type StatusFilter,
} from "@/lib/task-filters";
import TaskItem from "./TaskItem";
import AddTaskDialog from "./AddTaskDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, SlidersHorizontal, Search, X, Pause, FolderKanban } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

const RANGES: { key: DateRange; label: string }[] = [
  { key: "today", label: "Hoy" },
  { key: "week", label: "Semana" },
  { key: "overdue", label: "Vencidas" },
  { key: "all", label: "Todas" },
];

const STATUSES: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendientes" },
  { key: "in_progress", label: "En curso" },
  { key: "completed", label: "Completadas" },
];

const STATUS_LABEL: Record<StatusFilter, string> = {
  all: "Todas",
  pending: "Pendientes",
  in_progress: "En curso",
  completed: "Completadas",
};

/** Chip redondeado. Es el unico control de filtro de la pantalla. */
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium whitespace-nowrap transition-all active:scale-[0.97] ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
    >
      {children}
    </button>
  );
}

export default function TaskList() {
  const {
    tasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    reorderTasks,
    projects,
    fetchProjects,
    setProjectStatus,
  } = useNaviTrackerStore();
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS);
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  // Los filtros se restauran despues del mount (localStorage no existe en SSR)
  // y recien ahi se empiezan a guardar, para no pisarlos con los vacios.
  useEffect(() => {
    setFilters(loadFilters());
    setFiltersLoaded(true);
    fetchProjects();
  }, [fetchProjects]);
  useEffect(() => {
    if (filtersLoaded) saveFilters(filters);
  }, [filters, filtersLoaded]);
  const [showPanel, setShowPanel] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const today = getDateKey(new Date());
  const weekEnd = useMemo(() => getWeekEnd(new Date()), []);

  const filteredTasks = useMemo(
    () => filterTasks(tasks, filters, today, weekEnd),
    [tasks, filters, today, weekEnd],
  );

  // Chips de proyecto: los activos van en la fila principal; los pausados
  // solo se nombran abajo ("EaseTrain en pausa · 10 ocultas").
  const projectCounts = useMemo(
    () => countByProject(tasks, projects, filters, today, weekEnd),
    [tasks, projects, filters, today, weekEnd],
  );
  const activeProjects = projectCounts.filter(
    (p) => !p.paused || filters.showPaused || filters.projects.includes(p.key),
  );
  const pausedHere = projectCounts.filter(
    (p) => p.paused && !filters.projects.includes(p.key),
  );
  const hiddenByPause = filters.showPaused
    ? 0
    : pausedHere.reduce((n, p) => n + p.count, 0);
  const pausedCount = projects.filter((p) => p.status === "paused").length;

  // Solo se ofrecen las categorias que EXISTEN en las tareas, con cuantas
  // caen en cada una segun los demas filtros. Un chip nunca lleva a una
  // lista vacia, y se ve de una si algo esta sin categorizar.
  const categoryCounts = useMemo(
    () => countByCategory(tasks, filters, today, weekEnd),
    [tasks, filters, today, weekEnd],
  );
  const uncategorized = useMemo(
    () => countUncategorized(tasks, filters, today, weekEnd),
    [tasks, filters, today, weekEnd],
  );

  const activeCount = activeFilterCount(filters);

  const patch = useCallback(
    (p: Partial<TaskFilters>) => setFilters((f) => ({ ...f, ...p })),
    [],
  );
  const toggleIn = useCallback(
    <T,>(list: T[], value: T): T[] =>
      list.includes(value) ? list.filter((x) => x !== value) : [...list, value],
    [],
  );

  const todayTasks = todayTasksFor(tasks, today);
  const todayCompleted = todayTasks.filter((t) => t.completed).length;
  const todayProgress =
    todayTasks.length > 0
      ? Math.round((todayCompleted / todayTasks.length) * 100)
      : 0;

  const clearFilters = () =>
    setFilters((f) => ({ ...EMPTY_FILTERS, range: f.range }));

  const toggleInProgress = (task: Task) =>
    updateTask(task.id, {
      status: task.status === "in_progress" ? "pending" : "in_progress",
    });

  const handleSave = async (data: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
    setEditingTask(null);
  };

  // Drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = filteredTasks.findIndex((t) => t.id === active.id);
      const newIndex = filteredTasks.findIndex((t) => t.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(filteredTasks, oldIndex, newIndex);
      reorderTasks(reordered.map((t) => t.id));
    },
    [filteredTasks, reorderTasks],
  );

  const taskIds = useMemo(() => filteredTasks.map((t) => t.id), [filteredTasks]);

  return (
    <div className="space-y-4">
      {/* Progreso de hoy */}
      <div className="bg-card rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Progreso de hoy</span>
          <span className="text-muted-foreground text-sm">
            {todayCompleted}/{todayTasks.length} completadas
          </span>
        </div>
        <Progress value={todayProgress} className="h-2" />
      </div>

      {/* Cuando: rango de fechas + nueva tarea */}
      <div className="flex items-center justify-between gap-2">
        <div className="scrollbar-hide flex min-w-0 gap-1 overflow-x-auto py-0.5">
          {RANGES.map((r) => (
            <Chip
              key={r.key}
              active={filters.range === r.key}
              onClick={() => patch({ range: r.key })}
            >
              {r.label}
            </Chip>
          ))}
        </div>
        <Button asChild variant="outline" size="sm" className="h-8 shrink-0 px-2.5">
          <Link href="/proyectos" aria-label="Proyectos">
            <FolderKanban className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          size="sm"
          className="h-8 shrink-0"
          onClick={() => {
            setEditingTask(null);
            setShowAddDialog(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Nueva
        </Button>
      </div>

      {/* De quien: proyectos. Es el filtro de todos los dias, por eso esta
          siempre visible y no escondido en el panel. */}
      {activeProjects.length > 1 && (
        <div className="scrollbar-hide -mx-1 flex gap-1 overflow-x-auto px-1 py-0.5">
          <Chip
            active={filters.projects.length === 0}
            onClick={() => patch({ projects: [] })}
          >
            Todos
          </Chip>
          {activeProjects.map((p) => (
            <Chip
              key={p.key}
              active={filters.projects.includes(p.key)}
              onClick={() =>
                patch({ projects: toggleIn(filters.projects, p.key) })
              }
            >
              {p.paused && "⏸ "}
              {p.emoji ? `${p.emoji} ` : ""}
              {p.label} <span className="opacity-70">{p.count}</span>
            </Chip>
          ))}
        </div>
      )}

      {/* Buscador + acceso al panel */}
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
          <Input
            value={filters.search}
            onChange={(e) => patch({ search: e.target.value })}
            placeholder="Buscar (ej: stampia, pulpou)"
            className="h-9 pr-8 pl-8 text-sm"
            aria-label="Buscar tareas por texto"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => patch({ search: "" })}
              aria-label="Limpiar la busqueda"
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant={showPanel ? "default" : "outline"}
          size="sm"
          className="h-9 shrink-0"
          onClick={() => setShowPanel((v) => !v)}
          aria-expanded={showPanel}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeCount > 0 && (
            <span className="bg-primary text-primary-foreground ml-1.5 rounded-full px-1.5 text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {/* Panel de filtros */}
      {showPanel && (
        <div className="bg-card space-y-3 rounded-lg border p-3">
          <div>
            <p className="text-muted-foreground mb-1.5 text-[11px] font-medium">
              Estado
            </p>
            <div className="flex flex-wrap gap-1">
              {STATUSES.map((s) => (
                <Chip
                  key={s.key}
                  active={filters.status === s.key}
                  onClick={() => patch({ status: s.key })}
                >
                  {s.label}
                </Chip>
              ))}
            </div>
          </div>

          {categoryCounts.size > 0 && (
            <div>
              <p className="text-muted-foreground mb-1.5 text-[11px] font-medium">
                Categoría
              </p>
              <div className="flex flex-wrap gap-1">
                {[...categoryCounts.entries()].map(([cat, n]) => (
                  <Chip
                    key={cat}
                    active={filters.categories.includes(cat)}
                    onClick={() =>
                      patch({
                        categories: toggleIn(filters.categories, cat),
                      })
                    }
                  >
                    {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label} ({n})
                  </Chip>
                ))}
              </div>
              {uncategorized > 0 && (
                <p className="text-muted-foreground mt-1.5 text-[11px]">
                  {uncategorized} sin categoría (no salen en ningún chip)
                </p>
              )}
            </div>
          )}

          <div>
            <p className="text-muted-foreground mb-1.5 text-[11px] font-medium">
              Prioridad
            </p>
            <div className="flex flex-wrap gap-1">
              {PRIORITY_ORDER.map((p) => (
                <Chip
                  key={p}
                  active={filters.priorities.includes(p)}
                  onClick={() =>
                    patch({ priorities: toggleIn(filters.priorities, p) })
                  }
                >
                  {PRIORITY_LABELS[p]}
                </Chip>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            {pausedCount > 0 ? (
              <label className="text-muted-foreground flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={filters.showPaused}
                  onChange={(e) => patch({ showPaused: e.target.checked })}
                  className="accent-primary h-4 w-4"
                />
                Mostrar tareas de proyectos pausados
              </label>
            ) : (
              <span />
            )}
            <Link
              href="/proyectos"
              className="text-primary shrink-0 text-xs font-medium hover:underline"
            >
              Gestionar proyectos →
            </Link>
          </div>

          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full text-xs"
              onClick={clearFilters}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {/* Resumen de lo que esta filtrando + cuantas quedaron */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-muted-foreground text-xs">
          {filteredTasks.length}{" "}
          {filteredTasks.length === 1 ? "tarea" : "tareas"}
        </span>
        {!showPanel &&
          filters.categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() =>
                patch({ categories: toggleIn(filters.categories, cat) })
              }
              className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
            >
              {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}
              <X className="h-3 w-3" />
            </button>
          ))}
        {!showPanel &&
          filters.priorities.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() =>
                patch({ priorities: toggleIn(filters.priorities, p) })
              }
              className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
            >
              {PRIORITY_LABELS[p]}
              <X className="h-3 w-3" />
            </button>
          ))}
        {!showPanel && filters.status !== "all" && (
          <button
            type="button"
            onClick={() => patch({ status: "all" })}
            className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
          >
            {STATUS_LABEL[filters.status]}
            <X className="h-3 w-3" />
          </button>
        )}
        {hiddenByPause > 0 && (
          <button
            type="button"
            onClick={() => patch({ showPaused: true })}
            className="text-muted-foreground hover:text-foreground ml-auto flex items-center gap-1 text-[11px] underline-offset-2 hover:underline"
          >
            <Pause className="h-3 w-3" />
            {pausedHere
              .filter((p) => p.count > 0)
              .map((p) => p.label)
              .join(", ")}{" "}
            en pausa · {hiddenByPause} oculta{hiddenByPause === 1 ? "" : "s"}
          </button>
        )}
        {filters.showPaused && pausedCount > 0 && (
          <button
            type="button"
            onClick={() => patch({ showPaused: false })}
            className="bg-amber-500/15 flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-amber-700 dark:text-amber-400"
          >
            Mostrando pausadas
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            <p className="text-sm">
              {activeCount > 0
                ? "Ninguna tarea coincide con estos filtros"
                : filters.range === "today"
                  ? "No hay tareas para hoy"
                  : filters.range === "overdue"
                    ? "No hay tareas vencidas"
                    : "No hay tareas"}
            </p>
            {activeCount > 0 ? (
              <Button variant="link" className="mt-2" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : (
              <Button
                variant="link"
                className="mt-2"
                onClick={() => {
                  setEditingTask(null);
                  setShowAddDialog(true);
                }}
              >
                Crear una tarea
              </Button>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={taskIds}
              strategy={verticalListSortingStrategy}
            >
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setShowAddDialog(true);
                  }}
                  onDelete={deleteTask}
                  onToggleInProgress={toggleInProgress}
                  onPauseProject={(id) => setProjectStatus(id, "paused")}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <AddTaskDialog
        isOpen={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setEditingTask(null);
        }}
        onSave={handleSave}
        editingTask={editingTask}
        defaultProjectId={
          filters.projects.length === 1 && filters.projects[0] !== "__none__"
            ? filters.projects[0]
            : undefined
        }
      />
    </div>
  );
}
