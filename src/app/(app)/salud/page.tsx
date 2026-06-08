"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Apple, Utensils, Plus, ChevronRight, Settings } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { PillToggle } from "@/components/ui/pill-toggle";
import { CircularProgressRing } from "@/components/ui/circular-progress-ring";
import { MacroProgressBar } from "@/components/ui/macro-progress-bar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useNaviTrackerStore } from "@/store";
import { useInitializeStore } from "@/hooks/useInitializeStore";
import { useDateHelper } from "@/hooks/useDateHelper";
import { getDateKey } from "@/lib/utils";

import type { NutritionAnalysis, NutritionGoals, BodyAnalysis } from "@/types";

// Componentes de dominio reusados
import { FoodAnalyzer } from "@/components/nutrition/NutritionAnalyzer";
import { WeightChart } from "@/components/nutrition/WeightChart";
import { WeightTracker } from "@/components/nutrition/WeightTracker";
import HydrationCircularProgress from "@/components/hydration/HydrationCircularProgress";
import HydrationControls from "@/components/hydration/HydrationControls";
import HydrationHistory from "@/components/hydration/HydrationHistory";
import HydrationGoalDialog from "@/components/hydration/HydrationGoalDialog";

type SaludTab = "resumen" | "comidas" | "agua" | "peso";

const TAB_OPTIONS: { value: SaludTab; label: string }[] = [
  { value: "resumen", label: "Resumen" },
  { value: "comidas", label: "Comidas" },
  { value: "agua", label: "Agua" },
  { value: "peso", label: "Peso" },
];

const isSaludTab = (v: string | null): v is SaludTab =>
  v === "resumen" || v === "comidas" || v === "agua" || v === "peso";

