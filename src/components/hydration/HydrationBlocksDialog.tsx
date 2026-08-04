"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import { Plus, Trash2 } from "lucide-react";

interface EditableBlock {
  id: string;
  label: string;
  start: string;
  end: string;
  targetMl: number;
  requiresTraining?: boolean;
}

/**
 * Editor de tramos de hidratación: horario + ml por tramo, con la opción
 * "solo días de entrenamiento" para el tramo extra.
 */
export default function HydrationBlocksDialog({
  open,
  onOpenChange,
  blocks,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blocks: EditableBlock[];
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<EditableBlock[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      // Copia editable sin los campos calculados del pace
      setDraft(
        blocks.map((b) => ({
          id: b.id,
          label: b.label,
          start: b.start,
          end: b.end,
          targetMl: b.targetMl,
          requiresTraining: b.requiresTraining,
        }))
      );
    }
  }, [open, blocks]);

  const update = (i: number, patch: Partial<EditableBlock>) => {
    setDraft((prev) => prev.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  };

  const addBlock = () => {
    if (draft.length >= 6) return;
    setDraft((prev) => [
      ...prev,
      {
        id: `b${prev.length + 1}-${Math.random().toString(36).slice(2, 6)}`,
        label: "Nuevo tramo",
        start: "20:00",
        end: "22:00",
        targetMl: 500,
      },
    ]);
  };

  const removeBlock = (i: number) => {
    setDraft((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.hydration.setBlocks(draft);
      if (!res.success) throw new Error();
      toast.success("Tramos guardados", "Tu plan de agua quedó configurado");
      onOpenChange(false);
      onSaved();
    } catch (error: unknown) {
      const msg =
        error && typeof error === "object" && "message" in error
          ? String((error as Error).message)
          : "Revisá horarios y cantidades";
      toast.error("No se pudieron guardar los tramos", msg);
    } finally {
      setSaving(false);
    }
  };

  const totalBase = draft
    .filter((b) => !b.requiresTraining)
    .reduce((a, b) => a + (b.targetMl || 0), 0);
  const totalTraining = draft.reduce((a, b) => a + (b.targetMl || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tramos de hidratación</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Dividí el agua del día en tramos horarios. Los recordatorios te
            avisan cuando venís abajo del ritmo del tramo.
          </p>

          {draft.map((b, i) => (
            <div key={b.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={b.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                  className="h-9 flex-1"
                  aria-label="Nombre del tramo"
                />
                <button
                  onClick={() => removeBlock(i)}
                  className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Borrar tramo ${b.label}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-muted-foreground">Desde</label>
                  <Input
                    type="time"
                    value={b.start}
                    onChange={(e) => update(i, { start: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">Hasta</label>
                  <Input
                    type="time"
                    value={b.end}
                    onChange={(e) => update(i, { end: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground">ml</label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={100}
                    step={100}
                    value={b.targetMl}
                    onChange={(e) =>
                      update(i, { targetMl: parseInt(e.target.value) || 0 })
                    }
                    className="h-9"
                  />
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={!!b.requiresTraining}
                  onChange={(e) =>
                    update(i, { requiresTraining: e.target.checked })
                  }
                  className="h-3.5 w-3.5 accent-[hsl(var(--primary))]"
                />
                💪 Solo los días que entreno
              </label>
            </div>
          ))}

          {draft.length < 6 && (
            <Button variant="outline" size="sm" className="w-full" onClick={addBlock}>
              <Plus className="mr-1.5 h-4 w-4" />
              Agregar tramo
            </Button>
          )}

          <div className="rounded-lg bg-muted/40 p-2.5 text-center text-xs text-muted-foreground">
            Meta día normal:{" "}
            <span className="font-semibold text-foreground">
              {(totalBase / 1000).toFixed(1)}L
            </span>{" "}
            · con entrenamiento:{" "}
            <span className="font-semibold text-foreground">
              {(totalTraining / 1000).toFixed(1)}L
            </span>
          </div>

          <div className="flex justify-end gap-2 border-t pt-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || draft.length === 0}>
              {saving ? "Guardando…" : "Guardar tramos"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
