"use client";

import React, { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useNaviTrackerStore } from "@/store";
import type { Activity } from "@/types";
import { Save, X } from "lucide-react";

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
}

const DAYS_OF_WEEK = [
  { id: 0, label: "Lun", fullName: "Lunes" },
  { id: 1, label: "Mar", fullName: "Martes" },
  { id: 2, label: "Mié", fullName: "Miércoles" },
  { id: 3, label: "Jue", fullName: "Jueves" },
  { id: 4, label: "Vie", fullName: "Viernes" },
  { id: 5, label: "Sáb", fullName: "Sábado" },
  { id: 6, label: "Dom", fullName: "Domingo" },
];

const PRESET_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#EC4899",
  "#6366F1",
];

export function EditActivityModal({
  isOpen,
  onClose,
  activity,
}: EditActivityModalProps) {
  const { updateActivity } = useNaviTrackerStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    time: "",
    days: [false, false, false, false, false, false, false],
    color: "#3B82F6",
    category: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-llenar el formulario cuando se abre el modal
  useEffect(() => {
    if (activity && isOpen) {
      setFormData({
        name: activity.name,
        description: activity.description || "",
        time: activity.time || "",
        days: [...activity.days],
        color: activity.color,
        category: activity.category || "",
      });
      setErrors({});
    }
  }, [activity, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (
      formData.time &&
      !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.time)
    ) {
      newErrors.time = "Formato de hora inválido (HH:MM)";
    }

    if (!formData.days.some((day) => day)) {
      newErrors.days = "Selecciona al menos un día";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activity || !validateForm()) return;

    setIsSubmitting(true);

    try {
      await updateActivity(activity.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        time: formData.time || undefined,
        days: formData.days,
        color: formData.color,
        category: formData.category.trim() || undefined,
        updatedAt: new Date(),
      });

      onClose();
    } catch (error) {
      console.error("Error actualizando actividad:", error);
      setErrors({
        submit: "Error al actualizar la actividad. Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.map((day, index) => (index === dayIndex ? !day : day)),
    }));
  };

  const resetForm = () => {
    if (activity) {
      setFormData({
        name: activity.name,
        description: activity.description || "",
        time: activity.time || "",
        days: [...activity.days],
        color: activity.color,
        category: activity.category || "",
      });
    }
    setErrors({});
  };

  if (!activity) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar Hábito
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre del hábito *</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Ej: Ejercicio matutino"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe tu hábito..."
              rows={2}
            />
          </div>

          {/* Hora */}
          <div className="space-y-2">
            <Label htmlFor="edit-time">Hora (opcional)</Label>
            <Input
              id="edit-time"
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, time: e.target.value }))
              }
              className={errors.time ? "border-destructive" : ""}
            />
            {errors.time && (
              <p className="text-sm text-destructive">{errors.time}</p>
            )}
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="edit-category">Categoría</Label>
            <Input
              id="edit-category"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              placeholder="Ej: Salud, Productividad, Personal..."
            />
          </div>

          {/* Días de la semana */}
          <div className="space-y-2">
            <Label>Días de la semana *</Label>
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.id} className="flex flex-col items-center">
                  <Checkbox
                    id={`edit-day-${day.id}`}
                    checked={formData.days[day.id]}
                    onCheckedChange={() => handleDayToggle(day.id)}
                  />
                  <Label
                    htmlFor={`edit-day-${day.id}`}
                    className="text-xs mt-1 cursor-pointer"
                  >
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.days && (
              <p className="text-sm text-destructive">{errors.days}</p>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color
                      ? "border-foreground scale-110"
                      : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  title={`Seleccionar color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Error de envío */}
          {errors.submit && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{errors.submit}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={isSubmitting}
              className="flex-1"
            >
              Restablecer
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
