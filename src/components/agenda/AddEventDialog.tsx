"use client";

import { useState, useEffect } from "react";
import { CalendarEvent } from "@/types";
import { getDateKey } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface AddEventDialogProps {
  isOpen: boolean;
  editingEvent?: CalendarEvent | null;
  defaultDate?: string;
  onSave: (data: Partial<CalendarEvent>) => void;
  onClose: () => void;
}

export default function AddEventDialog({
  isOpen,
  editingEvent,
  defaultDate,
  onSave,
  onClose,
}: AddEventDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [allDay, setAllDay] = useState(false);
  const [color, setColor] = useState("#3b82f6");

  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        setTitle(editingEvent.title);
        setDescription(editingEvent.description || "");
        setLocation(editingEvent.location || "");
        setAllDay(editingEvent.allDay);
        setColor(editingEvent.color || "#3b82f6");
        const startDate = editingEvent.startTime.split("T")[0];
        setDate(startDate);
        if (!editingEvent.allDay) {
          setStartTime(
            new Date(editingEvent.startTime).toLocaleTimeString("en", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          );
          setEndTime(
            new Date(editingEvent.endTime).toLocaleTimeString("en", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          );
        }
      } else {
        setTitle("");
        setDescription("");
        setLocation("");
        setDate(defaultDate || getDateKey(new Date()));
        setStartTime("09:00");
        setEndTime("10:00");
        setAllDay(false);
        setColor("#3b82f6");
      }
    }
  }, [isOpen, editingEvent, defaultDate]);

  const handleSubmit = () => {
    if (!title.trim()) return;

    const startISO = allDay
      ? `${date}T00:00:00`
      : `${date}T${startTime}:00`;
    const endISO = allDay
      ? `${date}T23:59:59`
      : `${date}T${endTime}:00`;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      startTime: startISO,
      endTime: endISO,
      allDay,
      color,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? "Editar evento" : "Nuevo evento"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Titulo *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nombre del evento"
            />
          </div>

          <div>
            <Label className="text-xs">Fecha</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="allDay"
              checked={allDay}
              onCheckedChange={(v) => setAllDay(v === true)}
            />
            <Label htmlFor="allDay" className="text-xs">
              Todo el dia
            </Label>
          </div>

          {!allDay && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Inicio</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Fin</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs">Descripcion</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional"
            />
          </div>

          <div>
            <Label className="text-xs">Ubicacion</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Opcional"
            />
          </div>

          <div>
            <Label className="text-xs">Color</Label>
            <Input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-16 p-0.5"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={!title.trim()}>
            {editingEvent ? "Guardar" : "Crear"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
