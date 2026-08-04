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
  /**
   * Acción rápida a la derecha: registra sin salir de la pantalla. Va como
   * botón aparte del row (no anidado) para no romper el HTML ni el click.
   */
  quickAction?: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    disabled?: boolean;
  };
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
  quickAction,
}: SummaryRowProps) {
  const QuickIcon = quickAction?.icon;
  return (
    <div
      className={cn(
        "flex w-full items-center gap-2 rounded-lg border bg-card pr-2 shadow-sm transition-all duration-fast",
        className,
      )}
    >
      <button
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-l-lg px-3.5 py-[11px] text-left transition-colors hover:bg-accent/50 active:scale-[0.985]"
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
        {!quickAction && (
          <ChevronRight size={18} className="text-muted-foreground" />
        )}
      </button>

      {quickAction && QuickIcon && (
        <button
          onClick={quickAction.onClick}
          disabled={quickAction.disabled}
          aria-label={quickAction.label}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary transition-all hover:bg-primary/20 active:scale-90 disabled:opacity-40"
        >
          <QuickIcon size={20} />
        </button>
      )}
    </div>
  );
}
