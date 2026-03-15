"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  FileUp,
  Archive,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MealPrepSlotCard } from "./MealPrepSlotCard";
import { useMealPrep } from "@/hooks/useMealPrep";
import {
  DAY_KEYS,
  DAY_LABELS,
  MEAL_SLOT_KEYS,
  MEAL_SLOT_LABELS,
  DayKey,
  MacroSummary,
} from "@/types";
import { getDateKey } from "@/lib/utils";
import { GenerateMealPrepDialog } from "./GenerateMealPrepDialog";
import { ImportNutritionistPlanDialog } from "./ImportNutritionistPlanDialog";

function getTodayDayKey(): DayKey {
  const dayIndex = new Date().getDay();
  const map: DayKey[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return map[dayIndex];
}

export function MealPrepView() {
  const {
    activeMealPrep,
    isLoading,
    loadActiveMealPrep,
    loadActivePlan,
    eatSlot,
    archivePrep,
  } = useMealPrep();

  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayKey>(getTodayDayKey());
  const [viewMode, setViewMode] = useState<"today" | "week">("today");

  useEffect(() => {
    loadActiveMealPrep(true);
    loadActivePlan();
  }, [loadActiveMealPrep, loadActivePlan]);

  const todayDate = getDateKey(new Date());
  const todayKey = getTodayDayKey();

  const prep = activeMealPrep;

  // ─── Empty State ─────────────────────────────────────────

  if (!prep && !isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-medium">Meal Prep</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportDialog(true)}
            >
              <FileUp className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Importar plan</span>
              <span className="sm:hidden">Plan</span>
            </Button>
            <Button size="sm" onClick={() => setShowGenerateDialog(true)}>
              <Sparkles className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Generar con IA</span>
              <span className="sm:hidden">Generar</span>
            </Button>
          </div>
        </div>

        <div className="text-center py-12 rounded-xl border border-dashed border-border">
          <Sparkles className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <h4 className="font-medium mb-1">Sin meal prep activo</h4>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
            Genera tu plan semanal de comidas con IA basado en tus objetivos
            nutricionales y comidas guardadas.
          </p>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportDialog(true)}
            >
              <FileUp className="h-4 w-4 mr-1.5" />
              Importar plan nutri
            </Button>
            <Button size="sm" onClick={() => setShowGenerateDialog(true)}>
              <Sparkles className="h-4 w-4 mr-1.5" />
              Generar meal prep
            </Button>
          </div>
        </div>

        <GenerateMealPrepDialog
          isOpen={showGenerateDialog}
          onClose={() => setShowGenerateDialog(false)}
        />
        <ImportNutritionistPlanDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted/50 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!prep) return null;

  const dayMeals = prep.days?.days?.[selectedDay];
  const dailyTotal: MacroSummary | undefined = prep.dailyTotals?.[selectedDay];
  const weeklyTotal: MacroSummary | undefined = prep.weeklyTotals;

  // Navigate days
  const currentDayIndex = DAY_KEYS.indexOf(selectedDay);
  const prevDay = currentDayIndex > 0 ? DAY_KEYS[currentDayIndex - 1] : null;
  const nextDay =
    currentDayIndex < DAY_KEYS.length - 1
      ? DAY_KEYS[currentDayIndex + 1]
      : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-medium">
            {prep.name || "Meal Prep"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {prep.weekStartDate} — {prep.weekEndDate}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportDialog(true)}
          >
            <FileUp className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Plan nutri</span>
          </Button>
          <Button size="sm" onClick={() => setShowGenerateDialog(true)}>
            <Sparkles className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Nuevo prep</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => archivePrep(prep.id)}
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* View Toggle + Day Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("today")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === "today"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dia
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === "week"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Semana
          </button>
        </div>

        {viewMode === "today" && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={!prevDay}
              onClick={() => prevDay && setSelectedDay(prevDay)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <button
              onClick={() => setSelectedDay(todayKey)}
              className="text-sm font-medium min-w-[80px] text-center"
            >
              {DAY_LABELS[selectedDay]}
              {selectedDay === todayKey && (
                <Badge variant="secondary" className="ml-1.5 text-[10px]">
                  Hoy
                </Badge>
              )}
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={!nextDay}
              onClick={() => nextDay && setSelectedDay(nextDay)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {viewMode === "week" && weeklyTotal && (
          <div className="text-xs text-muted-foreground">
            Total semanal:{" "}
            <span className="font-medium text-foreground">
              {weeklyTotal.calories} kcal
            </span>
          </div>
        )}
      </div>

      {/* Day View */}
      {viewMode === "today" && (
        <div className="space-y-3">
          {/* Daily total */}
          {dailyTotal && (
            <div className="flex items-center gap-3 text-xs px-1">
              <span className="font-medium">
                {dailyTotal.calories} kcal/dia
              </span>
              <span className="text-muted-foreground">
                P:{dailyTotal.protein}g · C:{dailyTotal.carbs}g · G:
                {dailyTotal.fat}g
              </span>
            </div>
          )}

          {/* Slots */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MEAL_SLOT_KEYS.map((mealType) => {
              const slot = dayMeals?.slots?.[mealType] || null;
              return (
                <MealPrepSlotCard
                  key={mealType}
                  slot={slot}
                  mealType={mealType}
                  onEat={
                    slot && !slot.eatenAt
                      ? () =>
                          eatSlot(
                            prep.id,
                            selectedDay,
                            mealType,
                            todayDate
                          )
                      : undefined
                  }
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {viewMode === "week" && (
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[700px]">
            {/* Header row */}
            <div className="grid grid-cols-8 gap-1 mb-1">
              <div className="text-xs font-medium text-muted-foreground p-1" />
              {DAY_KEYS.map((day) => (
                <div
                  key={day}
                  className={`text-xs font-medium text-center p-1 rounded ${
                    day === todayKey
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {DAY_LABELS[day].slice(0, 3)}
                </div>
              ))}
            </div>

            {/* Meal rows */}
            {MEAL_SLOT_KEYS.map((mealType) => (
              <div key={mealType} className="grid grid-cols-8 gap-1 mb-1">
                <div className="text-[10px] font-medium text-muted-foreground p-1 flex items-center">
                  {MEAL_SLOT_LABELS[mealType]}
                </div>
                {DAY_KEYS.map((day) => {
                  const slot =
                    prep.days?.days?.[day]?.slots?.[mealType] || null;
                  return (
                    <MealPrepSlotCard
                      key={`${day}-${mealType}`}
                      slot={slot}
                      mealType={mealType}
                      compact
                      onEat={
                        slot && !slot.eatenAt
                          ? () => eatSlot(prep.id, day, mealType, todayDate)
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            ))}

            {/* Daily totals row */}
            <div className="grid grid-cols-8 gap-1 mt-2 pt-2 border-t border-border/50">
              <div className="text-[10px] font-medium text-muted-foreground p-1 flex items-center">
                Total
              </div>
              {DAY_KEYS.map((day) => {
                const total: MacroSummary | undefined =
                  prep.dailyTotals?.[day];
                return (
                  <div
                    key={day}
                    className="text-center p-1 text-[10px] text-muted-foreground"
                  >
                    {total ? (
                      <>
                        <div className="font-medium text-foreground text-xs">
                          {total.calories}
                        </div>
                        <div>kcal</div>
                      </>
                    ) : (
                      "-"
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <GenerateMealPrepDialog
        isOpen={showGenerateDialog}
        onClose={() => setShowGenerateDialog(false)}
      />
      <ImportNutritionistPlanDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
      />
    </div>
  );
}
