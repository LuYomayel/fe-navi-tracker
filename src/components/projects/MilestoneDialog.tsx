"use client";

import { useEffect, useState } from "react";
import type { Milestone } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; dueDate?: string | null }) => Promise<unknown>;
  editing?: Milestone | null;
}

export default function MilestoneDialog({ open, onClose, onSave, editing }: Props) {
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? "");
    setDueDate(editing?.dueDate ?? "");
  }, [open, editing]);

  const save = async () => {
    if (!name.trim()) return;
    await onSave({
      name: name.trim(),
      // al editar, vacio = sacarle la fecha
      dueDate: dueDate || (editing ? null : undefined),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar hito" : "Nuevo hito"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nombre *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Release v2, Cerrar dominio"
              maxLength={80}
              autoFocus
            />
          </div>
          <div>
            <Label>Fecha objetivo</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={save} className="flex-1" disabled={!name.trim()}>
              {editing ? "Guardar" : "Crear hito"}
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
