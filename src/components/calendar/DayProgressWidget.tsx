"use client";

import { useEffect } from "react";
import { useNaviTrackerStore } from "@/store";
import Link from "next/link";
import { Target } from "lucide-react";
import { getDateKey } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  won: "Dia ganado",
  partial: "Parcial",
  lost: "Dia perdido",
  no_data: "Sin datos",
};

const statusColors: Record<string, string> = {
  won: "#22c55e",
  partial: "#facc15",
  lost: "#ef4444",
  no_data: "#6b7280",
};

export default function DayProgressWidget() {
  const { currentDayScore, fetchDayScore } = useNaviTrackerStore();
  const today = getDateKey(new Date());

  useEffect(() => {
    fetchDayScore(today);
  }, [today, fetchDayScore]);

  const score = currentDayScore?.date === today ? currentDayScore : null;
  const percentage = score?.percentage ?? 0;
  const status = score?.status ?? "no_data";
  const color = statusColors[status] || statusColors.no_data;

  // SVG circular progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Link href="/agenda" className="block">
      <div className="bg-card rounded-lg border p-4 hover:bg-accent/50 transition-all">
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-24 shrink-0">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted/30"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">{percentage}%</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Progreso del dia</span>
            </div>
            <p className="text-xs font-medium" style={{ color }}>
              {statusLabels[status]}
            </p>
            {score && score.totalItems > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {score.completedItems}/{score.totalItems} items completados
              </p>
            )}
            {score && (
              <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                <span>
                  {score.habitsCompleted}/{score.habitsTotal} habitos
                </span>
                <span>
                  {score.tasksCompleted}/{score.tasksTotal} tareas
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
