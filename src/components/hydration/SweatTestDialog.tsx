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
import { getDateKey } from "@/lib/utils";

export interface SweatTest {
  id: string;
  date: string;
  activity: string | null;
  durationMin: number;
  weightBeforeKg: number;
  weightAfterKg: number;
  fluidIntakeMl: number;
  indoor: boolean | null;
  sweatMl: number;
  sweatRateMlPerHour: number;
  netDeficitMl: number;
  pctBodyWeightLost: number;
  level: "ok" | "sed" | "rendimiento" | "fuerza" | "critico";
}

const LEVEL_COPY: Record<
  SweatTest["level"],
  { label: string; detail: string; tone: string }
> = {
  ok: {
    label: "Bien hidratado",
    detail: "Perdiste menos del 1% del peso. Sin impacto en el rendimiento.",
    tone: "text-success",
  },
  sed: {
    label: "Aparece la sed",
    detail: "Entre 1 y 2%. Rendimiento casi intacto, pero ya venís en déficit.",
    tone: "text-success",
  },
  rendimiento: {
    label: "Caída de rendimiento",
    detail:
      "Pasaste el 2%: caída medible del aeróbico, el mismo esfuerzo se siente más duro.",
    tone: "text-warning",
  },
  fuerza: {
    label: "Baja fuerza y potencia",
    detail: "Pasaste el 3%: baja la potencia y se compromete la termorregulación.",
    tone: "text-destructive",
  },
  critico: {
    label: "Zona de riesgo",
    detail: "Más del 5%: territorio de golpe de calor. Hay que reponer mucho más.",
    tone: "text-destructive",
  },
};

/**
 * Carga de un test de sudoración: pesarse antes y después de entrenar
 * (desnudo y seco) anotando lo que se tomó durante. Devuelve la tasa real
 * en ml/h, que es lo que define la meta diaria de agua.
 */
export default function SweatTestDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [date, setDate] = useState(getDateKey(new Date()));
  const [activity, setActivity] = useState("Handball");
  const [durationMin, setDurationMin] = useState("120");
  const [weightBefore, setWeightBefore] = useState("");
  const [weightAfter, setWeightAfter] = useState("");
  const [fluidMl, setFluidMl] = useState("700");
  const [indoor, setIndoor] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SweatTest | null>(null);

  useEffect(() => {
    if (open) {
      setDate(getDateKey(new Date()));
      setResult(null);
      setWeightBefore("");
      setWeightAfter("");
    }
  }, [open]);

  const before = parseFloat(weightBefore.replace(",", "."));
  const after = parseFloat(weightAfter.replace(",", "."));
  const canSave =
    Number.isFinite(before) &&
    Number.isFinite(after) &&
    after <= before &&
    parseInt(durationMin) > 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.sweatTests.create({
        date,
        activity: activity || undefined,
        durationMin: parseInt(durationMin),
        weightBeforeKg: before,
        weightAfterKg: after,
        fluidIntakeMl: parseInt(fluidMl) || 0,
        indoor,
      });
      if (!res.success) throw new Error();
      setResult(res.data as SweatTest);
      onSaved();
    } catch (error: unknown) {
      const msg =
        error && typeof error === "object" && "message" in error
          ? String((error as Error).message)
          : "Revisá los pesos y la duración";
      toast.error("No se pudo guardar el test", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {result ? "Tu tasa de sudoración" : "Test de sudoración"}
          </DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-3">
            <div className="rounded-lg border bg-muted/30 p-4 text-center">
              <p className="text-3xl font-bold tabular-nums">
                {result.sweatRateMlPerHour} ml/h
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Sudaste {(result.sweatMl / 1000).toFixed(2)} L en{" "}
                {result.durationMin} min
              </p>
            </div>

            <div className="rounded-lg border p-3">
              <p className={`text-sm font-semibold ${LEVEL_COPY[result.level].tone}`}>
                {LEVEL_COPY[result.level].label} · {result.pctBodyWeightLost}% del
                peso
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {LEVEL_COPY[result.level].detail}
              </p>
            </div>

            <div className="rounded-lg bg-primary/8 p-3 text-sm">
              💧 Reponé{" "}
              <span className="font-semibold">
                {Math.round(result.netDeficitMl * 1.3)} ml
              </span>{" "}
              en las próximas 2-4 horas (130% de lo perdido: después de entrenar
              seguís sudando y el riñón sigue filtrando).
            </div>

            <p className="text-[11px] text-muted-foreground">
              Repetilo 2-3 veces en condiciones distintas (verano/invierno,
              entrenamiento/partido). Con eso ya tenés tu número personal.
            </p>

            <div className="flex justify-end border-t pt-3">
              <Button onClick={() => onOpenChange(false)}>Listo</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              Pesate <span className="font-medium text-foreground">desnudo y seco</span>{" "}
              justo antes de entrenar y de nuevo al terminar (secándote bien).
              Anotá lo que tomaste durante. Cada kilo perdido = 1 litro de agua.
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-muted-foreground">Fecha</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">
                  Duración (min)
                </label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={durationMin}
                  onChange={(e) => setDurationMin(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground">Actividad</label>
              <Input
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="Handball, gimnasio, partido…"
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-muted-foreground">
                  Peso antes (kg)
                </label>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={weightBefore}
                  onChange={(e) => setWeightBefore(e.target.value)}
                  placeholder="82.0"
                  className="h-9"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground">
                  Peso después (kg)
                </label>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={weightAfter}
                  onChange={(e) => setWeightAfter(e.target.value)}
                  placeholder="80.5"
                  className="h-9"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-muted-foreground">
                Líquido tomado durante (ml)
              </label>
              <Input
                type="number"
                inputMode="numeric"
                step="50"
                value={fluidMl}
                onChange={(e) => setFluidMl(e.target.value)}
                className="h-9"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={indoor}
                onChange={(e) => setIndoor(e.target.checked)}
                className="h-3.5 w-3.5 accent-[hsl(var(--primary))]"
              />
              🏟️ Cancha cerrada (sin viento y con humedad se suda más)
            </label>

            {Number.isFinite(before) && Number.isFinite(after) && after > before && (
              <p className="text-xs text-destructive">
                El peso después no puede ser mayor al de antes.
              </p>
            )}

            <div className="flex justify-end gap-2 border-t pt-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving || !canSave}>
                {saving ? "Calculando…" : "Calcular mi tasa"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
