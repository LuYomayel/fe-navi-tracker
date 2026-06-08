import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** métrica a la derecha (ej "1.842 / 2.200 kcal") */
  metric?: React.ReactNode;
  metricLabel?: string;
  /** acción a la derecha (ej icon-button) */
  action?: React.ReactNode;
  className?: string;
}

/** Header unificado de página (reemplaza ~4 headers ad-hoc). */
export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  metric,
  metricLabel,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-3.5", className)}>
      <div className="flex min-w-0 gap-[11px]">
        {Icon && (
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Icon size={19} strokeWidth={2} />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-[23px] font-semibold leading-[29px] tracking-[-0.01em]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {(metric != null || action) && (
        <div className="flex shrink-0 items-center gap-2.5">
          {metric != null && (
            <div className="text-right">
              <div className="font-mono text-[19px] font-bold leading-[1.1] tabular-nums">
                {metric}
              </div>
              {metricLabel && (
                <div className="text-[11px] font-medium text-muted-foreground">
                  {metricLabel}
                </div>
              )}
            </div>
          )}
          {action}
        </div>
      )}
    </div>
  );
}
