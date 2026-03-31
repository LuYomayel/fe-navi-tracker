"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNaviTrackerStore } from "@/store";
import {
  calculateDailyCalorieBalance,
  formatCalorieBalance,
} from "@/lib/utils";
import { useDateHelper } from "@/hooks/useDateHelper";

interface CalorieBalanceWidgetProps {
  date?: Date;
  showDetails?: boolean;
}

export function CalorieBalanceWidget({
  date = new Date(),
  showDetails = true,
}: CalorieBalanceWidgetProps) {
  const { nutritionAnalyses, physicalActivities } = useNaviTrackerStore();
  const { getLocalDateKey, formatShortDate } = useDateHelper();

  // Calcular balance calórico usando la función utilitaria
  const dateKey = getLocalDateKey(date);
  const balance = calculateDailyCalorieBalance(
    nutritionAnalyses,
    physicalActivities,
    dateKey
  );

  // Formatear para UI
  const formatted = formatCalorieBalance(balance);

  // Calcular porcentaje para la barra de progreso (basado en un objetivo hipotético de 2000 kcal)
  const dailyGoal = 2000; // Esto podría venir de las preferencias del usuario
  const consumedPercentage = Math.min(
    (balance.caloriesConsumed / dailyGoal) * 100,
    100
  );

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          📊 Balance Calórico
          <span className="text-sm font-normal text-muted-foreground">
            {formatShortDate(date)}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Resumen principal */}
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className={`text-2xl font-bold ${formatted.balanceColor}`}>
            {balance.netCalories > 0 ? "+" : ""}
            {balance.netCalories} kcal
          </div>
          <div className="text-sm text-muted-foreground">
            {balance.isDeficit ? "Déficit calórico" : "Superávit calórico"}
          </div>
        </div>

        {/* Detalles */}
        {showDetails && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className={`font-semibold ${formatted.consumedColor}`}>
                  {balance.caloriesConsumed}
                </div>
                <div className="text-xs text-muted-foreground">
                  kcal consumidas
                </div>
                <div className="text-xs">
                  {balance.mealsCount} comida
                  {balance.mealsCount !== 1 ? "s" : ""}
                </div>
              </div>

              <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className={`font-semibold ${formatted.burnedColor}`}>
                  {balance.caloriesBurned}
                </div>
                <div className="text-xs text-muted-foreground">
                  kcal quemadas
                </div>
                <div className="text-xs">
                  {balance.activitiesCount} actividad
                  {balance.activitiesCount !== 1 ? "es" : ""}
                </div>
              </div>
            </div>

            {/* Barra de progreso hacia objetivo diario */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso hacia objetivo</span>
                <span>
                  {balance.caloriesConsumed} / {dailyGoal} kcal
                </span>
              </div>
              <Progress
                value={consumedPercentage}
                className="h-2"
                color="blue"
              />
              <div className="text-xs text-muted-foreground text-center">
                {Math.round(consumedPercentage)}% del objetivo diario
              </div>
            </div>
          </>
        )}

        {/* Indicadores de estado */}
        <div className="flex justify-center gap-2 text-xs">
          {balance.isDeficit && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
              🔥 Quemando grasa
            </span>
          )}
          {balance.isSurplus && (
            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full">
              📈 Ganando peso
            </span>
          )}
          {balance.netCalories === 0 && (
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
              ⚖️ Balance perfecto
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
