"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/modules/auth/store";
import { useNaviTrackerStore } from "@/store";
import { useInitializeStore } from "@/hooks/useInitializeStore";

import { DailyReflectionWidget } from "@/components/calendar/DailyReflectionWidget";
import { NaviCompanion } from "@/components/navi/NaviCompanion";
import { XpDashboard } from "@/components/xp/XpDashboard";
import { StreakWidget } from "@/components/xp/StreakWidget";
import { WeightWidget } from "@/components/nutrition/WeightWidget";

import {
  Calendar,
  TrendingUp,
  Apple,
  Activity,
  ChevronRight,
  BarChart3,
  Clock,
  Flame,
} from "lucide-react";
import { getDateKey } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { isLoading } = useInitializeStore();

  const {
    nutritionAnalyses,
    bodyAnalyses,
    activities = [],
    weightEntries,
    preferences,
  } = useNaviTrackerStore();

  useEffect(() => {
    if (isAuthenticated && !user) {
      router.push("/auth/login");
    }
  }, [user, isAuthenticated, router]);

  if (!isAuthenticated || !user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Cargando tu panel..." : "Cargando..."}
          </p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const todayKey = getDateKey(today);
  const todayNutrition = nutritionAnalyses.filter((n) => n.date === todayKey);
  const totalCaloriesToday = todayNutrition.reduce(
    (sum, n) => sum + n.totalCalories,
    0
  );

  const todayActivities = activities.filter((a) => {
    const activityDate = new Date(a.createdAt);
    return getDateKey(activityDate) === todayKey;
  });

  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const weeklyNutrition = nutritionAnalyses.filter((analysis) => {
    const analysisDate = new Date(analysis.createdAt || analysis.date);
    return analysisDate >= weekStart && analysisDate <= today;
  });

  const weeklyActivities = activities.filter((activity) => {
    const activityDate = new Date(activity.createdAt);
    return activityDate >= weekStart && activityDate <= today;
  });

  const averageCaloriesWeek =
    weeklyNutrition.length > 0
      ? Math.round(
          weeklyNutrition.reduce(
            (sum, analysis) => sum + analysis.totalCalories,
            0
          ) / weeklyNutrition.length
        )
      : 0;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="pt-1 sm:pt-2">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Hola, {user.name}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Tu resumen de hoy
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-500/20 dark:to-blue-600/10 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-blue-500/15 flex items-center justify-center">
              <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold">{totalCaloriesToday}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            kcal - {todayNutrition.length} comidas
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 dark:from-green-500/20 dark:to-green-600/10 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-green-500/15 flex items-center justify-center">
              <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold">{todayActivities.length}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            habitos completados
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 dark:from-orange-500/20 dark:to-orange-600/10 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-orange-500/15 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold">{averageCaloriesWeek}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            kcal/dia promedio
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-500/20 dark:to-purple-600/10 p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-purple-500/15 flex items-center justify-center">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold">{bodyAnalyses.length}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            analisis corporales
          </div>
        </div>
      </div>

      {/* XP & Weight/Streak */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        <XpDashboard />
        <div className="flex flex-col gap-3 sm:gap-4">
          <WeightWidget
            entries={weightEntries}
            onAddWeight={() => router.push("/nutrition?tab=weight")}
            targetWeight={preferences?.targetWeight}
          />
          <StreakWidget />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
        <Link href="/habits" className="block">
          <div className="rounded-2xl bg-card p-4 hover:bg-accent/50 active:scale-[0.98] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="font-semibold text-sm">
                    Seguimiento de Habitos
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{todayActivities.length} hoy</span>
                    <span className="text-border">|</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-3 w-3" />
                      {weeklyActivities.length} esta semana
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </Link>

        <Link href="/nutrition" className="block">
          <div className="rounded-2xl bg-card p-4 hover:bg-accent/50 active:scale-[0.98] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Apple className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="font-semibold text-sm">
                    Nutricion y Salud
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{totalCaloriesToday} kcal hoy</span>
                    <span className="text-border">|</span>
                    <span className="flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" />
                      {averageCaloriesWeek} kcal/dia
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </Link>
      </div>

      {/* Daily Reflection */}
      <DailyReflectionWidget />

      <NaviCompanion />
    </div>
  );
}
