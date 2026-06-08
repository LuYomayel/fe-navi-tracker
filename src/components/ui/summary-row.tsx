import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconWell } from "./icon-well";
import type { Tone } from "./tone";

export interface SummaryRowProps {
  icon: LucideIcon;
  label: string;
  sub?: string;
  value?: React.ReactNode;
  tone?: Tone;
  onClick?: () => void;
  className?: string;
}

/**
 * Fila resumen clickable de 1 línea. Reemplaza los mini-widgets duplicados del
 * dashboard (icon-well + label + sub + valor mono + chevron).
 */
export function SummaryRow({
  icon,
  label,
  sub,
  value,
  tone = "primary",
  onClick,
  className,
}: SummaryRowProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border bg-card px-3.5 py-[11px] text-left shadow-sm transition-all duration-fast hover:bg-accent/50 active:scale-[0.985]",
        className,
      )}
    >
      <IconWell icon={icon} tone={tone} size={32} iconSize={16} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{label}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
      {value != null && (
        <span className="font-mono text-[15px] font-bold tabular-nums">
          {value}
        </span>
      )}
      <ChevronRight size={18} className="text-muted-foreground" />
    </button>
  );
}
