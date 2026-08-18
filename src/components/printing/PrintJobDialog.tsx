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
import { Plus, X } from "lucide-react";
import type {
  CreatePrintJobDto,
  PrintProduct,
  StockSummary,
} from "@/types/printing";

interface PrintJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreatePrintJobDto) => Promise<boolean>;
  products: PrintProduct[];
  stock: StockSummary | null;
  isSubmitting?: boolean;
}

interface EntryRow {
  color: string;
  grams: number | "";
}

/**
 * Registrar una impresion a mano (sin Bambu conectado): que se imprimio y
 * cuantos gramos de cada color — eso se descuenta del stock (FIFO).
 */
export default function PrintJobDialog({
  isOpen,
  onClose,
  onSave,
  products,
  stock,
  isSubmitting,
}: PrintJobDialogProps) {
  const [title, setTitle] = useState("");
  const [productId, setProductId] = useState("");
  const [hours, setHours] = useState<number | "">("");
  const [entries, setEntries] = useState<EntryRow[]>([{ color: "", grams: "" }]);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setProductId("");
      setHours("");
      setEntries([{ color: "", grams: "" }]);
    }
  }, [isOpen]);

  // Elegir un producto precarga titulo y consumos desde su desglose
  const handleProduct = (id: string) => {
    setProductId(id);
    const p = products.find((x) => x.id === id);
    if (p) {
      setTitle(p.name);
      setHours(p.hours);
      if (p.colorBreakdown?.length) {
        setEntries(
          p.colorBreakdown.map((b) => ({
            color: b.color ?? "",
            grams: b.grams,
          })),
        );
      }
    }
  };

  const validEntries = entries.filter(
    (e) => e.color.trim() && Number(e.grams) > 0,
  );

  const handleSave = async () => {
    if (!title.trim() || !validEntries.length) return;
    const ok = await onSave({
      title: title.trim(),
      productId: productId || undefined,
      hours: hours === "" ? undefined : Number(hours),
      filamentsUsed: validEntries.map((e) => ({
        color: e.color.trim(),
        grams: Number(e.grams),
      })),
    });
    if (ok) onClose();
  };

  const knownColors = stock?.colors.map((c) => c.color) ?? [];

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar impresión</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="j-product">Producto del catálogo (opcional)</Label>
            <select
              id="j-product"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={productId}
              onChange={(e) => handleProduct(e.target.value)}
            >
              <option value="">— Otra cosa / manual —</option>
              {products
                .filter((p) => p.active)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="j-title">Qué se imprimió</Label>
            <Input
              id="j-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: TETRIS x2"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Filamento usado</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setEntries([...entries, { color: "", grams: "" }])}
              >
                <Plus className="mr-0.5 h-3.5 w-3.5" />
                Color
              </Button>
            </div>
            {entries.map((e, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Input
                  value={e.color}
                  onChange={(ev) => {
                    const next = [...entries];
                    next[i] = { ...next[i], color: ev.target.value };
                    setEntries(next);
                  }}
                  placeholder="Color (ej: negro)"
                  list="stock-colors"
                  className="flex-1"
                />
                <Input
                  type="number"
                  inputMode="decimal"
                  value={e.grams}
                  onChange={(ev) => {
                    const next = [...entries];
                    next[i] = {
                      ...next[i],
                      grams: ev.target.value ? Number(ev.target.value) : "",
                    };
                    setEntries(next);
                  }}
                  placeholder="g"
                  className="w-20"
                />
                {entries.length > 1 && (
                  <button
                    type="button"
                    aria-label="Sacar color"
                    className="p-1 text-muted-foreground hover:text-destructive"
                    onClick={() => setEntries(entries.filter((_, j) => j !== i))}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <datalist id="stock-colors">
              {knownColors.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="j-hours">Horas (opcional)</Label>
            <Input
              id="j-hours"
              type="number"
              inputMode="decimal"
              step="0.5"
              value={hours}
              onChange={(e) =>
                setHours(e.target.value ? Number(e.target.value) : "")
              }
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSave}
            disabled={isSubmitting || !title.trim() || !validEntries.length}
          >
            Registrar y descontar stock
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