export default function SaludPage() {
  const searchParams = useSearchParams();
  const { isLoading } = useInitializeStore();
  const { getTodayKey } = useDateHelper();

  const {
    nutritionAnalyses,
    physicalActivities,
    weightEntries,
    preferences,
    bodyAnalyses,
    addWeightEntry,
    deleteWeightEntry,
    refreshWeightEntries,
    getAllFoodAnalysis,
    // hydration
    todayHydration,
    hydrationGoal,
    fetchTodayHydration,
    fetchHydrationGoal,
    adjustHydration,
  } = useNaviTrackerStore();

  const [tab, setTab] = useState<SaludTab>("resumen");
  const [showFoodAnalyzer, setShowFoodAnalyzer] = useState(false);
  const [showHydrationGoal, setShowHydrationGoal] = useState(false);

  const [selectedDate] = useState(new Date());

  // Tab + log desde URL (?tab=comidas&log=1)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (isSaludTab(tabParam)) {
      setTab(tabParam);
    }
    const logParam = searchParams.get("log");
    if (logParam === "1" || logParam === "true") {
      setTab("comidas");
      setShowFoodAnalyzer(true);
    }
  }, [searchParams]);

  // Hidratación: cargar hoy
  const todayStr = getDateKey(new Date());
  useEffect(() => {
    fetchTodayHydration(todayStr);
    fetchHydrationGoal();
  }, [todayStr, fetchTodayHydration, fetchHydrationGoal]);

  // Objetivos nutricionales (preferencias del usuario -> análisis corporal -> default)
  const nutritionGoals = useMemo((): NutritionGoals => {
    if (
      preferences?.dailyCalorieGoal &&
      preferences?.proteinGoal &&
      preferences?.carbsGoal &&
      preferences?.fatGoal
    ) {
      return {
        dailyCalories: preferences.dailyCalorieGoal,
        protein: preferences.proteinGoal,
        carbs: preferences.carbsGoal,
        fat: preferences.fatGoal,
      };
    }

    if (bodyAnalyses.length > 0) {
      const latest = [...bodyAnalyses].sort((a: BodyAnalysis, b: BodyAnalysis) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      })[0];
      const apiRec = latest?.fullAnalysisData?.recommendations;
      if (apiRec) {
        const baseCalories = apiRec.dailyCalories || 2000;
        const macroSplit = apiRec.macroSplit || {
          protein: 30,
          carbs: 40,
          fat: 30,
        };
        return {
          dailyCalories: baseCalories,
          protein: Math.round((baseCalories * (macroSplit.protein / 100)) / 4),
          carbs: Math.round((baseCalories * (macroSplit.carbs / 100)) / 4),
          fat: Math.round((baseCalories * (macroSplit.fat / 100)) / 9),
        };
      }
    }

    return { dailyCalories: 2000, protein: 150, carbs: 250, fat: 67 };
  }, [preferences, bodyAnalyses]);

  // Progreso del día (mismo cálculo que la página de nutrición)
  const todayProgress = useMemo(() => {
    const today = getTodayKey();
    const todayAnalyses = nutritionAnalyses.filter(
      (a: NutritionAnalysis) => a.date === today
    );

    const foodTotals = todayAnalyses.reduce(
      (acc, a: NutritionAnalysis) => {
        acc.totalCalories += a.totalCalories;
        acc.protein += a.macronutrients.protein;
        acc.carbs += a.macronutrients.carbs;
        acc.fat += a.macronutrients.fat;
        return acc;
      },
      { totalCalories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    const caloriesBurned = physicalActivities
      .filter((act) => act.date === today)
      .reduce((total, act) => total + (act.activeEnergyKcal || 0), 0);

    return {
      ...foodTotals,
      caloriesBurned,
      netCalories: foodTotals.totalCalories - caloriesBurned,
    };
  }, [nutritionAnalyses, physicalActivities, getTodayKey]);

  // Métricas derivadas para el resumen
  const goalKcal = nutritionGoals.dailyCalories;
  const consumed = Math.round(todayProgress.totalCalories);
  const burned = Math.round(todayProgress.caloriesBurned);
  const net = consumed - burned;
  const remaining = Math.max(0, goalKcal - net);

  const protein = Math.round(todayProgress.protein);
  const carbs = Math.round(todayProgress.carbs);
  const fat = Math.round(todayProgress.fat);

  // Hidratación derivada
  const glasses = todayHydration?.glassesConsumed ?? 0;
  const waterGoal = hydrationGoal.goalGlasses;
  const waterPct = waterGoal > 0 ? Math.min(100, Math.round((glasses / waterGoal) * 100)) : 0;
  const isWaterGoalReached = glasses >= waterGoal;

  const nf = (n: number) => n.toLocaleString("es-AR");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader
          icon={Apple}
          title="Salud"
          subtitle="Cargando datos..."
        />
        <Card className="h-48 animate-pulse rounded-lg bg-muted/40" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Apple}
        title="Salud"
        subtitle="Nutrición, hidratación y peso"
        metric={
          <span>
            {nf(consumed)}
            <span className="text-muted-foreground"> / {nf(goalKcal)}</span>
          </span>
        }
        metricLabel="kcal hoy"
      />

      <PillToggle<SaludTab>
        options={TAB_OPTIONS}
        value={tab}
        onChange={setTab}
        fullWidth
        aria-label="Sección de salud"
      />

      {tab === "resumen" && (
        <div className="space-y-4">
          {/* Balance calórico — fuente única */}
          <Card className="rounded-lg border p-4 sm:p-5">
            <div className="flex items-center gap-4 sm:gap-5">
              <CircularProgressRing
                value={net}
                goal={goalKcal}
                size={116}
                stroke={10}
                tone="primary"
                label={nf(remaining)}
                sublabel="kcal restantes"
              />
              <div className="flex flex-1 flex-col gap-2.5">
                <BalanceRow label="Objetivo" value={nf(goalKcal)} tone="muted" />
                <BalanceRow
                  label="Consumidas"
                  value={`+${nf(consumed)}`}
                  tone="primary"
                />
                <BalanceRow
                  label="Ejercicio"
                  value={`−${nf(burned)}`}
                  tone="warning"
                />
                <div className="h-px bg-border" />
                <BalanceRow label="Neto" value={nf(net)} tone="foreground" bold />
              </div>
            </div>
          </Card>

          {/* Macros */}
          <Card className="flex flex-col gap-3.5 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold">Macros</span>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {goalKcal > 0
                  ? Math.min(100, Math.round((net / goalKcal) * 100))
                  : 0}
                % del objetivo
              </span>
            </div>
            <MacroProgressBar
              label="Proteína"
              current={protein}
              goal={nutritionGoals.protein}
              unit="g"
              tone="chart-2"
            />
            <MacroProgressBar
              label="Carbohidratos"
              current={carbs}
              goal={nutritionGoals.carbs}
              unit="g"
              tone="chart-3"
            />
            <MacroProgressBar
              label="Grasas"
              current={fat}
              goal={nutritionGoals.fat}
              unit="g"
              tone="chart-4"
            />
          </Card>

          {/* Acceso rápido a registrar comida */}
          <button
            onClick={() => {
              setTab("comidas");
              setShowFoodAnalyzer(true);
            }}
            className="flex w-full items-center gap-3 rounded-lg border bg-card px-3.5 py-3 text-left shadow-sm transition-all duration-fast hover:bg-accent/50 active:scale-[0.985]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
              <Utensils size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Registrar comida</div>
              <div className="text-xs text-muted-foreground">
                Foto o entrada manual · +15 XP
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>
      )}

      {tab === "comidas" && (
        <div className="space-y-4">
          <Button
            variant="default"
            size="xl"
            className="w-full"
            onClick={() => setShowFoodAnalyzer(true)}
          >
            <Plus className="mr-2 h-5 w-5" />
            Registrar comida
          </Button>
          <MealsList
            analyses={nutritionAnalyses}
            todayKey={getTodayKey()}
            onEmptyAction={() => setShowFoodAnalyzer(true)}
          />
        </div>
      )}

      {tab === "agua" && (
        <div className="space-y-4">
          <Card className="flex flex-col items-center gap-5 rounded-lg border p-5">
            <div className="flex w-full items-center justify-between">
              <span className="text-[15px] font-semibold">Hidratación</span>
              <button
                onClick={() => setShowHydrationGoal(true)}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <HydrationCircularProgress
              glasses={glasses}
              goal={waterGoal}
              percentage={waterPct}
              mlPerGlass={hydrationGoal.mlPerGlass}
              isGoalReached={isWaterGoalReached}
            />
            <HydrationControls
              glasses={glasses}
              date={todayStr}
              onAdjust={adjustHydration}
            />
          </Card>

          <HydrationHistory selectedDate={todayStr} onSelectDate={() => {}} />

          <HydrationGoalDialog
            open={showHydrationGoal}
            onOpenChange={setShowHydrationGoal}
          />
        </div>
      )}

      {tab === "peso" && (
        <div className="space-y-4">
          <WeightChart
            entries={weightEntries}
            targetWeight={preferences?.targetWeight}
          />
          <WeightTracker
            entries={weightEntries}
            onEntryAdded={(entry) => addWeightEntry(entry)}
            onEntryDeleted={(entryId) => deleteWeightEntry(entryId)}
            onEntryUpdated={() => refreshWeightEntries()}
          />
        </div>
      )}

      {/* Modal de registro de comida (compartido) */}
      <FoodAnalyzer
        isOpen={showFoodAnalyzer}
        onClose={() => setShowFoodAnalyzer(false)}
        selectedDate={selectedDate}
        onAnalysisSaved={() => {
          getAllFoodAnalysis();
        }}
      />
    </div>
  );
}

