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
}

export default function AddTaskDialog({
  isOpen,
  onClose,
  onSave,
  editingTask,
  defaultDate,
}: AddTaskDialogProps) {
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
    }
  }, [isOpen, editingTask, defaultDate]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      priority,
      category: category || undefined,
    });
    // Reset form
    setTitle("");
    setDescription("");
    setDueDate("");
    setDueTime("");
    setPriority("medium");
    setCategory("");
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
