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
import { LY_BRAND_CLASS } from "@/lib/ly-brand";
import { FILAMENT_COLORS, swatchStyle } from "@/lib/filament-colors";
import type {
  JobPartOutput,
  PartsOverview,
  PrintJob,
} from "@/types/printing";

interface JobPartsDialogProps {
  job: PrintJob | null;
  parts: PartsOverview | null;
  hexOf: (color: string) => string | undefined;
  isSubmitting: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    outputs: JobPartOutput[],
    remember: boolean,
  ) => Promise<boolean>;
}

type Mode = "cada" | "color" | "combo";

interface Row {
  qty: number | "";
  mode: Mode;
  color: string;
}

/** Colores que uso la impresion con sus gramos (de los rollos descontados). */
function jobColors(job: PrintJob): { color: string; grams: number }[] {
  const map = new Map<string, number>();
  const deducted = job.deducted ?? [];
  if (deducted.length) {
    for (const d of deducted) {
      if (!d.color) continue;
      const c = d.color.toLowerCase();
      map.set(c, (map.get(c) ?? 0) + d.grams);
    }
  } else {
    for (const e of job.filamentsUsed ?? []) {
      if (!e.color) continue;
      const c = e.color.toLowerCase();
      map.set(c, (map.get(c) ?? 0) + (e.grams ?? 0));
    }
  }
  return Array.from(map, ([color, grams]) => ({ color, grams }));
}

/**
 * "Qué salió de esta impresión": piezas y cantidades; el color sale de la
 * impresion (con varios colores: en cada color, uno puntual o combinado).
 * Guardar reemplaza lo que la impresion habia sumado.
 */
