"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/types";
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
import {
  EMOJI_SUGGESTIONS,
  PROJECT_COLOR_KEYS,
  PROJECT_COLORS,
} from "@/lib/project-ui";

export interface ProjectFormData {
  name: string;
  emoji?: string;
  color?: string;
  description?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProjectFormData) => Promise<boolean | unknown>;
  editing?: Project | null;
}

export default function ProjectDialog({ open, onClose, onSave, editing }: Props) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [color, setColor] = useState<string>("blue");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(editing?.name ?? "");
    setEmoji(editing?.emoji ?? "");
    setColor(editing?.color ?? "blue");
    setDescription(editing?.description ?? "");
  }, [open, editing]);

  const save = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);
    const ok = await onSave({
      name: name.trim(),
      emoji: emoji.trim() || undefined,
      color,
      description: description.trim() || undefined,
    });
    setSaving(false);
    if (ok !== false && ok !== null) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar proyecto" : "Nuevo proyecto"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nombre *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: EMA Bonos"
              maxLength={40}
              autoFocus
            />
          </div>

          <div>
            <Label>Emoji</Label>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <Input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="h-9 w-14 text-center text-lg"
                maxLength={8}
                aria-label="Emoji del proyecto"
              />
              {EMOJI_SUGGESTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(emoji === e ? "" : e)}
                  className={`h-9 w-9 rounded-md text-lg transition-all ${
                    emoji === e ? "bg-primary/15 ring-primary ring-2" : "bg-muted hover:bg-muted/70"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Color</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {PROJECT_COLOR_KEYS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  aria-pressed={color === c}
                  className={`h-8 w-8 rounded-full ${PROJECT_COLORS[c].dot} transition-all ${
                    color === c ? "ring-primary ring-offset-background ring-2 ring-offset-2" : "opacity-70"
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="De qué se trata, links, contexto…"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={save} className="flex-1" disabled={!name.trim() || saving}>
              {editing ? "Guardar" : "Crear proyecto"}
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
