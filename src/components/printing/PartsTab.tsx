"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LY_BRAND_CLASS } from "@/lib/ly-brand";
import {
  FILAMENT_COLORS,
  PALETTE_HEX,
  isPaletteColor,
  swatchStyle,
} from "@/lib/filament-colors";
import { ChevronDown, Minus, Plus, Puzzle } from "lucide-react";
import type {
  PartMoveDto,
  PartsOverview,
  PartsProduct,
  PartStock,
  PrintPart,
  PrintRecipeLine,
} from "@/types/printing";

interface PartsTabProps {
  parts: PartsOverview | null;
  isLoading: boolean;
  isSubmitting: boolean;
  /** color canonico -> hex real de los rollos ("#rrggbb") */
  colorHex: Record<string, string>;
  onMove: (moves: PartMoveDto[]) => Promise<boolean>;
}

interface AdjustTarget {
  product: PartsProduct;
  part: PrintPart;
  color: string;
}

/** Lo que pide la receta de una pieza, en una linea legible. */
function recipeText(lines: PrintRecipeLine[]): string {
  if (lines.length === 0) return "no está en la receta";
  const first = lines[0];
  switch (first.colorMode) {
    case "fijo":
      return `×${first.qty} · ${first.fixedColor ?? "color fijo"}`;
    case "distintos":
      return lines.length > 1
        ? `×${first.qty} por color · ${lines.length} colores distintos`
        : `×${first.qty} · color distinto al resto`;
    case "juego":
      return `×${first.qty} · mismo color que su juego`;
    default:
      return `×${lines.reduce((a, l) => a + l.qty, 0)} · cualquier color`;
  }
}

/**
 * Stock de PIEZAS impresas por color: cada impresion suma piezas, la
 * entrega de un pedido las resta. Por producto muestra cuantos juegos se
 * pueden armar respetando la receta y que falta.
 */
