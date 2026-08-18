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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getDateKey } from "@/lib/utils";
import type { CreateFilamentDto, Filament } from "@/types/printing";

interface FilamentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateFilamentDto) => Promise<boolean>;
  editingFilament?: Filament | null;
  isSubmitting?: boolean;
}

const emptyOf = (): CreateFilamentDto => ({
  brand: "",
  material: "",
  color: "",
  pricePaid: 0,
  grams: 1000,
  purchasedAt: getDateKey(new Date()),
  discarded: false,
  discardReason: "",
  notes: "",
});

/** Alta/edicion de una compra de filamento (inversion del negocio). */
export default function FilamentDialog({
  isOpen,
  onClose,
  onSave,
  editingFilament,
  isSubmitting,
}: FilamentDialogProps) {
  const [form, setForm] = useState<CreateFilamentDto>(emptyOf());

  useEffect(() => {
    if (isOpen) {
      setForm(
        editingFilament
          ? {
              brand: editingFilament.brand,
              material: editingFilament.material,
              color: editingFilament.color,
              pricePaid: editingFilament.pricePaid,
              grams: editingFilament.grams,
              purchasedAt: editingFilament.purchasedAt,
              discarded: editingFilament.discarded,
              discardReason: editingFilament.discardReason || "",
              gramsLeft: editingFilament.gramsLeft ?? undefined,
              colorHex: editingFilament.colorHex || undefined,
              notes: editingFilament.notes || "",
            }
          : emptyOf(),
      );
    }
  }, [isOpen, editingFilament]);

  const handleSave = async () => {
    if (!form.brand.trim() || !form.material.trim() || !form.color.trim())
      return;
    if (!form.pricePaid || form.pricePaid <= 0) return;
    const ok = await onSave({
      ...form,
      brand: form.brand.trim(),
      material: form.material.trim(),
      color: form.color.trim(),
      discardReason: form.discarded
        ? form.discardReason?.trim() || undefined
        : undefined,
      notes: form.notes?.trim() || undefined,
    });
    if (ok) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingFilament ? "Editar filamento" : "Nueva compra de filamento"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="f-brand">Marca</Label>
              <Input
                id="f-brand"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="Bambu Lab"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-material">Material</Label>
              <Input
                id="f-material"
                value={form.material}
                onChange={(e) =>
                  setForm({ ...form, material: e.target.value })
                }
                placeholder="PLA Lite"
              />
            </div>
          </div>
          <div className="grid grid-cols-[1fr_auto] items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="f-color">Color</Label>
              <Input
                id="f-color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="Rojo"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-hex" className="text-xs">
                Hex (Bambu)
              </Label>
              <input
                id="f-hex"
                type="color"
                className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background p-1"
                value={form.colorHex || "#808080"}
                onChange={(e) => setForm({ ...form, colorHex: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="f-price">Pagado (ARS)</Label>
              <Input
                id="f-price"
                type="number"
                inputMode="decimal"
                value={form.pricePaid || ""}
                onChange={(e) =>
                  setForm({ ...form, pricePaid: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-grams">Gramos</Label>
              <Input
                id="f-grams"
                type="number"
                inputMode="decimal"
                value={form.grams ?? 1000}
                onChange={(e) =>
                  setForm({ ...form, grams: Number(e.target.value) })
                }
              />
            </div>
          </div>
          {editingFilament && !form.discarded && (
            <div className="space-y-1.5">
              <Label htmlFor="f-left">
                Gramos que quedan (stock actual del rollo)
              </Label>
              <Input
                id="f-left"
                type="number"
                inputMode="decimal"
                value={form.gramsLeft ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    gramsLeft: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Vacio = sin trackear"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="f-date">Fecha de compra</Label>
            <Input
              id="f-date"
              type="date"
              value={form.purchasedAt}
              onChange={(e) =>
                setForm({ ...form, purchasedAt: e.target.value })
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="f-discarded" className="text-sm">
              Descartado (mala calidad, etc)
            </Label>
            <Switch
              id="f-discarded"
              checked={!!form.discarded}
              onCheckedChange={(v) => setForm({ ...form, discarded: v })}
            />
          </div>
          {form.discarded && (
            <div className="space-y-1.5">
              <Label htmlFor="f-reason">Motivo</Label>
              <Input
                id="f-reason"
                value={form.discardReason}
                onChange={(e) =>
                  setForm({ ...form, discardReason: e.target.value })
                }
                placeholder="Ej: mala calidad, no volver a comprar"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="f-notes">Notas</Label>
            <Textarea
              id="f-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Ej: sin carrete, recarga"
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={
              isSubmitting ||
              !form.brand.trim() ||
              !form.color.trim() ||
              !form.pricePaid
            }
          >
            {editingFilament ? "Guardar cambios" : "Registrar compra"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
