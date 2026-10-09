"use client";

import { useEffect, useState } from "react";
import { Task, TaskPriority, TaskCategory } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNaviTrackerStore } from "@/store";
import { Plus } from "lucide-react";

const priorities = [
  { value: "low", label: "Baja", color: "bg-muted-foreground" },
  { value: "medium", label: "Media", color: "bg-blue-500" },
  { value: "high", label: "Alta", color: "bg-orange-500" },
  { value: "urgent", label: "Urgente", color: "bg-red-500" },
];

const categories = [
  { value: "work", label: "Trabajo" },
  { value: "personal", label: "Personal" },
  { value: "health", label: "Salud" },
  { value: "finance", label: "Finanzas" },
  { value: "study", label: "Estudio" },
  { value: "other", label: "Otro" },
  { value: "nz", label: "🇳🇿 NZ" },
];

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Task>) => void;
  editingTask?: Task | null;
  /** Fecha pre-cargada al crear (ej: el dia que se esta viendo en la agenda). */
  defaultDate?: string;
  /** Proyecto / hito pre-elegidos al crear (ej: desde la vista del proyecto). */
  defaultProjectId?: string;
  defaultMilestoneId?: string;
}

export default function AddTaskDialog({
  isOpen,
  onClose,
  onSave,
  editingTask,
  defaultDate,
  defaultProjectId,
  defaultMilestoneId,
}: AddTaskDialogProps) {
  const projects = useNaviTrackerStore((s) => s.projects);
  const projectsLoaded = useNaviTrackerStore((s) => s.projectsLoaded);
  const fetchProjects = useNaviTrackerStore((s) => s.fetchProjects);
  const createProject = useNaviTrackerStore((s) => s.createProject);
  const [title, setTitle] = useState(editingTask?.title || "");
  const [description, setDescription] = useState(
    editingTask?.description || ""
  );
  const [dueDate, setDueDate] = useState(editingTask?.dueDate || "");
  const [dueTime, setDueTime] = useState(editingTask?.dueTime || "");
  const [priority, setPriority] = useState<TaskPriority>(
    editingTask?.priority || "medium"
  );
  const [category, setCategory] = useState<TaskCategory | "">(editingTask?.category || "");
  const [projectId, setProjectId] = useState<string>("");
  const [milestoneId, setMilestoneId] = useState<string>("");
  const [newProject, setNewProject] = useState<string | null>(null);

  // Poblar/resetear el form CADA vez que el diálogo se abre: onOpenChange de
  // Radix no se dispara cuando el padre abre por prop (open={isOpen}), así
  // que editar una tarea mostraba el formulario vacío.
  useEffect(() => {
    if (isOpen) {
      setTitle(editingTask?.title || "");
      setDescription(editingTask?.description || "");
      setDueDate(editingTask?.dueDate || defaultDate || "");
      setDueTime(editingTask?.dueTime || "");
      setPriority(editingTask?.priority || "medium");
      setCategory(editingTask?.category || "");
      setProjectId(editingTask ? editingTask.projectId || "" : defaultProjectId || "");
      setMilestoneId(
        editingTask ? editingTask.milestoneId || "" : defaultMilestoneId || "",
      );
      setNewProject(null);
      if (!projectsLoaded) fetchProjects();
    }
  }, [isOpen, editingTask, defaultDate, defaultProjectId, defaultMilestoneId, projectsLoaded, fetchProjects]);

  // Se ofrecen los activos + el que ya tiene la tarea (aunque este pausado).
  const selectable = projects.filter(
    (p) => p.status === "active" || p.id === projectId,
  );
  const milestones =
    projects.find((p) => p.id === projectId)?.milestones.filter(
      (m) => !m.done || m.id === milestoneId,
    ) ?? [];

  const pickProject = (id: string) => {
    setProjectId(projectId === id ? "" : id);
    setMilestoneId("");
  };

  const addProject = async () => {
    const name = newProject?.trim();
    if (!name) return;
    const p = await createProject({ name });
    if (p) {
      setProjectId(p.id);
      setMilestoneId("");
      setNewProject(null);
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      priority,
      category: category || undefined,
      // Al editar, null = sacarle el proyecto/hito. Al crear sin proyecto,
      // el back lo infiere del prefijo del titulo ("Stampia - ...").
      projectId: projectId || (editingTask ? null : undefined),
      milestoneId: milestoneId || (editingTask ? null : undefined),
    });
    // Reset form
    setTitle("");
    setDescription("");
    setDueDate("");
    setDueTime("");
    setPriority("medium");
    setCategory("");
    setProjectId("");
    setMilestoneId("");
    onClose();
  };

  // El form se puebla en el useEffect de arriba; aca solo cerramos cuando
  // Radix avisa (Esc / click fuera).
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? "Editar Tarea" : "Nueva Tarea"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Titulo *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Presentar informe..."
              autoFocus
            />
          </div>

          <div>
            <Label>Descripcion</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles adicionales..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Fecha</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Hora</Label>
              <Input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Proyecto</Label>
            <div className="flex gap-1.5 mt-1 flex-wrap">
              {selectable.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pickProject(p.id)}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    projectId === p.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {p.emoji ? `${p.emoji} ` : ""}
                  {p.name}
                  {p.status !== "active" && " ⏸"}
                </button>
              ))}
              {newProject === null ? (
                <button
                  type="button"
                  onClick={() => setNewProject("")}
                  className="flex items-center gap-1 rounded-full border border-dashed px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3 w-3" /> Nuevo
                </button>
              ) : (
                <div className="flex w-full gap-1.5">
                  <Input
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addProject();
                      }
                    }}
                    placeholder="Nombre del proyecto"
                    maxLength={40}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button size="sm" className="h-8" onClick={addProject} disabled={!newProject.trim()}>
                    Crear
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => setNewProject(null)}>
                    ✕
                  </Button>
                </div>
              )}
            </div>
            {!projectId && !editingTask && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Sin elegir, se toma del título (“Stampia - …”).
              </p>
            )}
          </div>

          {milestones.length > 0 && (
            <div>
              <Label>Hito</Label>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {milestones.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMilestoneId(milestoneId === m.id ? "" : m.id)}
                    className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      milestoneId === m.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    🏁 {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Prioridad</Label>
            <div className="flex gap-2 mt-1">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value as TaskPriority)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    priority === p.value
                      ? `${p.color} text-white ring-2 ring-offset-2 ring-offset-background ring-primary`
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Categoria</Label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {categories.map((c) => (
                <button
                  key={c.value}
                  onClick={() =>
                    setCategory(category === c.value ? "" : c.value as TaskCategory)
                  }
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    category === c.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1" disabled={!title.trim()}>
              {editingTask ? "Guardar" : "Crear Tarea"}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
