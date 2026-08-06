"use client";

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
  const listRef = React.useRef<HTMLDivElement>(null);

  // Si la tab activa quedó fuera de la parte visible del scroll, traerla.
  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      '[aria-selected="true"]',
    );
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [value]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={props["aria-label"]}
      className={cn(
        // En mobile los labels NO se truncan: si no entran, la tira scrollea
        // (sin barra visible). Ver flex-[1_0_auto] en cada tab.
        "scrollbar-hide flex snap-x gap-0.5 overflow-x-auto rounded-md bg-muted p-[3px]",
        fullWidth ? "w-full" : "inline-flex",
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
              "inline-flex min-h-[38px] snap-start items-center justify-center gap-1.5 whitespace-nowrap rounded-[9px] px-3.5 py-2 text-[13px] font-semibold transition-all duration-fast active:scale-[0.98]",
              // grow para repartir el ancho cuando sobra, pero shrink 0 para
              // no achicarse nunca por debajo del texto (nada de "Resum…").
              fullWidth && "flex-[1_0_auto]",
              on
                ? "bg-card text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon && <Icon size={15} strokeWidth={2} className="shrink-0" />}
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
