import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PillOption<T extends string = string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

export interface PillToggleProps<T extends string = string> {
  options: (PillOption<T> | T)[];
  value: T;
  onChange: (value: T) => void;
  fullWidth?: boolean;
  className?: string;
  "aria-label"?: string;
}

/**
 * Segmented control / pill toggle. Consolida las 5+ copias de "pills" del
 * codebase. Reemplaza filtros cíclicos no descubribles por opciones visibles.
 */
export function PillToggle<T extends string = string>({
  options,
  value,
  onChange,
  fullWidth,
  className,
  ...props
}: PillToggleProps<T>) {
  const norm: PillOption<T>[] = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );

  return (
    <div
      role="tablist"
      aria-label={props["aria-label"]}
      className={cn(
        "gap-0.5 rounded-md bg-muted p-[3px]",
        fullWidth ? "flex w-full" : "inline-flex",
        className,
      )}
    >
      {norm.map((o) => {
        const on = value === o.value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[9px] px-3.5 py-[7px] text-[13px] font-semibold transition-all duration-fast active:scale-[0.98]",
              fullWidth && "flex-1",
              on
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon && <Icon size={15} strokeWidth={2} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
