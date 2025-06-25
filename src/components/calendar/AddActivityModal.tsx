"use client";

import React, { useState } from "react";
import { X, Clock, Palette } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useNaviTrackerStore } from "@/store";
import {
  getFullDayNames,
  getActivityColors,
  getRandomColor,
} from "@/lib/utils";

export function AddActivityModal() {
  const { showAddActivityModal, setShowAddActivityModal, addActivity } =
    useNaviTrackerStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    time: "",
    days: [false, false, false, false, false, false, false], // L, M, X, J, V, S, D
    color: getRandomColor(),
    category: "",
  });

  const colors = getActivityColors();
  const dayNames = getFullDayNames();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Por favor ingresa un nombre para la actividad");
      return;
    }

    if (!formData.days.some((day) => day)) {
      alert("Por favor selecciona al menos un día de la semana");
      return;
    }

    addActivity({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      time: formData.time || undefined,
      days: formData.days,
      color: formData.color,
      category: formData.category.trim() || undefined,
    });

    // Reset form
    setFormData({
      name: "",
      description: "",
      time: "",
      days: [false, false, false, false, false, false, false],
      color: getRandomColor(),
      category: "",
    });

    setShowAddActivityModal(false);
  };

  const handleClose = () => {
    setShowAddActivityModal(false);
    // Reset form when closing
    setFormData({
      name: "",
      description: "",
      time: "",
      days: [false, false, false, false, false, false, false],
      color: getRandomColor(),
      category: "",
    });
  };

  const toggleDay = (dayIndex: number) => {
    const newDays = [...formData.days];
    newDays[dayIndex] = !newDays[dayIndex];
    setFormData({ ...formData, days: newDays });
  };

  const toggleAllDays = () => {
    const allSelected = formData.days.every((day) => day);
    const newDays = formData.days.map(() => !allSelected);
    setFormData({ ...formData, days: newDays });
  };

  const selectWeekdays = () => {
    const newDays = [true, true, true, true, true, false, false]; // L-V
    setFormData({ ...formData, days: newDays });
  };

  const selectWeekends = () => {
    const newDays = [false, false, false, false, false, true, true]; // S-D
    setFormData({ ...formData, days: newDays });
  };

  return (
    <Dialog open={showAddActivityModal} onOpenChange={setShowAddActivityModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Agregar Nueva Actividad
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre de la actividad */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Nombre de la actividad *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej: Ejercicio matutino, Leer 30 min, etc."
              className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-transparent"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Descripción (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe brevemente la actividad..."
              rows={2}
              className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            />
          </div>

          {/* Horario */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horario (opcional)
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Días de la semana */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Días de la semana *</label>

            {/* Botones de selección rápida */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleAllDays}
              >
                {formData.days.every((day) => day)
                  ? "Deseleccionar todo"
                  : "Todos los días"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectWeekdays}
              >
                Solo laborables
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectWeekends}
              >
                Solo fines de semana
              </Button>
            </div>

            {/* Checkboxes individuales */}
            <div className="grid grid-cols-2 gap-3">
              {dayNames.map((day, index) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${index}`}
                    checked={formData.days[index]}
                    onCheckedChange={() => toggleDay(index)}
                  />
                  <label
                    htmlFor={`day-${index}`}
                    className="text-sm cursor-pointer"
                  >
                    {day}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    formData.color === color
                      ? "border-foreground scale-110"
                      : "border-border hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoría (opcional)</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              placeholder="Ej: Salud, Estudio, Trabajo, etc."
              className="w-full px-3 py-2 border rounded-md bg-background focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Agregar Actividad
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
