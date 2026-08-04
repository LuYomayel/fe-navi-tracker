"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import { Droplets, FlaskConical, Trash2 } from "lucide-react";
import SweatTestDialog, { SweatTest } from "./SweatTestDialog";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";

interface Stats {
  count: number;
  avgRateMlPerHour: number | null;
  maxRateMlPerHour: number | null;
  minRateMlPerHour: number | null;
  lastTest: SweatTest | null;
}

interface DayIntake {
  drinkMl: number;
  glasses: number;
  suggestedBlocks: {
    id: string;
    label: string;
    start: string;
    end: string;
    targetMl: number;
    requiresTraining?: boolean;
  }[];
}

interface Recommendation {
  weightKg: number;
  trainingHours: number;
  sweatRateMlPerHour: number;
  estimated: boolean;
  testsCount: number;
  trainingDay: DayIntake;
  restDay: DayIntake;
  currentGoalMl: number;
  gapTrainingMl: number;
}

/**
 * Tasa de sudoración medida + cuánta agua necesita realmente por día.
 * Una meta fija no sirve: los días que entrena queda corto y los que no, sobra.
 */
export default function SweatTestCard({ onBlocksApplied }: { onBlocksApplied?: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [rec, setRec] = useState<Recommendation | null>(null);
  const [tests, setTests] = useState<SweatTest[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [needsWeight, setNeedsWeight] = useState(false);
  const [applying, setApplying] = useState(false);
  const confirmDelete = useConfirm<string>();

  const load = useCallback(async () => {
    try {
      const [statsRes, listRes] = await Promise.all([
        api.sweatTests.getStats(),
        api.sweatTests.getAll(),
      ]);
      if (statsRes?.success) setStats(statsRes.data as Stats);
      if (listRes?.success) setTests((listRes.data as SweatTest[]) ?? []);
    } catch (error) {
      console.error("Error cargando tests de sudoración:", error);
    }
    // La recomendación necesita el peso: si no lo tiene, se avisa en la card.
    try {
      const recRes = await api.sweatTests.getRecommendation(2);
      if (recRes?.success) {
        setRec(recRes.data as Recommendation);
        setNeedsWeight(false);
      }
    } catch {
      setRec(null);
      setNeedsWeight(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const applyBlocks = async (blocks: DayIntake["suggestedBlocks"]) => {
    setApplying(true);
    try {
      const res = await api.hydration.setBlocks(blocks);
      if (!res.success) throw new Error();
      toast.success(
        "Tramos actualizados",
        "Tu plan de agua ahora usa tu tasa de sudoración medida"
      );
      onBlocksApplied?.();
    } catch {
      toast.error("Error", "No se pudieron aplicar los tramos");
    } finally {
      setApplying(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirmDelete.confirm(id))) return;
    try {
      await api.sweatTests.remove(id);
      await load();
      toast.success("Test borrado");
    } catch {
      toast.error("Error", "No se pudo borrar el test");
    }
  };

  const hasTests = (stats?.count ?? 0) > 0;

  return (
    <Card className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
            Tasa de sudoración
          </h3>
          <p className="text-xs text-muted-foreground">
            {hasTests
              ? `${stats?.count} test${stats!.count > 1 ? "s" : ""} · promedio ${stats?.avgRateMlPerHour} ml/h`
              : "Sin medir: la meta se calcula con una estimación"}
          </p>
        </div>
        <Button size="sm" variant={hasTests ? "outline" : "default"} onClick={() => setShowDialog(true)}>
          {hasTests ? "Nuevo test" : "Medir"}
        </Button>
      </div>

      {hasTests && stats?.minRateMlPerHour !== stats?.maxRateMlPerHour && (
        <p className="text-[11px] text-muted-foreground">
          Rango medido: {stats?.minRateMlPerHour} a {stats?.maxRateMlPerHour} ml/h
          según el día.
        </p>
      )}

      {needsWeight && (
        <p className="border-t pt-3 text-xs text-muted-foreground">
          Registrá tu peso (tab Peso) y calculo cuánta agua necesitás por día
          según cuánto sudás.
        </p>
      )}

      {rec && (
        <div className="space-y-2 border-t pt-3">
          <p className="text-xs font-medium">
            Cuánta agua necesitás{" "}
            <span className="font-normal text-muted-foreground">
              ({rec.weightKg} kg · {rec.sweatRateMlPerHour} ml/h
              {rec.estimated ? " estimado" : " medido"})
            </span>
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border p-2.5">
              <p className="text-[11px] text-muted-foreground">
                Día que entrenás ({rec.trainingHours}h)
              </p>
              <p className="text-lg font-bold tabular-nums">
                {(rec.trainingDay.drinkMl / 1000).toFixed(1)} L
              </p>
              <p className="text-[10px] text-muted-foreground">
                {rec.trainingDay.glasses} vasos
              </p>
            </div>
            <div className="rounded-lg border p-2.5">
              <p className="text-[11px] text-muted-foreground">Día de descanso</p>
              <p className="text-lg font-bold tabular-nums">
                {(rec.restDay.drinkMl / 1000).toFixed(1)} L
              </p>
              <p className="text-[10px] text-muted-foreground">
                {rec.restDay.glasses} vasos
              </p>
            </div>
          </div>

          {rec.gapTrainingMl > 0 && (
            <p className="text-[11px] text-warning">
              Tu meta actual ({(rec.currentGoalMl / 1000).toFixed(1)} L) queda{" "}
              {rec.gapTrainingMl} ml corta los días que entrenás.
            </p>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={applying}
            onClick={() => applyBlocks(rec.trainingDay.suggestedBlocks)}
          >
            <Droplets className="mr-1.5 h-4 w-4" />
            {applying ? "Aplicando…" : "Usar esto como mis tramos"}
          </Button>

          {rec.estimated && (
            <p className="text-[11px] text-muted-foreground">
              Es una estimación con 1000 ml/h. La sudoración va de 500 a 2500 ml/h
              según la persona: hacé un test y el número pasa a ser tuyo.
            </p>
          )}
        </div>
      )}

      {hasTests && (
        <div className="border-t pt-2">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="text-[11px] text-muted-foreground underline-offset-2 hover:underline"
          >
            {showHistory ? "Ocultar tests" : `Ver mis ${stats?.count} tests`}
          </button>
          {showHistory && (
            <div className="mt-2 space-y-1.5">
              {tests.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-2 rounded-md bg-muted/30 px-2.5 py-1.5 text-xs"
                >
                  <span className="min-w-0 truncate">
                    {t.date} · {t.activity || "entrenamiento"} · {t.durationMin}′
                  </span>
                  <span className="flex items-center gap-2 whitespace-nowrap font-mono tabular-nums">
                    {t.sweatRateMlPerHour} ml/h
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Borrar test del ${t.date}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <SweatTestDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSaved={load}
      />

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={confirmDelete.onOpenChange}
        onConfirm={confirmDelete.onConfirm}
        title="¿Borrar este test?"
        description="Se recalcula tu tasa promedio sin él."
        confirmLabel="Borrar"
        destructive
      />
    </Card>
  );
}
