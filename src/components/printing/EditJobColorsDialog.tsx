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
import { LY_BRAND_CLASS } from "@/lib/ly-brand";
import { FILAMENT_COLORS, cssHex } from "@/lib/filament-colors";
import type { PrintJob, ReassignJobEntry } from "@/types/printing";

interface EditJobColorsDialogProps {
  job: PrintJob | null;
  onClose: () => void;
  onSave: (
    id: string,
    entries: ReassignJobEntry[],
    learnHex: boolean,
    markOk: boolean,
  ) => Promise<boolean>;
  isSubmitting?: boolean;
}

interface Row {
  reportedHex: string | null;
  grams: number | "";
  color: string;
}

/**
 * Corregir de que color salio una impresion (ej: la A1 Mini tenia el color
 * viejo en el slot y reporto verde cuando era rojo). Al guardar, lo que se
 * desconto vuelve al stock y se descuenta del color elegido.
 */
export default function EditJobColorsDialog({
  job,
  onClose,
  onSave,
  isSubmitting,
}: EditJobColorsDialogProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [learnHex, setLearnHex] = useState(false);
  const [markOk, setMarkOk] = useState(false);
  const failed = job?.status === "fallida";

  useEffect(() => {
    if (!job) return;
    setLearnHex(false);
    setMarkOk(false);
    const used = job.filamentsUsed ?? [];
    setRows(
      used.map((e, i) => ({
        reportedHex: e.colorHex ?? e.reportedHex ?? null,
        grams: e.grams,
        // Precarga el color del que se desconto (si fue de un solo rollo por consumo)
        color:
          e.color ??
          (used.length === 1
            ? job.deducted?.[0]?.color?.toLowerCase()
            : job.deducted?.[i]?.color?.toLowerCase()) ??
          "",
      })),
    );
  }, [job]);

  const valid =
    rows.length > 0 &&
    rows.every(
      (r) =>
        (FILAMENT_COLORS as readonly string[]).includes(r.color) &&
        Number(r.grams) > 0,
    );

  const handleSave = async () => {
    if (!job || !valid) return;
    const ok = await onSave(
      job.id,
      rows.map((r) => ({ color: r.color, grams: Number(r.grams) })),
      learnHex,
      markOk,
    );
    if (ok) onClose();
  };

  return (
    <Dialog open={job !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${LY_BRAND_CLASS} max-w-md`}>
        <DialogHeader>
          <DialogTitle>Corregir color</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {job?.title}
            {job?.printer ? ` · ${job.printer}` : ""}. Lo que se descontó vuelve
            al stock y se descuenta del color que elijas (rollo abierto
            primero).
          </p>
          {rows.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Esta impresión no tiene consumos cargados.
            </p>
          )}
          {rows.map((r, i) => {
            const swatch = cssHex(r.reportedHex);
            return (
              <div key={i} className="flex items-center gap-2">
                <span
                  title={
                    swatch ? `Bambu reportó ${swatch}` : "Sin color reportado"
                  }
                  className="h-6 w-6 shrink-0 rounded-full border"
                  style={swatch ? { backgroundColor: swatch } : undefined}
                />
                <select
                  aria-label="Color real"
                  className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                  value={r.color}
                  onChange={(e) => {
                    const next = [...rows];
                    next[i] = { ...next[i], color: e.target.value };
                    setRows(next);
                  }}
                >
                  <option value="">Elegí el color…</option>
                  {FILAMENT_COLORS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  min={0}
                  step="0.1"
                  aria-label="Gramos"
                  className="w-24"
                  value={r.grams}
                  onChange={(e) => {
                    const next = [...rows];
                    next[i] = {
                      ...next[i],
                      grams:
                        e.target.value === "" ? "" : Number(e.target.value),
                    };
                    setRows(next);
                  }}
                />
                <span className="text-xs text-muted-foreground">g</span>
              </div>
            );
          })}
          {failed && (
            <label className="flex cursor-pointer items-start gap-2 rounded-md border border-amber-500/50 bg-amber-500/10 p-2.5 text-xs">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0"
                checked={markOk}
                onChange={(e) => setMarkOk(e.target.checked)}
              />
              <span>
                <span className="font-semibold">
                  Se imprimió igual: descontar del stock
                </span>
                <span className="block text-muted-foreground">
                  Bambu marcó esta impresión como fallida o cancelada, por eso
                  no descontó. Si salió, tildalo. Si se cortó a la mitad, bajá
                  los gramos antes de guardar.
                </span>
              </span>
            </label>
          )}
          {rows.some((r) => r.reportedHex) && (
            <label className="flex cursor-pointer items-start gap-2 rounded-md border p-2.5 text-xs">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0"
                checked={learnHex}
                onChange={(e) => setLearnHex(e.target.checked)}
              />
              <span>
                <span className="font-semibold">Recordar este color</span>
                <span className="block text-muted-foreground">
                  El color que mandó la impresora queda guardado en los rollos
                  de ese color y la próxima vez se descuenta solo. No lo
                  tildes si solo te olvidaste de cambiar el color del slot en
                  Handy.
                </span>
              </span>
            </label>
          )}
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
