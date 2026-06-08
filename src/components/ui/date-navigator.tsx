"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface DateNavigatorProps {
  label: React.ReactNode;
  onPrev: () => void;
  onNext: () => void;
  onToday?: () => void;
  todayLabel?: string;
  className?: string;
}

/** Navegador de fechas (← label → + botón "Hoy"). Para Día/Mes del calendario. */
export function DateNavigator({
  label,
  onPrev,
  onNext,
  onToday,
  todayLabel = "Hoy",
  className,
}: DateNavigatorProps) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrev}
        aria-label="Anterior"
      >
        <ChevronLeft />
      </Button>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{label}</span>
        {onToday && (
          <Button variant="tonal" size="sm" onClick={onToday}>
            {todayLabel}
          </Button>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        aria-label="Siguiente"
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
