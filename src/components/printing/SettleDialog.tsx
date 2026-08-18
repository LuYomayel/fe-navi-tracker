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
import { Trash2 } from "lucide-react";
import { fmtARS } from "@/lib/utils";
import type { AddSettlementDto, PrintSale } from "@/types/printing";

interface SettleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sale: PrintSale | null;
  isSubmitting?: boolean;
  onAdd: (saleId: string, data: AddSettlementDto) => Promise<boolean>;
  onDeleteSettlement: (id: string) => Promise<boolean>;
}

/**
 * Registrar pagos de una venta: total o parcial ("Marce pago 3 de los 5"),
 * con historial de pagos ya hechos. Una venta puede tener varios pagos.
 */
export default function SettleDialog({
  isOpen,
  onClose,
  sale,
  isSubmitting,
  onAdd,
  onDeleteSettlement,
}: SettleDialogProps) {
  const [amount, setAmount] = useState<number | "">("");
  const [qty, setQty] = useState<number | "">("");

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setQty("");
    }
  }, [isOpen]);

  if (!sale) return null;

  const remaining = sale.remaining ?? 0;
  const unitPrice = sale.chargedUnit;
  const unitsLeft = unitPrice > 0 ? Math.floor(remaining / unitPrice) : 0;

  const effectiveAmount =
    amount !== ""
      ? Number(amount)
      : qty !== ""
        ? Number(qty) * unitPrice
        : remaining;

  const handleAdd = async () => {
    const ok = await onAdd(sale.id, {
      amount: amount !== "" ? Number(amount) : undefined,
      qty: qty !== "" ? Number(qty) : undefined,
    });
    if (ok) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Registrar pago · {sale.qty}x {sale.product?.name ?? "producto"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono font-semibold tabular-nums">
                {fmtARS(sale.total)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ya cobrado</span>
              <span className="font-mono tabular-nums">
                {fmtARS(sale.settledAmount)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-1 font-semibold">
              <span>Falta</span>
              <span className="font-mono tabular-nums">{fmtARS(remaining)}</span>
            </div>
          </div>

          {(sale.settlements?.length ?? 0) > 0 && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Pagos registrados
              </Label>
              {sale.settlements.map((st) => {
                const [, m, d] = st.date.split("-");
                return (
                  <div
                    key={st.id}
                    className="flex items-center justify-between rounded-md border border-border/60 px-2 py-1.5 text-xs"
                  >
                    <span className="text-muted-foreground">
                      {d}/{m}
                      {st.qty ? ` · ${st.qty} u.` : ""}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-mono font-semibold tabular-nums">
                        {fmtARS(st.amount)}
                      </span>
                      <button
                        type="button"
                        aria-label="Borrar pago"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => onDeleteSettlement(st.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Atajos por unidades: "pagó 3 de los 5" en un tap */}
          {unitsLeft > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: unitsLeft }, (_, i) => i + 1).map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={qty === n ? "default" : "outline"}
                  size="sm"
                  className="h-8 px-2.5 text-xs"
                  onClick={() => {
                    setQty(n);
                    setAmount("");
                  }}
                >
                  {n} u. · {fmtARS(n * unitPrice)}
                </Button>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="st-amount">Monto (vacio = todo lo restante)</Label>
            <Input
              id="st-amount"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value ? Number(e.target.value) : "");
                setQty("");
              }}
              placeholder={`${remaining}`}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleAdd}
            disabled={
              isSubmitting ||
              effectiveAmount <= 0 ||
              effectiveAmount > remaining + 0.01
            }
          >
            {effectiveAmount >= remaining - 0.01
              ? `Liquidar todo (${fmtARS(remaining)})`
              : `Registrar pago de ${fmtARS(effectiveAmount)}`}
          </Button>
          {effectiveAmount > remaining + 0.01 && (
            <p className="text-center text-xs text-destructive">
              El monto supera lo que falta cobrar
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
