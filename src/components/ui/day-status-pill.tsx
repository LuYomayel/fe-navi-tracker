import * as React from "react";
import { cn } from "@/lib/utils";

export type DayStatus = "won" | "partial" | "lost" | "none";

const LABEL: Record<DayStatus, string> = {
  won: "Día ganado",
  partial: "Día parcial",
  lost: "Día perdido",
  none: "Sin datos",
};

const STYLES: Record<DayStatus, { pill: string; dot: string }> = {
  won: { pill: "bg-success/12 text-success", dot: "bg-success" },
  partial: {
    pill: "bg-warning/16 text-warning-foreground dark:text-warning",
    dot: "bg-warning",
  },
  lost: { pill: "bg-destructive/12 text-destructive", dot: "bg-destructive" },
  none: { pill: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
};

export interface DayStatusPillProps {
  status?: DayStatus;
  showDot?: boolean;
  label?: string;
  className?: string;
}

/** Fuente única del estado del día (won/partial/lost/none). */
export function DayStatusPill({
  status = "none",
  showDot = true,
  label,
  className,
}: DayStatusPillProps) {
  const s = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full py-1 pl-2.5 pr-[11px] text-xs font-semibold",
        s.pill,
        className,
      )}
    >
      {showDot && (
        <span className={cn("h-[7px] w-[7px] rounded-full", s.dot)} />
      )}
      {label ?? LABEL[status]}
    </span>
  );
}
