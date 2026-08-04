"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import { scheduleHydrationPaceReminders } from "@/lib/native/notifications";
import { Dumbbell, SlidersHorizontal } from "lucide-react";
import HydrationBlocksDialog from "./HydrationBlocksDialog";

interface PaceBlock {
  id: string;
  label: string;
  start: string;
  end: string;
  targetMl: number;
  requiresTraining?: boolean;
  active: boolean;
  filledMl: number;
  expectedMl: number;
  status: "pending" | "in_progress" | "done" | "skipped";
}

export interface HydrationPace {
  blocks: PaceBlock[];
  currentBlock: PaceBlock | null;
  totalTargetMl: number;
  consumedMl: number;
  expectedByNowMl: number;
  deficitMl: number;
  aheadMl: number;
  goalReached: boolean;
  trainingActive: boolean;
  trainingDayManual: boolean | null;
  configured: boolean;
  mlPerGlass: number;
}

/**
 * Ritmo del día por tramos: cuánta agua va en cada tramo horario, si venís
 * a ritmo, y el toggle "hoy entreno" que activa el tramo extra. Reprograma
 * las notificaciones locales del teléfono con cada cambio.
 */
export default function HydrationPaceCard({
  mlConsumed,
}: {
  mlConsumed: number;
}) {
  const [pace, setPace] = useState<HydrationPace | null>(null);
  const [showBlocks, setShowBlocks] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.hydration.getPace();
      const p = res.data as HydrationPace;
      setPace(p);
      // Reprogramar los recordatorios del teléfono con el ritmo fresco
      scheduleHydrationPaceReminders(p);
    } catch (error) {
      console.error("Error cargando ritmo de hidratación:", error);
    }
  }, []);

  // Refresca cuando cambia el consumo (cada vaso registrado)
  useEffect(() => {
    load();
  }, [load, mlConsumed]);

  const toggleTraining = async (value: boolean) => {
    try {
      await api.hydration.setTrainingToday(value);
      await load();
      toast.success(
        value ? "Día de entrenamiento 💪" : "Día sin entrenamiento",
        value
          ? "Se sumó el tramo extra de agua"
          : "El tramo extra quedó desactivado"
      );
    } catch {
      toast.error("Error", "No se pudo cambiar el día de entrenamiento");
    }
  };

  if (!pace) return null;

  const statusLabel = pace.goalReached
    ? "🎉 Meta del día cumplida"
    : pace.deficitMl > 0
    ? `${pace.deficitMl}ml abajo del ritmo`
    : pace.aheadMl > 0
    ? `${pace.aheadMl}ml adelantado`
    : "A ritmo";

  return (
    <Card className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Ritmo del día</h3>
          <p
            className={`text-xs ${
              pace.goalReached
                ? "text-success"
                : pace.deficitMl > 0
                ? "text-warning"
                : "text-success"
            }`}
          >
            {statusLabel}
          </p>
        </div>
        <button
          onClick={() => setShowBlocks(true)}
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Configurar tramos"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2.5">
        {pace.blocks.map((b) => {
          const pct = Math.min(100, Math.round((b.filledMl / b.targetMl) * 100));
          const isCurrent = pace.currentBlock?.id === b.id;
          return (
            <div key={b.id} className={b.status === "skipped" ? "opacity-45" : ""}>
              <div className="flex items-center justify-between text-xs">
                <span className={isCurrent ? "font-semibold" : ""}>
                  {b.requiresTraining ? "💪 " : "💧 "}
                  {b.label}
                  <span className="ml-1 text-muted-foreground">
                    {b.start}–{b.end}
                  </span>
                  {isCurrent && (
                    <span className="ml-1.5 rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      ahora
                    </span>
                  )}
                </span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {b.status === "skipped"
                    ? "no aplica hoy"
                    : `${b.filledMl}/${b.targetMl}ml`}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    b.status === "skipped"
                      ? "bg-muted-foreground/30"
                      : pct >= 100
                      ? "bg-success"
                      : isCurrent && b.filledMl < b.expectedMl
                      ? "bg-warning"
                      : "bg-primary"
                  }`}
                  style={{ width: `${b.status === "skipped" ? 0 : pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <span className="flex items-center gap-1.5 text-sm">
          <Dumbbell className="h-4 w-4 text-muted-foreground" />
          Hoy entreno
          {pace.trainingDayManual === null && pace.trainingActive && (
            <span className="text-[10px] text-muted-foreground">
              (auto: registraste actividad)
            </span>
          )}
        </span>
        <Switch
          checked={pace.trainingActive}
          onCheckedChange={toggleTraining}
          aria-label="Hoy entreno"
        />
      </div>

      <HydrationBlocksDialog
        open={showBlocks}
        onOpenChange={setShowBlocks}
        blocks={pace.blocks}
        onSaved={load}
      />
    </Card>
  );
}
