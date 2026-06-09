"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getDateKey } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Recibe el monto ya firmado (negativo si es gasto). */
  onSubmit: (
    amountUsd: number,
    description: string,
    date: string,
  ) => Promise<void> | void;
  isSubmitting?: boolean;
}

const inputCls =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

export default function AddContributionDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: Props) {
  const today = getDateKey(new Date());
  const [amount, setAmount] = useState("");
  const [isExpense, setIsExpense] = useState(false);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today);

  const reset = () => {
    setAmount("");
    setIsExpense(false);
    setDescription("");
    setDate(today);
  };

  const amountNum = parseFloat(amount);
  const valid = Number.isFinite(amountNum) && amountNum > 0;

  const handleSave = async () => {
    if (!valid) return;
    const signed = isExpense ? -Math.abs(amountNum) : Math.abs(amountNum);
    await onSubmit(signed, description.trim(), date);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sumar al fondo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Tipo: aporte (entra) vs gasto (sale) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsExpense(false)}
              className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                !isExpense
                  ? "bg-success/15 text-success ring-1 ring-success/40"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              + Aporte
            </button>
            <button
              type="button"
              onClick={() => setIsExpense(true)}
              className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                isExpense
                  ? "bg-destructive/15 text-destructive ring-1 ring-destructive/40"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              − Gasto
            </button>
          </div>

          <div>
            <label className="text-sm font-medium">Monto (USD)</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className={inputCls}
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descripción (opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isExpense ? "ej: filamento" : "ej: venta 2 lámparas"}
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Fecha</label>
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className={inputCls}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!valid || isSubmitting}
            className="w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting
              ? "Guardando..."
              : isExpense
                ? "Registrar gasto"
                : "Sumar aporte"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