export default function JobPartsDialog({
  job,
  parts,
  hexOf,
  isSubmitting,
  onClose,
  onSave,
}: JobPartsDialogProps) {
  const [productId, setProductId] = useState("");
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [remember, setRemember] = useState(false);

  const colors = useMemo(() => (job ? jobColors(job) : []), [job]);
  const multi = colors.length > 1;
  const product = parts?.products.find((p) => p.productId === productId);

  const defaultRows = (pid: string, prev?: JobPartOutput[] | null) => {
    const prod = parts?.products.find((p) => p.productId === pid);
    const next: Record<string, Row> = {};
    for (const part of prod?.parts ?? []) {
      const line = prod?.lines.find((l) => l.partId === part.id);
      const fixed =
        line?.colorMode === "fijo" && line.fixedColor ? line.fixedColor : "";
      const saved = prev?.find((o) => o.partId === part.id);
      next[part.id] = saved
        ? {
            qty: saved.qty,
            mode: saved.combo ? "combo" : saved.color ? "color" : "cada",
            color: saved.color ?? "",
          }
        : {
            qty: "",
            mode: multi && fixed ? "color" : "cada",
            color: fixed,
          };
    }
    return next;
  };

  useEffect(() => {
    if (!job) return;
    setRemember(false);
    const prev = job.partsOutputs ?? null;
    const fromOutputs = prev?.length
      ? parts?.products.find((p) =>
          p.parts.some((pt) => pt.id === prev[0].partId),
        )?.productId
      : undefined;
    const fromJob = parts?.products.some((p) => p.productId === job.productId)
      ? (job.productId ?? undefined)
      : undefined;
    const pid = fromOutputs ?? fromJob ?? "";
    setProductId(pid);
    setRows(pid ? defaultRows(pid, prev) : {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job, parts]);

  const outputs: JobPartOutput[] = Object.entries(rows)
    .filter(([, r]) => typeof r.qty === "number" && r.qty > 0)
    .map(([partId, r]) => {
      const qty = r.qty as number;
      if (r.mode === "combo") return { partId, qty, combo: true };
      if (r.mode === "color" && r.color) return { partId, qty, color: r.color };
      return multi ? { partId, qty, perColorLine: true } : { partId, qty };
    });

  // Chequeo por color: piezas que se suman en cada color vs gramos usados.
  const perColor = new Map<string, number>();
  const add = (c: string, n: number) =>
    perColor.set(c, (perColor.get(c) ?? 0) + n);
  for (const o of outputs) {
    if (o.combo) add(colors.map((c) => c.color).join("+") || "?", o.qty);
    else if (o.color) add(o.color, o.qty);
    else if (colors.length) colors.forEach((c) => add(c.color, o.qty));
    else add("?", o.qty);
  }
  const jobColorSet = new Set(colors.map((c) => c.color));
  const extraColors = Array.from(perColor.keys()).filter(
    (c) => !jobColorSet.has(c) && !c.includes("+"),
  );
  const needsColor = colors.length === 0 && outputs.some((o) => !o.color);
  const valid =
    !!job &&
    outputs.length > 0 &&
    !needsColor &&
    Object.values(rows).every(
      (r) => r.qty === "" || r.qty === 0 || (Number.isInteger(r.qty) && r.qty > 0),
    ) &&
    Object.values(rows).every(
      (r) => !(typeof r.qty === "number" && r.qty > 0 && r.mode === "color" && !r.color),
    );

  const setRow = (partId: string, patch: Partial<Row>) =>
    setRows((prev) => ({ ...prev, [partId]: { ...prev[partId], ...patch } }));

  const handleSave = async () => {
    if (!job || !valid) return;
    const ok = await onSave(job.id, outputs, remember);
    if (ok) onClose();
  };

  return (
    <Dialog open={job !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${LY_BRAND_CLASS} max-h-[90vh] max-w-lg overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle>Piezas de esta impresión</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {job?.title}
            {job?.grams ? ` · ${Math.round(job.grams)}g` : ""}
            {job?.printer ? ` · ${job.printer}` : ""}. Cargá qué salió: se suma
            al stock de piezas en los colores de la impresión. Si ya tenía
            piezas cargadas, se reemplazan.
          </p>

          <div className="flex flex-wrap gap-1.5">
            {colors.length === 0 ? (
              <span className="text-xs text-warning-foreground dark:text-warning">
                No sé de qué color salió: elegí el color de cada pieza.
              </span>
            ) : (
              colors.map((c) => (
                <span
                  key={c.color}
                  className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
                >
                  <span
                    className="h-3 w-3 rounded-full border border-border"
                    style={swatchStyle(c.color, hexOf)}
                  />
                  {c.color} · {Math.round(c.grams * 10) / 10}g
                </span>
              ))
            )}
          </div>

          <select
            aria-label="Producto"
            className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              setRows(e.target.value ? defaultRows(e.target.value) : {});
            }}
          >
            <option value="">Elegí el producto…</option>
            {(parts?.products ?? []).map((p) => (
              <option key={p.productId} value={p.productId}>
                {p.productName}
              </option>
            ))}
          </select>

          {product && (
            <div className="space-y-1.5">
              {product.parts.map((part) => {
                const r = rows[part.id];
                if (!r) return null;
                const pickColor = r.mode === "color" || (!multi && colors.length === 0);
                return (
                  <div key={part.id} className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-xs">
                      {part.name}
                    </span>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      aria-label={`Cantidad de ${part.name}`}
                      className="h-9 w-16 text-center"
                      placeholder="0"
                      value={r.qty}
                      onChange={(e) =>
                        setRow(part.id, {
                          qty: e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                    />
                    {multi && (
                      <select
                        aria-label={`Color de ${part.name}`}
                        className="h-9 w-32 rounded-md border border-input bg-background px-1 text-xs"
                        value={r.mode === "color" ? `c:${r.color}` : r.mode}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v.startsWith("c:"))
                            setRow(part.id, { mode: "color", color: v.slice(2) });
                          else setRow(part.id, { mode: v as Mode, color: "" });
                        }}
                      >
                        <option value="cada">en cada color</option>
                        <option value="combo">combinado</option>
                        {colors.map((c) => (
                          <option key={c.color} value={`c:${c.color}`}>
                            solo {c.color}
                          </option>
                        ))}
                        {r.mode === "color" &&
                          r.color &&
                          !jobColorSet.has(r.color) && (
                            <option value={`c:${r.color}`}>solo {r.color}</option>
                          )}
                      </select>
                    )}
                    {!multi && pickColor && (
                      <select
                        aria-label={`Color de ${part.name}`}
                        className="h-9 w-32 rounded-md border border-input bg-background px-1 text-xs"
                        value={r.color}
                        onChange={(e) =>
                          setRow(part.id, { mode: "color", color: e.target.value })
                        }
                      >
                        <option value="">color…</option>
                        {FILAMENT_COLORS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {perColor.size > 0 && (
            <div className="rounded-md border p-2 text-xs">
              <div className="mb-1 font-semibold">Se suma</div>
              {Array.from(perColor, ([c, n]) => {
                const grams = colors.find((x) => x.color === c)?.grams;
                return (
                  <div key={c} className="flex items-center gap-1.5 tabular-nums">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full border border-border"
                      style={swatchStyle(c, hexOf)}
                    />
                    <span className="flex-1">{c}</span>
                    <span className="font-mono font-bold">{n} pza</span>
                    {grams ? (
                      <span className="w-20 text-right text-muted-foreground">
                        {Math.round((grams / n) * 10) / 10} g/pza
                      </span>
                    ) : null}
                  </div>
                );
              })}
              {colors
                .filter((c) => c.grams > 0 && !perColor.has(c.color))
                .filter(() => !outputs.some((o) => o.combo))
                .map((c) => (
                  <p key={c.color} className="mt-1 text-warning-foreground dark:text-warning">
                    ⚠️ Se usaron {Math.round(c.grams)}g de {c.color} y no le
                    asignaste piezas.
                  </p>
                ))}
              {colors.length > 0 &&
                extraColors.map((c) => (
                  <p key={c} className="mt-1 text-warning-foreground dark:text-warning">
                    ⚠️ La impresión no usó {c}.
                  </p>
                ))}
            </div>
          )}

          <label
            className={`flex items-start gap-2 rounded-md border p-2.5 text-xs ${
              job?.plateKey ? "cursor-pointer" : "opacity-60"
            }`}
          >
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0"
              disabled={!job?.plateKey}
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>
              <span className="font-semibold">Recordar esta placa</span>
              <span className="block text-muted-foreground">
                {job?.plateKey
                  ? "La próxima vez que imprimas la misma placa se carga sola."
                  : "Esta impresión no trae identificador de placa (solo las del sync de Bambu)."}
              </span>
            </span>
          </label>

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
