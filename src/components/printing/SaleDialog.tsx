"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PillToggle } from "@/components/ui/pill-toggle";
import { fmtARS, getDateKey } from "@/lib/utils";
import type {
  CreatePrintSaleDto,
  PrintProduct,
  PrintSaleKind,
} from "@/types/printing";

interface SaleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreatePrintSaleDto) => Promise<boolean>;
  products: PrintProduct[];
  isSubmitting?: boolean;
}

const KIND_OPTIONS: { value: PrintSaleKind; label: string }[] = [
  { value: "venta", label: "Venta" },
  { value: "muestra", label: "Muestra (regalada)" },
];

/** Alta rapida de una venta o muestra (para cargar desde la feria). */
export default function SaleDialog({
  isOpen,
  onClose,
  onSave,
  products,
  isSubmitting,
}: SaleDialogProps) {
  const [productId, setProductId] = useState("");
  const [kind, setKind] = useState<PrintSaleKind>("venta");
  const [qty, setQty] = useState(1);
  const [date, setDate] = useState(getDateKey(new Date()));
  const [chargedUnit, setChargedUnit] = useState<number | "">("");
  const [channel, setChannel] = useState("");

  const activeProducts = useMemo(
    () => products.filter((p) => p.active),
    [products],
  );
  const selected = activeProducts.find((p) => p.id === productId);

  useEffect(() => {
    if (isOpen) {
      setProductId(activeProducts[0]?.id || "");
      setKind("venta");
      setQty(1);
      setDate(getDateKey(new Date()));
      setChargedUnit("");
      setChannel("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const suggestedPrice = selected?.priceToMarcelito ?? 0;

  const handleSave = async () => {
    if (!productId || qty <= 0) return;
    const ok = await onSave({
      date,
      productId,
      kind,
      qty,
      chargedUnit:
        kind === "muestra"
          ? 0
          : chargedUnit === ""
            ? undefined
            : Number(chargedUnit),
      channel: channel.trim() || undefined,
    });
    if (ok) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar venta / muestra</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="s-product">Producto</Label>
            <select
              id="s-product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="flex h-10 w-full rounded-xl border-0 bg-secondary px-3.5 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:text-sm"
            >
              {activeProducts.length === 0 && (
                <option value="">Sin productos activos</option>
              )}
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <PillToggle
            options={KIND_OPTIONS}
            value={kind}
            onChange={setKind}
            fullWidth
            aria-label="Tipo de movimiento"
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="s-qty">Cantidad</Label>
              <Input
                id="s-qty"
                type="number"
                inputMode="numeric"
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-date">Fecha</Label>
              <Input
                id="s-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {kind === "venta" && (
            <div className="space-y-1.5">
              <Label htmlFor="s-price">
                Precio por unidad{" "}
                <span className="text-muted-foreground">
                  (sugerido {fmtARS(suggestedPrice)})
                </span>
              </Label>
              <Input
                id="s-price"
                type="number"
                inputMode="decimal"
                value={chargedUnit}
                onChange={(e) =>
                  setChargedUnit(e.target.value ? Number(e.target.value) : "")
                }
                placeholder={String(suggestedPrice)}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="s-channel">Canal (opcional)</Label>
            <Input
              id="s-channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="Feria, Marcelito..."
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSave}
            disabled={isSubmitting || !productId || qty <= 0}
          >
            {kind === "muestra" ? "Registrar muestra" : "Registrar venta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
