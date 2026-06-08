import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconWell } from "./icon-well";
import type { Tone } from "./tone";

export interface StatCardProps {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
  unit?: string;
  /** ej "+8%" (verde si empieza con +, rojo si no) */
  trend?: string;
  tone?: Tone;
  className?: string;
  onClick?: () => void;
}

/** Card de métrica: número mono + label + icon-well + trend opcional. */
export function StatCard({
  icon,
  label,
  value,
  unit,
  trend,
  tone = "primary",
  className,
  onClick,
}: StatCardProps) {
  const up = typeof trend === "string" && trend.trim().startsWith("+");
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col gap-[7px] rounded-lg border bg-card p-3.5 shadow-sm",
        onClick && "cursor-pointer transition-transform active:scale-[0.98]",
        className,
      )}
    >
      <div className="flex items-center">
        {icon && <IconWell icon={icon} tone={tone} size={30} iconSize={15} />}
        {trend && (
          <span
            className={cn(
              "ml-auto font-mono text-xs font-bold tabular-nums",
              up ? "text-success" : "text-destructive",
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <span className="font-mono text-[25px] font-bold tracking-[-0.01em] tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="ml-0.5 font-mono text-[13px] font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
    </div>
  );
}
