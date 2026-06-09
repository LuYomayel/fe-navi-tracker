"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CircularProgressRing } from "@/components/ui/circular-progress-ring";
import { useGoals } from "@/hooks/useGoals";
import AddContributionDialog from "@/components/goal/AddContributionDialog";
import GoalContributionsList from "@/components/goal/GoalContributionsList";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-muted/50 px-2 py-2.5 text-center">
      <div className="font-mono text-sm font-bold tabular-nums">{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function SecLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-0.5 text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
      {children}
    </div>
  );
}

export default function ObjetivoPage() {
  const { progress, isLoading, isSubmitting, loadProgress, addContribution } =
    useGoals();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  if (isLoading && !progress) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-3 gap-2.5">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (!progress?.goal) {
    return (
      <div className="space-y-4">
        <PageHeader title="Objetivo" subtitle="Fondo de ahorro" />
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Todavía no tenés un objetivo de ahorro cargado.
          </p>
        </Card>
      </div>
    );
  }

  const { goal, percentage, remainingUsd, daysRemaining } = progress;
  const pct = Math.round(percentage);
  const current = Math.round(goal.currentUsd);
  const target = Math.round(goal.targetUsd);
  const remaining = Math.round(remainingUsd);

  const months =
    daysRemaining != null ? Math.max(1, daysRemaining / 30.44) : null;
  const monthlyRate = months ? Math.ceil(remainingUsd / months) : null;

  const contributions = goal.contributions ?? [];

  return (
    <div className="space-y-4">
      <PageHeader title="Objetivo" subtitle={goal.name} />

      {/* Anillo de progreso + monto + botón Sumar aporte */}
      <Card className="p-5">
        <div className="flex flex-col items-center gap-4">
          <CircularProgressRing
            value={Math.max(0, goal.currentUsd)}
            goal={goal.targetUsd}
            size={148}
            stroke={12}
            tone="success"
            label={`${pct}%`}
            sublabel="del fondo"
          />
          <p className="font-mono text-lg font-bold tabular-nums">
            USD {current.toLocaleString("es-AR")}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / {target.toLocaleString("es-AR")}
            </span>
          </p>
          <button
            onClick={() => setShowDialog(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Sumar aporte
          </button>
        </div>
      </Card>

      {/* Stats: faltan / días / ritmo mensual */}
      <div className="grid grid-cols-3 gap-2.5">
        <Stat value={`USD ${remaining.toLocaleString("es-AR")}`} label="faltan" />
        <Stat
          value={daysRemaining != null ? `${daysRemaining}` : "—"}
          label="días"
        />
        <Stat
          value={
            monthlyRate != null ? `USD ${monthlyRate.toLocaleString("es-AR")}` : "—"
          }
          label="por mes"
        />
      </div>

      {/* Historial de movimientos */}
      <div className="space-y-2">
        <SecLabel>Movimientos</SecLabel>
        <GoalContributionsList contributions={contributions} />
      </div>

      <div className="h-1" />

      <AddContributionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        isSubmitting={isSubmitting}
        onSubmit={async (amt, desc, date) => {
          await addContribution(amt, desc || undefined, date);
        }}
      />
    </div>
  );
}
