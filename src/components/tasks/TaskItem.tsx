"use client";

import { Task } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Clock,
  GripVertical,
  PlayCircle,
  CircleDashed,
  Pause,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PRIORITY_LABELS, categoryLabel } from "@/lib/task-filters";

const priorityColors: Record<string, string> = {
  urgent: "bg-red-500 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-blue-500 text-white",
  low: "bg-muted-foreground text-background",
};


interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleInProgress?: (task: Task) => void;
  onPauseProject?: (projectId: string) => void;
  /** En la vista de un proyecto el badge del proyecto sobra. */
  hideProject?: boolean;
  /** Dentro de la seccion de su hito, el badge del hito sobra. */
  hideMilestone?: boolean;
}

export default function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  onToggleInProgress,
  onPauseProject,
  hideProject,
  hideMilestone,
}: TaskItemProps) {
  const inProgress = !task.completed && task.status === "in_progress";
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2 p-3 rounded-lg border transition-all ${
        isDragging
          ? "opacity-50 shadow-lg z-50"
          : task.completed
            ? "bg-muted/30 border-muted"
            : inProgress
              ? "bg-card border-primary/50"
              : "bg-card border-border hover:border-primary/30"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="mt-0.5"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm font-medium ${
              task.completed
                ? "line-through text-muted-foreground"
                : "text-foreground"
            }`}
          >
            {task.title}
          </span>
          {inProgress && (
            <Badge className="text-[10px] px-1.5 py-0 bg-primary text-primary-foreground">
              En curso
            </Badge>
          )}
          {task.project && !hideProject && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-primary/40 text-primary"
            >
              {task.project}
            </Badge>
          )}
          {task.milestone && !hideMilestone && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              🏁 {task.milestone.name}
            </Badge>
          )}
          <Badge
            variant="secondary"
            className={`text-[10px] px-1.5 py-0 ${priorityColors[task.priority]}`}
          >
            {PRIORITY_LABELS[task.priority]}
          </Badge>
          {task.category && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {categoryLabel(task.category)}
            </Badge>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {task.description}
          </p>
        )}

        {(task.dueDate || task.dueTime) && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {task.dueDate && <span>{task.dueDate}</span>}
            {task.dueTime && <span>{task.dueTime}</span>}
          </div>
        )}

        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {task.tags.map((tag, i) => (
              <span
                key={i}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onToggleInProgress && !task.completed && (
            <DropdownMenuItem onClick={() => onToggleInProgress(task)}>
              {inProgress ? (
                <CircleDashed className="mr-2 h-4 w-4" />
              ) : (
                <PlayCircle className="mr-2 h-4 w-4" />
              )}
              {inProgress ? "Volver a pendiente" : "Marcar en curso"}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onEdit(task)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          {onPauseProject && task.projectId && task.projectStatus === "active" && (
            <DropdownMenuItem onClick={() => onPauseProject(task.projectId!)}>
              <Pause className="mr-2 h-4 w-4" />
              Pausar {task.project}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => onDelete(task.id)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
