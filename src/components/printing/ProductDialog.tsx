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
import { Plus, X } from "lucide-react";
import PhotoManager from "./PhotoManager";
import { fmtARS } from "@/lib/utils";
import type {
  ColorBreakdownEntry,
  CreatePrintProductDto,
  PrintProduct,
} from "@/types/printing";

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreatePrintProductDto) => Promise<boolean>;
  editingProduct?: PrintProduct | null;
  isSubmitting?: boolean;
  // Fotos (solo disponibles al editar: necesitan el id del producto)
  onAddPhoto?: (productId: string, dataUrl: string) => Promise<boolean>;
  onDeletePhoto?: (photoId: string) => Promise<boolean>;
  onSetCover?: (
    productId: string,
    photoId: string,
    allIds: string[],
  ) => Promise<boolean>;
}

const empty: CreatePrintProductDto = {
  name: "",
  author: "",
  makerworldUrl: "",
  grams: 0,
  hours: 0,
  colorsLabel: "1",
  sizeMm: "",
  licenseOk: false,
  markupOverride: null,
  costOverride: null,
  priceOverride: null,
  publicPrice: null,
  active: true,
  publicVisible: true,
  notes: "",
};

/** Alta/edicion de un producto del catalogo del negocio 3D. */
export default function ProductDialog({
  isOpen,
  onClose,
  onSave,
  editingProduct,
  isSubmitting,
  onAddPhoto,
  onDeletePhoto,
  onSetCover,
}: ProductDialogProps) {
  const [form, setForm] = useState<CreatePrintProductDto>(empty);
  const [breakdown, setBreakdown] = useState<ColorBreakdownEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      setForm(
        editingProduct
          ? {
              name: editingProduct.name,
              author: editingProduct.author || "",
              makerworldUrl: editingProduct.makerworldUrl || "",
              grams: editingProduct.grams,
              hours: editingProduct.hours,
              colorsLabel: editingProduct.colorsLabel,
              sizeMm: editingProduct.sizeMm || "",
              licenseOk: editingProduct.licenseOk,
              markupOverride: editingProduct.markupOverride ?? null,
              costOverride: editingProduct.costOverride ?? null,
              priceOverride: editingProduct.priceOverride ?? null,
              publicPrice: editingProduct.publicPrice ?? null,
              active: editingProduct.active,
              publicVisible: editingProduct.publicVisible ?? true,
              notes: editingProduct.notes || "",
            }
          : empty,
      );
      setBreakdown(editingProduct?.colorBreakdown ?? []);
    }
  }, [isOpen, editingProduct]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.grams || form.hours === undefined) return;
    const ok = await onSave({
      ...form,
      name: form.name.trim(),
      author: form.author?.trim() || undefined,
      makerworldUrl: form.makerworldUrl?.trim() || undefined,
      sizeMm: form.sizeMm?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
      markupOverride: form.markupOverride || null,
      // `?? null` y no `|| null`: 0 es un valor manual valido (muestra)
      costOverride: form.costOverride ?? null,
      priceOverride: form.priceOverride ?? null,
      publicPrice: form.publicPrice || null,
      colorBreakdown: breakdown.filter((b) => b.color?.trim() && b.grams > 0)
        .length
        ? breakdown.filter((b) => b.color?.trim() && b.grams > 0)
        : null,
    });
    if (ok) onClose();
  };

  const totalBreakdown = breakdown.reduce(
    (a, b) => a + (Number(b.grams) || 0),
    0,
  );

  // Costo automatico del producto que se esta editando (para mostrarlo como
  // referencia al lado del manual). Solo lo sabemos si hoy NO es manual: el
  // backend manda el vigente, no los dos.
  const autoCost =
    editingProduct && !editingProduct.costIsManual ? editingProduct.cost : null;

  // Preview de como queda el pricing con lo tipeado (misma regla que el
  // backend: el precio sale del costo vigente x markup si no hay manual).
  const preview = (() => {
    const cost = form.costOverride ?? autoCost;
    if (cost === null || cost === undefined) return null;
    const markup =
      form.markupOverride ?? (editingProduct?.markupOverride || null) ?? 1.3;
    const price =
      form.priceOverride ?? Math.round((cost * markup) / 100) * 100;
    return { cost, price, profit: price - cost };
  })();

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "Editar producto" : "Nuevo producto"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Nombre</Label>
            <Input
              id="p-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Rompecabezas de numeros 1-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-author">Autor (MakerWorld)</Label>
            <Input
              id="p-author"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Ej: Dprintas"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-url">Link de MakerWorld</Label>
            <Input
              id="p-url"
              value={form.makerworldUrl}
              onChange={(e) =>
                setForm({ ...form, makerworldUrl: e.target.value })
              }
              placeholder="https://www.makerworld.com/es/models/..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-grams">Gramos</Label>
              <Input
                id="p-grams"
                type="number"
                inputMode="decimal"
                value={form.grams || ""}
                onChange={(e) =>
                  setForm({ ...form, grams: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-hours">Horas</Label>
              <Input
                id="p-hours"
                type="number"
                inputMode="decimal"
                value={form.hours ?? ""}
                onChange={(e) =>
                  setForm({ ...form, hours: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-colors">Colores</Label>
              <Input
                id="p-colors"
                value={form.colorsLabel}
                onChange={(e) =>
                  setForm({ ...form, colorsLabel: e.target.value })
                }
                placeholder='"1", "7", "multi"'
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-size">Medidas (mm)</Label>
              <Input
                id="p-size"
                value={form.sizeMm}
                onChange={(e) => setForm({ ...form, sizeMm: e.target.value })}
                placeholder="165x165x6"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-markup">Markup propio (opcional)</Label>
              <Input
                id="p-markup"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={form.markupOverride ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    markupOverride: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                placeholder="Default de settings"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-public">Precio publico/feria</Label>
              <Input
                id="p-public"
                type="number"
                inputMode="decimal"
                value={form.publicPrice ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    publicPrice: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-2 rounded-lg border border-dashed p-3">
            <div className="flex items-baseline justify-between gap-2">
              <Label className="text-sm">Valores a mano (opcional)</Label>
              {(form.costOverride !== null && form.costOverride !== undefined) ||
              (form.priceOverride !== null &&
                form.priceOverride !== undefined) ? (
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline"
                  onClick={() =>
                    setForm({
                      ...form,
                      costOverride: null,
                      priceOverride: null,
                    })
                  }
                >
                  Volver al automatico
                </button>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              La formula usa un solo $/g, asi que no ve los filamentos caros
              (ej PLA Wood). Si lo cargas aca, manda este valor.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-cost-override">Costo real</Label>
                <Input
                  id="p-cost-override"
                  type="number"
                  inputMode="decimal"
                  value={form.costOverride ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      costOverride:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  placeholder={
                    autoCost !== null ? `Auto: ${fmtARS(autoCost)}` : "Automatico"
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-price-override">Precio a Marcelito</Label>
                <Input
                  id="p-price-override"
                  type="number"
                  inputMode="decimal"
                  value={form.priceOverride ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      priceOverride:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  placeholder="Costo x markup"
                />
              </div>
            </div>
            {preview ? (
              <p
                className={`text-xs ${preview.profit <= 0 ? "text-destructive" : "text-muted-foreground"}`}
              >
                Quedaria: costo {fmtARS(preview.cost)} · a Marcelito{" "}
                {fmtARS(preview.price)} · ganancia {fmtARS(preview.profit)}
                {preview.profit <= 0 ? " — asi no ganas nada" : ""}
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="min-w-0">
              <Label htmlFor="p-license" className="text-sm">
                Licencia OK para vender
              </Label>
              <p className="text-xs text-muted-foreground">
                Aviso interno: el catalogo publico lo muestra igual
              </p>
            </div>
            <Switch
              id="p-license"
              checked={!!form.licenseOk}
              onCheckedChange={(v) => setForm({ ...form, licenseOk: v })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="p-active" className="text-sm">
              Activo
            </Label>
            <Switch
              id="p-active"
              checked={form.active ?? true}
              onCheckedChange={(v) => setForm({ ...form, active: v })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="p-public" className="text-sm">
              Visible para Marcelito
            </Label>
            <Switch
              id="p-public"
              checked={form.publicVisible ?? true}
              onCheckedChange={(v) => setForm({ ...form, publicVisible: v })}
            />
          </div>
          {editingProduct && onAddPhoto && onDeletePhoto && onSetCover && (
            <div className="space-y-1.5">
              <Label>Fotos (la portada es la que ve Marcelito)</Label>
              <PhotoManager
                productId={editingProduct.id}
                photos={editingProduct.photos ?? []}
                onAdd={onAddPhoto}
                onDelete={onDeletePhoto}
                onSetCover={onSetCover}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Consumo por color (para el stock)</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() =>
                  setBreakdown([...breakdown, { color: "", grams: 0 }])
                }
              >
                <Plus className="mr-0.5 h-3.5 w-3.5" />
                Color
              </Button>
            </div>
            {breakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Sin desglose: el chequeo de stock usa los gramos totales.
                Cargalo (o aprendelo de una impresion real) para que avise
                por color.
              </p>
            ) : (
              <div className="space-y-1.5">
                {breakdown.map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <Input
                      value={b.color ?? ""}
                      onChange={(e) => {
                        const next = [...breakdown];
                        next[i] = { ...next[i], color: e.target.value };
                        setBreakdown(next);
                      }}
                      placeholder="Color (ej: negro)"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={b.grams || ""}
                      onChange={(e) => {
                        const next = [...breakdown];
                        next[i] = { ...next[i], grams: Number(e.target.value) };
                        setBreakdown(next);
                      }}
                      placeholder="g"
                      className="w-20"
                    />
                    <button
                      type="button"
                      aria-label="Sacar color"
                      className="p-1 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        setBreakdown(breakdown.filter((_, j) => j !== i))
                      }
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <p className="text-[11px] text-muted-foreground">
                  Suma {totalBreakdown}g
                  {form.grams
                    ? ` de ${form.grams}g del producto${
                        Math.abs(totalBreakdown - Number(form.grams)) >
                        Number(form.grams) * 0.1
                          ? " ⚠️ (difiere bastante)"
                          : ""
                      }`
                    : ""}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="p-notes">Notas</Label>
            <Textarea
              id="p-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={isSubmitting || !form.name.trim() || !form.grams}
          >
            {editingProduct ? "Guardar cambios" : "Crear producto"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
