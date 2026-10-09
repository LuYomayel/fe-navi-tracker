"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MoreVertical,
  Pencil,
  Pause,
  Play,
  Archive,
  ArchiveRestore,
  Trash2,
  Plus,
  Flag,
} from "lucide-react";
import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Milestone, Task } from "@/types";
import { useNaviTrackerStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PROJECT_STATUS_LABEL, shortDate } from "@/lib/project-ui";
import { getDateKey } from "@/lib/utils";
import { PRIORITY_ORDER } from "@/lib/task-filters";
import TaskItem from "@/components/tasks/TaskItem";
import AddTaskDialog from "@/components/tasks/AddTaskDialog";
import ProjectDialog from "./ProjectDialog";
import MilestoneDialog from "./MilestoneDialog";
import { ProgressBar, StatsLine } from "./ProjectsOverview";

/** Pendientes primero (por fecha, despues prioridad); hechas al final. */
function sortTasks(a: Task, b: Task): number {
  if (a.completed !== b.completed) return a.completed ? 1 : -1;
  const ad = a.dueDate ?? "9999";
  const bd = b.dueDate ?? "9999";
  if (ad !== bd) return ad.localeCompare(bd);
  return PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority);
}

export default function ProjectDetail({ projectId }: { projectId: string }) {
  const router = useRouter();
  const {
    projects,
    projectsLoaded,
    tasks,
    toggleTask,
    updateTask,
    deleteTask,
    createTask,
    updateProject,
    setProjectStatus,
    deleteProject,
    createMilestone,
    updateMilestone,
    deleteMilestone,
  } = useNaviTrackerStore();

  const project = projects.find((p) => p.id === projectId);
  const [showDone, setShowDone] = useState(false);
  const [editProject, setEditProject] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [milestoneDialog, setMilestoneDialog] = useState<{
    open: boolean;
    editing?: Milestone | null;
  }>({ open: false });
  const [confirmMilestone, setConfirmMilestone] = useState<Milestone | null>(null);
  const [taskDialog, setTaskDialog] = useState<{
    open: boolean;
    editing?: Task | null;
    milestoneId?: string;
  }>({ open: false });

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.projectId === projectId).sort(sortTasks),
    [tasks, projectId],
  );
  const doneCount = projectTasks.filter((t) => t.completed).length;
  const visible = showDone ? projectTasks : projectTasks.filter((t) => !t.completed);

  if (!project) {
    return projectsLoaded ? (
      <EmptyState
        title="No encontré ese proyecto"
        action={
          <Button asChild size="sm" variant="outline">
            <Link href="/proyectos">Ver proyectos</Link>
          </Button>
        }
      />
    ) : (
      <div className="text-muted-foreground py-8 text-center text-sm">Cargando…</div>
    );
  }

  const openMilestones = project.milestones.filter((m) => !m.done);
  const doneMilestones = project.milestones.filter((m) => m.done);
  const noMilestone = visible.filter((t) => !t.milestoneId);

  const refreshAfterTaskChange = () => useNaviTrackerStore.getState().fetchProjects();

  const renderTasks = (list: Task[]) =>
    list.length === 0 ? null : (
      // TaskItem usa useSortable: necesita contexto aunque aca no se reordene.
      <DndContext>
        <SortableContext items={list.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {list.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                hideProject
                onToggle={async (id) => {
                  await toggleTask(id);
                  refreshAfterTaskChange();
                }}
                onEdit={(task) => setTaskDialog({ open: true, editing: task })}
                onDelete={async (id) => {
                  await deleteTask(id);
                  refreshAfterTaskChange();
                }}
                onToggleInProgress={(task) =>
                  updateTask(task.id, {
                    status: task.status === "in_progress" ? "pending" : "in_progress",
                  })
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );

  const renderMilestone = (m: Milestone) => {
    const mTasks = visible.filter((t) => t.milestoneId === m.id);
    const overdue = !m.done && m.dueDate && m.dueDate < getDateKey(new Date());
    return (
      <section key={m.id} className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={m.done}
            onCheckedChange={() => updateMilestone(m.id, { done: !m.done })}
            aria-label={m.done ? `Reabrir ${m.name}` : `Marcar ${m.name} como cumplido`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`truncate text-sm font-semibold ${m.done ? "text-muted-foreground line-through" : ""}`}>
                🏁 {m.name}
              </span>
              {m.dueDate && (
                <span className={`shrink-0 text-xs ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                  {shortDate(m.dueDate)}
                </span>
              )}
              <span className="text-muted-foreground ml-auto shrink-0 text-xs">
                {m.stats.done}/{m.stats.total}
              </span>
            </div>
            <div className="mt-1">
              <ProgressBar value={m.stats.progress} color={project.color} />
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" aria-label={`Opciones de ${m.name}`}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTaskDialog({ open: true, milestoneId: m.id })}>
                <Plus className="mr-2 h-4 w-4" /> Agregar tarea
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMilestoneDialog({ open: true, editing: m })}>
                <Pencil className="mr-2 h-4 w-4" /> Editar hito
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => setConfirmMilestone(m)}>
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar hito
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="pl-6">
          {renderTasks(mTasks) ?? (
            <button
              type="button"
              onClick={() => setTaskDialog({ open: true, milestoneId: m.id })}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              + Agregar tarea a este hito
            </button>
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-5">
      <Link
        href="/proyectos"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Proyectos
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[23px] leading-[29px] font-semibold tracking-[-0.01em]">
            {project.emoji ? `${project.emoji} ` : ""}
            {project.name}
          </h1>
          {project.status !== "active" && (
            <Badge variant="outline" className="mt-1 text-[10px]">
              {PROJECT_STATUS_LABEL[project.status]}
            </Badge>
          )}
          {project.description && (
            <p className="text-muted-foreground mt-1 text-sm whitespace-pre-line">{project.description}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" aria-label="Opciones del proyecto">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditProject(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            {project.status === "active" && (
              <DropdownMenuItem onClick={() => setProjectStatus(project.id, "paused")}>
                <Pause className="mr-2 h-4 w-4" /> Pausar
              </DropdownMenuItem>
            )}
            {project.status === "paused" && (
              <DropdownMenuItem onClick={() => setProjectStatus(project.id, "active")}>
                <Play className="mr-2 h-4 w-4" /> Reanudar
              </DropdownMenuItem>
            )}
            {project.status === "archived" ? (
              <DropdownMenuItem onClick={() => setProjectStatus(project.id, "active")}>
                <ArchiveRestore className="mr-2 h-4 w-4" /> Desarchivar
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setProjectStatus(project.id, "archived")}>
                <Archive className="mr-2 h-4 w-4" /> Archivar (terminado)
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Avance */}
      <div className="bg-card space-y-2 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Avance</span>
          <span className="text-sm font-semibold">{project.stats.progress}%</span>
        </div>
        <ProgressBar value={project.stats.progress} color={project.color} />
        <StatsLine p={project} />
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={() => setTaskDialog({ open: true })}>
          <Plus className="mr-1 h-4 w-4" /> Tarea
        </Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={() => setMilestoneDialog({ open: true })}>
          <Flag className="mr-1 h-4 w-4" /> Hito
        </Button>
      </div>

      {doneCount > 0 && (
        <button
          type="button"
          onClick={() => setShowDone((v) => !v)}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          {showDone ? "Ocultar" : "Mostrar"} hechas ({doneCount})
        </button>
      )}

      {/* Hitos abiertos */}
      {openMilestones.map(renderMilestone)}

      {/* Tareas sin hito */}
      {(noMilestone.length > 0 || project.milestones.length === 0) && (
        <section className="space-y-2">
          {project.milestones.length > 0 && (
            <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Sin hito</h2>
          )}
          {renderTasks(noMilestone) ?? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              {projectTasks.length ? "Todo hecho 🎉" : "Todavía no hay tareas en este proyecto."}
            </p>
          )}
        </section>
      )}

      {/* Hitos cumplidos */}
      {doneMilestones.length > 0 && (
        <div className="space-y-4 border-t pt-4">
          <h2 className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Hitos cumplidos
          </h2>
          {doneMilestones.map(renderMilestone)}
        </div>
      )}

      <ProjectDialog
        open={editProject}
        editing={project}
        onClose={() => setEditProject(false)}
        onSave={(data) => updateProject(project.id, data)}
      />

      <MilestoneDialog
        open={milestoneDialog.open}
        editing={milestoneDialog.editing}
        onClose={() => setMilestoneDialog({ open: false })}
        onSave={(data) =>
          milestoneDialog.editing
            ? updateMilestone(milestoneDialog.editing.id, data)
            : createMilestone(project.id, {
                name: data.name,
                dueDate: data.dueDate ?? undefined,
              })
        }
      />

      <AddTaskDialog
        isOpen={taskDialog.open}
        editingTask={taskDialog.editing}
        defaultProjectId={project.id}
        defaultMilestoneId={taskDialog.milestoneId}
        onClose={() => setTaskDialog({ open: false })}
        onSave={async (data) => {
          if (taskDialog.editing) await updateTask(taskDialog.editing.id, data);
          else await createTask(data);
          refreshAfterTaskChange();
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`¿Eliminar ${project.name}?`}
        description="Las tareas no se borran: quedan sin proyecto. Si solo lo terminaste, mejor archivalo."
        confirmLabel="Eliminar"
        destructive
        onConfirm={async () => {
          await deleteProject(project.id);
          router.push("/proyectos");
        }}
      />

      <ConfirmDialog
        open={!!confirmMilestone}
        onOpenChange={(o) => !o && setConfirmMilestone(null)}
        title={`¿Eliminar el hito ${confirmMilestone?.name ?? ""}?`}
        description="Sus tareas siguen en el proyecto, sin hito."
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => {
          if (confirmMilestone) deleteMilestone(confirmMilestone.id);
          setConfirmMilestone(null);
        }}
      />
    </div>
  );
}
