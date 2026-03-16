"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import { DailyNutritionBalance } from "@/types";
import { useDateHelper } from "@/hooks/useDateHelper";
import {
  Flame,
  Footprints,
  Timer,
  TrendingDown,
  TrendingUp,
  Utensils,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DailyBalanceCardProps {
  date?: Date;
  /** Key that changes when nutrition or physical activity data changes, to trigger a refetch */
  refreshKey?: number;
}

export function DailyBalanceCard({
  date = new Date(),
  refreshKey,
}: DailyBalanceCardProps) {
  const { getLocalDateKey } = useDateHelper();
  const [balance, setBalance] = useState<DailyNutritionBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const dateKey = getLocalDateKey(date);

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await api.nutrition.getDailyBalance(dateKey);
      if (response.success && response.data) {
        setBalance(response.data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error fetching daily balance:", err);
      setError(true);
      toast.error(
        "Error al cargar balance",
        "No se pudo obtener el balance nutricional del día"
      );
    } finally {
      setLoading(false);
    }
  }, [dateKey]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance, refreshKey]);

  const getProgressPercentage = (current: number, goal: number) => {
    if (goal <= 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getCalorieProgressColor = (current: number, goal: number) => {
    const pct = (current / goal) * 100;
    if (pct > 110) return "bg-red-500";
    if (pct >= 90) return "bg-green-500";
    if (pct >= 70) return "bg-blue-500";
    return "bg-blue-400";
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Cargando balance diario...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !balance) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No se pudo cargar el balance diario</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchBalance}
              className="mt-2"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { consumed, burned, netCalories, goals } = balance;
  const isDeficit = netCalories < 0;
  const caloriesPct = getProgressPercentage(consumed.calories, goals.dailyCalorieGoal);
  const proteinPct = getProgressPercentage(consumed.protein, goals.proteinGoal);
  const carbsPct = getProgressPercentage(consumed.carbs, goals.carbsGoal);
  const fatPct = getProgressPercentage(consumed.fat, goals.fatGoal);
  const fiberPct = getProgressPercentage(consumed.fiber, goals.fiberGoal);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Utensils className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Balance Diario
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchBalance}
            className="h-7 w-7 p-0"
          >
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Net calories summary */}
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-center gap-1.5">
            {isDeficit ? (
              <TrendingDown className="h-5 w-5 text-blue-500" />
            ) : (
              <TrendingUp className="h-5 w-5 text-orange-500" />
            )}
            <span
              className={`text-xl sm:text-2xl font-bold ${
                isDeficit ? "text-blue-500" : "text-orange-500"
              }`}
            >
              {netCalories > 0 ? "+" : ""}
              {Math.round(netCalories)} kcal
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isDeficit ? "Deficit calorico" : netCalories === 0 ? "Balance neutro" : "Superavit calorico"}
          </p>
        </div>

        {/* Consumed vs Burned */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 bg-muted/50 rounded-lg text-center">
            <div className="text-lg sm:text-xl font-semibold text-green-600 dark:text-green-400">
              {Math.round(consumed.calories)}
            </div>
            <div className="text-xs text-muted-foreground">kcal consumidas</div>
          </div>
          <div className="p-2.5 bg-muted/50 rounded-lg text-center">
            <div className="text-lg sm:text-xl font-semibold text-red-500 dark:text-red-400">
              {Math.round(burned.calories)}
            </div>
            <div className="text-xs text-muted-foreground">kcal quemadas</div>
          </div>
        </div>

        {/* Calorie progress toward goal */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Calorias</span>
            <span className="font-medium">
              {Math.round(consumed.calories)} / {goals.dailyCalorieGoal} kcal
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className={`${getCalorieProgressColor(consumed.calories, goals.dailyCalorieGoal)} h-2.5 rounded-full transition-all duration-500`}
              style={{ width: `${caloriesPct}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground text-right">
            {Math.round(caloriesPct)}%
          </div>
        </div>

        {/* Macros progress */}
        <div className="grid grid-cols-2 gap-3">
          {/* Protein */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Proteina</span>
              <span className="font-medium">
                {Math.round(consumed.protein)}g / {goals.proteinGoal}g
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={`${getProgressColor(proteinPct)} h-1.5 rounded-full transition-all duration-500`}
                style={{ width: `${proteinPct}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Carbohidratos</span>
              <span className="font-medium">
                {Math.round(consumed.carbs)}g / {goals.carbsGoal}g
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={`${getProgressColor(carbsPct)} h-1.5 rounded-full transition-all duration-500`}
                style={{ width: `${carbsPct}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Grasas</span>
              <span className="font-medium">
                {Math.round(consumed.fat)}g / {goals.fatGoal}g
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={`${getProgressColor(fatPct)} h-1.5 rounded-full transition-all duration-500`}
                style={{ width: `${fatPct}%` }}
              />
            </div>
          </div>

          {/* Fiber */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Fibra</span>
              <span className="font-medium">
                {Math.round(consumed.fiber)}g / {goals.fiberGoal}g
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={`${getProgressColor(fiberPct)} h-1.5 rounded-full transition-all duration-500`}
                style={{ width: `${fiberPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Activity details (only if there's burned data) */}
        {burned.calories > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Actividad fisica del dia
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {burned.steps > 0 && (
                <div className="bg-muted/50 rounded-lg p-2">
                  <Footprints className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-0.5" />
                  <div className="text-sm font-semibold">
                    {burned.steps.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground">pasos</div>
                </div>
              )}
              {burned.exerciseMinutes > 0 && (
                <div className="bg-muted/50 rounded-lg p-2">
                  <Timer className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-0.5" />
                  <div className="text-sm font-semibold">
                    {burned.exerciseMinutes}
                  </div>
                  <div className="text-[10px] text-muted-foreground">minutos</div>
                </div>
              )}
              {burned.distanceKm > 0 && (
                <div className="bg-muted/50 rounded-lg p-2">
                  <Flame className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-0.5" />
                  <div className="text-sm font-semibold">
                    {burned.distanceKm.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">km</div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