export default function PartsTab({
  parts,
  isLoading,
  isSubmitting,
  colorHex,
  onMove,
}: PartsTabProps) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [adjust, setAdjust] = useState<AdjustTarget | null>(null);

  const stockByPart = useMemo(() => {
    const map = new Map<string, PartStock[]>();
    for (const s of parts?.stock ?? []) {
      if (s.qty === 0) continue;
      const list = map.get(s.partId) ?? [];
      list.push(s);
      map.set(s.partId, list);
    }
    map.forEach((list) => list.sort((a, b) => b.qty - a.qty));
    return map;
  }, [parts]);

  const hexOf = (color: string) =>
    colorHex[color] ?? PALETTE_HEX[color] ?? undefined;

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (isLoading && !parts) {
    return (
      <Card className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
        Cargando piezas…
      </Card>
    );
  }

  if (!parts || parts.products.length === 0) {
    return (
      <EmptyState
        icon={Puzzle}
        title="Sin recetas de piezas"
        description="Cuando un producto tenga su receta de piezas cargada, acá vas a ver cuántos juegos podés armar."
      />
    );
  }

  return (
    <div className="space-y-2">
      {parts.products.map((product) => {
        const isOpen = open.has(product.productId);
        const linesByPart = new Map<string, PrintRecipeLine[]>();
        for (const l of [...product.lines].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0),
        )) {
          const list = linesByPart.get(l.partId) ?? [];
          list.push(l);
          linesByPart.set(l.partId, list);
        }
        // Piezas en el orden de la receta; las que no estan, al final.
        const orderedParts = [
          ...Array.from(linesByPart.keys())
            .map((id) => product.parts.find((p) => p.id === id))
            .filter((p): p is PrintPart => !!p),
          ...product.parts.filter((p) => !linesByPart.has(p.id)),
        ];

        return (
          <Card key={product.productId} className="rounded-lg border p-3">
            <button
              type="button"
              className="flex w-full items-start gap-2 text-left"
              onClick={() => toggle(product.productId)}
              aria-expanded={isOpen}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-semibold">
                    {product.productName}
                  </span>
                  <Badge variant={product.buildable > 0 ? "success" : "warning"}>
                    {product.buildable > 0
                      ? `podés armar ${product.buildable}`
                      : "no alcanza para 1"}
                  </Badge>
                </div>
                {product.missing.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Falta: {product.missing.join(" · ")}
                  </p>
                )}
              </div>
              <ChevronDown
                className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="mt-3 space-y-1.5 border-t pt-3">
                {orderedParts.map((part) => {
                  const stock = stockByPart.get(part.id) ?? [];
                  const lines = linesByPart.get(part.id) ?? [];
                  const defaultColor =
                    lines[0]?.colorMode === "fijo"
                      ? (lines[0].fixedColor ?? "")
                      : "";
                  return (
                    <div
                      key={part.id}
                      className="flex items-start gap-2 rounded-md border p-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold">
                          {part.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {recipeText(lines)}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {stock.length === 0 && (
                            <span className="text-[11px] text-muted-foreground">
                              sin stock
                            </span>
                          )}
                          {stock.map((s) => (
                            <button
                              key={s.color}
                              type="button"
                              title={`${s.color}: ${s.qty} — tocá para ajustar`}
                              onClick={() =>
                                setAdjust({ product, part, color: s.color })
                              }
                              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs tabular-nums hover:bg-muted ${
                                s.qty < 0 ? "border-destructive/50 text-destructive" : ""
                              }`}
                            >
                              <span
                                className="h-3 w-3 shrink-0 rounded-full border border-border"
                                style={swatchStyle(s.color, hexOf)}
                              />
                              <span className="font-mono font-bold">{s.qty}</span>
                              <span className="sr-only">{s.color}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <ActionIconButton
                        icon={Plus}
                        onClick={() =>
                          setAdjust({ product, part, color: defaultColor })
                        }
                        aria-label={`Ajustar stock de ${part.name}`}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}

      <AdjustPartDialog
        target={adjust}
        stock={parts.stock}
        hexOf={hexOf}
        isSubmitting={isSubmitting}
        onClose={() => setAdjust(null)}
        onSave={onMove}
      />
    </div>
  );
}

interface AdjustPartDialogProps {
  target: AdjustTarget | null;
  stock: PartStock[];
  hexOf: (color: string) => string | undefined;
  isSubmitting: boolean;
  onClose: () => void;
  onSave: (moves: PartMoveDto[]) => Promise<boolean>;
}

/** Ajuste manual (+/-) del stock de una pieza en un color. */
function AdjustPartDialog({
  target,
  stock,
  hexOf,
  isSubmitting,
  onClose,
  onSave,
}: AdjustPartDialogProps) {
  const [color, setColor] = useState("");
  const [qty, setQty] = useState<number | "">(1);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!target) return;
    setColor(target.color);
    setQty(1);
    setNotes("");
  }, [target]);

  const current =
    stock.find((s) => s.partId === target?.part.id && s.color === color)
      ?.qty ?? 0;
  const delta = typeof qty === "number" ? qty : 0;
  const valid =
    !!target &&
    color.split("+").every((c) => isPaletteColor(c.trim())) &&
    Number.isInteger(delta) &&
    delta !== 0;

  const handleSave = async () => {
    if (!target || !valid) return;
    const ok = await onSave([
      {
        partId: target.part.id,
        color,
        qty: delta,
        reason: "ajuste",
        notes: notes.trim() || undefined,
      },
    ]);
    if (ok) onClose();
  };

  return (
    <Dialog open={target !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${LY_BRAND_CLASS} max-w-md`}>
        <DialogHeader>
          <DialogTitle>Ajustar piezas</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {target?.product.productName} · {target?.part.name}. Sumá lo que
            imprimiste a mano o restá lo que se rompió o regalaste.
          </p>
          <div className="flex items-center gap-2">
            <span
              className="h-6 w-6 shrink-0 rounded-full border"
              style={color ? swatchStyle(color, hexOf) : undefined}
            />
            <select
              aria-label="Color"
              className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-sm"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            >
              <option value="">Elegí el color…</option>
              {target && !isPaletteColor(target.color) && target.color && (
                <option value={target.color}>{target.color}</option>
              )}
              {FILAMENT_COLORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Restar"
              onClick={() => setQty((q) => (typeof q === "number" ? q : 0) - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              step={1}
              aria-label="Cantidad"
              className="w-24 text-center"
              value={qty}
              onChange={(e) =>
                setQty(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
            <Button
              variant="outline"
              size="icon"
              aria-label="Sumar"
              onClick={() => setQty((q) => (typeof q === "number" ? q : 0) + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            {color && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {current} → {current + delta}
              </span>
            )}
          </div>
          <Input
            aria-label="Nota"
            placeholder="Nota (opcional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button disabled={!valid || isSubmitting} onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