function BalanceRow({
  label,
  value,
  tone,
  bold,
}: {
  label: string;
  value: string;
  tone: "muted" | "primary" | "warning" | "foreground";
  bold?: boolean;
}) {
  const valueColor =
    tone === "muted"
      ? "text-muted-foreground"
      : tone === "primary"
        ? "text-primary"
        : tone === "warning"
          ? "text-warning-foreground dark:text-warning"
          : "text-foreground";

  return (
    <div className="flex items-baseline justify-between">
      <span
        className={
          bold
            ? "text-[13px] font-semibold text-foreground"
            : "text-[13px] font-medium text-muted-foreground"
        }
      >
        {label}
      </span>
      <span
        className={`font-mono tabular-nums ${
          bold ? "text-[17px] font-bold" : "text-sm font-semibold"
        } ${valueColor}`}
      >
        {value}
      </span>
    </div>
  );
}

function MealsList({
  analyses,
  todayKey,
  onEmptyAction,
}: {
  analyses: NutritionAnalysis[];
  todayKey: string;
  onEmptyAction: () => void;
}) {
  const todayMeals = useMemo(
    () =>
      analyses
        .filter((a) => a.date === todayKey)
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.date).getTime() -
            new Date(a.createdAt || a.date).getTime()
        ),
    [analyses, todayKey]
  );

  const mealTypeLabel = (t: string) =>
    ({
      breakfast: "Desayuno",
      lunch: "Almuerzo",
      merienda: "Merienda",
      dinner: "Cena",
      snack: "Snack",
    })[t] ||
    t.charAt(0).toUpperCase() + t.slice(1);

  const formatTime = (a: NutritionAnalysis) => {
    const ts = a.createdAt
      ? a.createdAt instanceof Date
        ? a.createdAt
        : new Date(a.createdAt)
      : null;
    if (!ts) return "Sin hora";
    return ts.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (todayMeals.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 rounded-lg border p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
          <Utensils className="h-6 w-6 text-muted-foreground" />
        </span>
        <div>
          <div className="text-base font-medium">Sin comidas registradas hoy</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Registrá tu primera comida del día
          </p>
        </div>
        <Button onClick={onEmptyAction} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Registrar comida
        </Button>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {todayMeals.map((m) => (
        <Card
          key={m.id}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-chart-2/15 text-chart-2">
            <Utensils className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold">{mealTypeLabel(m.mealType)}</div>
            <div className="font-mono text-xs tabular-nums text-muted-foreground">
              {formatTime(m)}
            </div>
          </div>
          <span className="font-mono text-[15px] font-bold tabular-nums">
            {Math.round(m.totalCalories)}
          </span>
          <span className="text-[11px] text-muted-foreground">kcal</span>
        </Card>
      ))}
    </div>
  );
}
