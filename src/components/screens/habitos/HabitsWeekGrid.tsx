"use client";

import * as React from "react";
import { Check, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarCheck } from "lucide-react";
import { useNaviTrackerStore } from "@/store";
import { getDateKey } from "@/lib/utils";
import type { Activity } from "@/types";

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

/** Devuelve los 7 días de la semana actual empezando en lunes. */
function getMondayWeek(reference: Date): Date[] {
  const base = new Date(reference);
  base.setHours(0, 0, 0, 0);
  const dow = base.getDay(); // 0=Dom..6=Sab
  const mondayOffset = (dow + 6) % 7; // 0 si es lunes
  const monday = new Date(base);
  monday.setDate(base.getDate() - mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

interface HabitsWeekGridProps {
  activities: Activity[];
  onAdd: () => void;
}

/**
 * Grid semanal de hábitos (L M M J V S D). Hoy resaltado; sólo la celda de hoy
 * es tappable y togglea la completación. Reusa getCompletion/toggleCompletion
 * del store de activities.
 */
export function HabitsWeekGrid({ activities, onAdd }: HabitsWeekGridProps) {
  const { getCompletion, toggleCompletion } = useNaviTrackerStore();

  const week = React.useMemo(() => getMondayWeek(new Date()), []);
  const todayKey = getDateKey(new Date());
  const todayColIndex = week.findIndex((d) => getDateKey(d) === todayKey);

  const visible = activities.filter((a) => !a.archived);

  if (visible.length === 0) {
    return (
      <Card className="p-4">
        <EmptyState
          icon={CalendarCheck}
          title="Sin hábitos todavía"
          description="Creá tu primer hábito para empezar a trackear tu semana."
          action={
            <Button size="sm" onClick={onAdd}>
              <Plus className="mr-1.5 h-4 w-4" />
              Agregar hábito
            </Button>
          }
        />
      </Card>
    );
  }

  // En mobile el nombre va en su PROPIA línea y abajo los 7 días: si comparte
  // fila, la columna del nombre queda en ~7px y el hábito se ve como un
  // puntito de color sin texto. Desde sm vuelve a ser una sola fila.
  const gridCols =
    "grid-cols-7 sm:grid-cols-[minmax(0,1fr)_repeat(7,minmax(0,1fr))]";

  return (
    <Card className="p-3.5">
      {/* Header de días */}
      <div className={`mb-2.5 grid items-center gap-0 ${gridCols}`}>
        <div className="hidden sm:block" />
        {week.map((date, i) => {
          const isToday = i === todayColIndex;
          return (
            <div
              key={i}
              className={`flex flex-col items-center text-center text-[11px] font-semibold ${
                isToday ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span>{DAY_LABELS[i]}</span>
              <span className="mt-0.5 font-mono text-[11px] font-bold tabular-nums">
                {date.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Filas de hábitos */}
      <div className="divide-y divide-border">
        {visible.map((activity) => (
          <div
            key={activity.id}
            className={`py-2 sm:grid sm:items-center sm:gap-0 sm:py-[7px] ${gridCols}`}
          >
            {/* Nombre del hábito */}
            <div className="mb-1.5 flex min-w-0 items-center gap-2 pr-2 sm:mb-0">
              <span
                className="h-[26px] w-[26px] shrink-0 rounded-md"
                style={{ backgroundColor: activity.color }}
                aria-hidden
              />
              <span className="truncate text-[13px] font-medium text-foreground">
                {activity.name}
              </span>
            </div>

            {/* Celdas por día (en sm+ se funden en la grilla de la fila) */}
            <div className="grid grid-cols-7 sm:contents">
            {week.map((date, ci) => {
              const isToday = ci === todayColIndex;
              const isFuture = todayColIndex >= 0 && ci > todayColIndex;
              const dayIndex = (date.getDay() + 6) % 7; // L=0..D=6
              const scheduled = activity.days[dayIndex];
              const filled = scheduled ? getCompletion(activity.id, date) : false;
              const tappable = isToday && scheduled;

              if (!scheduled) {
                return (
                  <div key={ci} className="flex justify-center">
                    <span className="text-[13px] text-muted-foreground/40">
                      ·
                    </span>
                  </div>
                );
              }

              return (
                <div key={ci} className="flex justify-center">
                  <button
                    type="button"
                    disabled={!tappable}
                    onClick={
                      tappable
                        ? () => toggleCompletion(activity.id, date)
                        : undefined
                    }
                    aria-label={`${activity.name} ${
                      filled ? "completado" : "pendiente"
                    }`}
                    aria-pressed={filled}
                    className={`flex h-9 w-9 touch-manipulation items-center justify-center rounded-full border transition-all duration-fast sm:h-6 sm:w-6 ${
                      filled
                        ? "border-transparent bg-primary text-primary-foreground"
                        : isFuture
                          ? "border-border bg-transparent"
                          : "border-border bg-muted/40"
                    } ${tappable ? "cursor-pointer active:scale-95" : "cursor-default"} ${
                      isToday && filled ? "ring-[3px] ring-primary/20" : ""
                    } ${isFuture ? "opacity-50" : ""}`}
                  >
                    {filled ? <Check className="h-4 w-4 sm:h-3.5 sm:w-3.5" strokeWidth={3} /> : null}
                  </button>
                </div>
              );
            })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
