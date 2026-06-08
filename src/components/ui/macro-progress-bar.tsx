import * as React from "react";
import { cn } from "@/lib/utils";

type ChartTone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";

const fillClass: Record<ChartTone, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
};

export interface MacroProgressBarProps {
  label: string;
  current?: number;
  goal?: number;
  unit?: string;
  tone?: ChartTone;
  className?: string;
}

/**
 * Barra de macro tokenizada (proteína/carbs/grasas). Reemplaza las 9+ copias
 * pegadas. Si se pasa del objetivo, la barra se pinta warning.
 */
export function MacroProgressBar({
  label,
  current = 0,
  goal = 0,
  unit = "g",
  tone = "chart-2",
  className,
}: MacroProgressBarProps) {
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
  const over = goal > 0 && current > goal;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-medium">{label}</span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {current} / {goal}
          {unit} · {pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-slow ease-standard",
            over ? "bg-warning" : fillClass[tone],
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
