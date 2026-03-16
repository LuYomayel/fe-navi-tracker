"use client";

import { useState } from "react";
import { DayScore } from "@/types";
import { useNaviTrackerStore } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Utensils, Dumbbell, BookOpen, Target, RefreshCw, Droplets } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  won: { label: "DIA GANADO", color: "text-green-500", bg: "bg-green-500/10" },
  partial: { label: "DIA PARCIAL", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  lost: { label: "DIA PERDIDO", color: "text-red-500", bg: "bg-red-500/10" },
  no_data: { label: "SIN DATOS", color: "text-muted-foreground", bg: "bg-muted" },
};

interface DayDetailDialogProps {
  score: DayScore | null;
  onClose: () => void;
}

export default function DayDetailDialog({ score, onClose }: DayDetailDialogProps) {
  const { recalculateDayScore } = useNaviTrackerStore();
  const [recalculating, setRecalculating] = useState(false);

  if (!score) return null;

  const config = statusConfig[score.status] || statusConfig.no_data;

  const handleRecalculate = async () => {
    setRecalculating(true);
    await recalculateDayScore(score.date);
    setRecalculating(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("es", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Dialog open={!!score} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base capitalize">
            {formatDate(score.date)}
          </DialogTitle>
        </DialogHeader>

        {/* Status badge */}
        <div className={`text-center py-3 rounded-lg ${config.bg}`}>
          <p className={`text-lg font-bold ${config.color}`}>{config.label}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {score.percentage}% completado ({score.completedItems} de {score.totalItems})
          </p>
          <Progress value={score.percentage} className="h-2 mt-2 mx-4" />
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          {/* Habits */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span>Habitos</span>
            </div>
            <div className="flex items-center gap-1">
              {score.habitsCompleted === score.habitsTotal && score.habitsTotal > 0 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
              <span className="text-muted-foreground">
                {score.habitsCompleted}/{score.habitsTotal}
              </span>
            </div>
          </div>

          {/* Tasks */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-orange-500" />
              <span>Tareas</span>
            </div>
            <div className="flex items-center gap-1">
              {score.tasksCompleted === score.tasksTotal && score.tasksTotal > 0 ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : score.tasksTotal === 0 ? (
                <span className="text-xs text-muted-foreground">-</span>
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
              <span className="text-muted-foreground">
                {score.tasksCompleted}/{score.tasksTotal}
              </span>
            </div>
          </div>

          {/* Nutrition */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Utensils className="h-4 w-4 text-amber-500" />
              <span>Nutricion</span>
            </div>
            {score.nutritionLogged ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
          </div>

          {/* Exercise */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-purple-500" />
              <span>Ejercicio</span>
            </div>
            {score.exerciseLogged ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
          </div>

          {/* Reflection */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-teal-500" />
              <span>Reflexion</span>
            </div>
            {score.reflectionLogged ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
          </div>

          {/* Hydration */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              <span>Hidratacion</span>
            </div>
            {score.hydrationLogged ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleRecalculate}
          disabled={recalculating}
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${recalculating ? "animate-spin" : ""}`} />
          {recalculating ? "Recalculando..." : "Recalcular"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
