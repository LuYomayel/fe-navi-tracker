"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ChefHat, Sparkles } from "lucide-react";
import { MealPrepSlotCard } from "./MealPrepSlotCard";
import { useMealPrep } from "@/hooks/useMealPrep";
import {
  DayKey,
  DAY_LABELS,
  MEAL_SLOT_KEYS,
} from "@/types";
import { getDateKey } from "@/lib/utils";

interface MealPrepWidgetProps {
  onOpenMealPrep: () => void;
  onOpenGenerate: () => void;
}

function getTodayDayKey(): DayKey {
  const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon...
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

export function MealPrepWidget({
  onOpenMealPrep,
  onOpenGenerate,
}: MealPrepWidgetProps) {
  const { activeMealPrep, isLoading, loadActiveMealPrep, eatSlot } =
    useMealPrep();

  useEffect(() => {
    loadActiveMealPrep();
  }, [loadActiveMealPrep]);

  const todayKey = getTodayDayKey();
  const todayLabel = DAY_LABELS[todayKey];
  const todayDate = getDateKey(new Date());

  // No active meal prep
  if (!activeMealPrep && !isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Meal Prep
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="py-4">
            <CalendarDays className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">
              No hay plan de comidas para esta semana
            </p>
            <Button onClick={onOpenGenerate} size="sm" className="w-full">
              <Sparkles className="h-4 w-4 mr-2" />
              Generar con IA
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Meal Prep
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-muted/50 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activeMealPrep) return null;

  const todayMeals = activeMealPrep.days?.[todayKey];
  const dailyTotal = activeMealPrep.dailyTotals?.[todayKey];

  // Count eaten meals today
  const eatenCount = todayMeals
    ? MEAL_SLOT_KEYS.filter(
        (k) => todayMeals.slots?.[k]?.eatenAt
      ).length
    : 0;
  const totalSlots = todayMeals
    ? MEAL_SLOT_KEYS.filter((k) => todayMeals.slots?.[k]).length
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Meal Prep
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={onOpenMealPrep}
          >
            Ver semana
          </Button>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{todayLabel}</span>
          <div className="flex items-center gap-2">
            {dailyTotal && (
              <span className="font-medium text-foreground">
                {dailyTotal.calories} kcal
              </span>
            )}
            <Badge variant="secondary" className="text-[10px]">
              {eatenCount}/{totalSlots}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {todayMeals ? (
          MEAL_SLOT_KEYS.map((mealType) => {
            const slot = todayMeals.slots?.[mealType];
            if (!slot) return null;
            return (
              <MealPrepSlotCard
                key={mealType}
                slot={slot}
                mealType={mealType}
                compact
                onEat={
                  !slot.eatenAt
                    ? () =>
                        eatSlot(activeMealPrep.id, todayKey, mealType, todayDate)
                    : undefined
                }
              />
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            Sin comidas planificadas para hoy
          </p>
        )}
      </CardContent>
    </Card>
  );
}
