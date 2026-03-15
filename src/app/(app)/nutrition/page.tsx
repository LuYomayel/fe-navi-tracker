"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/modules/auth/store";
import { useNaviTrackerStore } from "@/store/index";
import { useInitializeStore } from "@/hooks/useInitializeStore";

// Importar el contenido del NutritionTracker directamente
import {
  BarChart3,
  User,
  Camera,
  Calendar,
  TrendingUp,
  Trash2,
  Clock,
  Edit3,
  Filter,
  Target,
  ChevronDown,
  Dumbbell,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { FoodAnalyzer } from "@/components/nutrition/NutritionAnalyzer";
import { BodyAnalyzer } from "@/components/nutrition/BodyAnalyzer";
import { SkinFoldDialog } from "@/components/nutrition/SkinFoldDialog";
import { EditNutritionAnalysisDialog } from "@/components/nutrition/EditNutritionAnalysisDialog";
import {
  getDateKey,
  calculateNutritionGoalsFromBodyAnalysis as _calculateNutritionGoalsFromBodyAnalysis,
} from "@/lib/utils";
import {
  sumOfSkinfolds as _sumOfSkinfolds,
  estimateBodyFatJacksonPollock as _estimateBodyFatJacksonPollock,
  compareSkinFoldRecords as _compareSkinFoldRecords,
} from "@/lib/anthropometry";
import { SkinFoldSiteNames as _SkinFoldSiteNames } from "@/types/skinFold";
import {
  MealType,
  NutritionAnalysis,
  BodyAnalysis as _BodyAnalysis,
  SkinFoldRecord as _SkinFoldRecord,
  NutritionGoals,
  BodyAnalysis,
} from "@/types";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import { SetGoalsDialog } from "@/components/nutrition/SetGoalsDialog";
import { NaviCompanion } from "@/components/navi/NaviCompanion";
import { PhysicalActivityTracker } from "@/components/nutrition/PhysicalActivityTracker";
import { CreatePhysicalActivityDialog } from "@/components/nutrition/CreatePhysicalActivityDialog";
import { WeightTracker } from "@/components/nutrition/WeightTracker";
import { WeightChart } from "@/components/nutrition/WeightChart";
import { WeightWidget } from "@/components/nutrition/WeightWidget";
import { AICostWidget } from "@/components/nutrition/AICostWidget";
import { useDateHelper } from "@/hooks/useDateHelper";

interface DailyProgress {
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  mealsCount: number;
  // Balance calórico
  caloriesBurned: number;
  netCalories: number; // totalCalories - caloriesBurned
}

// Componente del Dashboard Nutricional
const NutritionDashboard: React.FC<{
  todayProgress: DailyProgress;
  nutritionGoals: NutritionGoals | null;
  lastBodyAnalysis: _BodyAnalysis | null;
  onOpenBodyAnalyzer: () => void;
  onOpenManualGoals: () => void;
  onOpenCreatePhysicalActivity: () => void;
}> = ({
  todayProgress,
  nutritionGoals,
  lastBodyAnalysis,
  onOpenBodyAnalyzer,
  onOpenManualGoals,
  onOpenCreatePhysicalActivity,
}) => {
  const _getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  // Obtener información adicional del análisis corporal
  const bodyAnalysisInfo: BodyAnalysis = lastBodyAnalysis as BodyAnalysis;

  return (
    <div className="rounded-xl shadow-sm border p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h2 className="text-base sm:text-xl font-semibold">Dashboard Nutricional</h2>
          <p className="">
            Progreso del día de hoy
            {nutritionGoals && (
              <span className="ml-2 text-sm">
                {todayProgress.totalCalories - todayProgress.caloriesBurned} de{" "}
                {nutritionGoals?.dailyCalories || "---"} kcal
              </span>
            )}
          </p>
          {/* Balance calórico */}
          <div className="mt-2 text-sm space-y-1">
            <div className="flex items-center gap-4">
              <span className="text-green-600">
                ✅ Consumidas: {todayProgress.totalCalories} kcal
              </span>
              <span className="text-red-600">
                🔥 Quemadas: {todayProgress.caloriesBurned} kcal
              </span>
            </div>
            <div className="font-medium">
              <span
                className={`${
                  todayProgress.netCalories > 0
                    ? "text-orange-600"
                    : "text-blue-600"
                }`}
              >
                📊 Balance neto: {todayProgress.netCalories > 0 ? "+" : ""}
                {todayProgress.netCalories} kcal
                {todayProgress.netCalories > 0 ? " (superávit)" : " (déficit)"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={onOpenCreatePhysicalActivity}
            variant="outline"
            size="sm"
          >
            <Dumbbell className="h-4 w-4 mr-2" />
            Actividad Física
          </Button>
          {/*
          <Button onClick={onOpenBodyAnalyzer} variant="outline" size="sm">
            <User className="h-4 w-4 mr-2" />
            Análisis Corporal
          </Button>
          */}
          <Button onClick={onOpenManualGoals} variant="secondary" size="sm">
            <Target className="h-4 w-4 mr-2" />
            {nutritionGoals ? "Ajustar Objetivos" : "Establecer Objetivos"}
          </Button>
        </div>
      </div>

      {/* Información del análisis corporal */}
      {bodyAnalysisInfo && lastBodyAnalysis && (
        <div className="mb-6 p-4  rounded-lg">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Información del Análisis Corporal
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-muted/50 p-2 rounded-lg">
              <span className="">Tipo corporal:</span>
              <div className="font-medium capitalize">
                {lastBodyAnalysis.bodyType}
              </div>
            </div>
            <div className="bg-muted/50 p-2 rounded-lg">
              <span className="">Grasa corporal:</span>
              <div className="font-medium">
                {bodyAnalysisInfo.measurements?.bodyFat || "N/A"}%
              </div>
            </div>
            <div className="bg-muted/50 p-2 rounded-lg">
              <span className="">Metabolismo:</span>
              <div className="font-medium capitalize">
                {bodyAnalysisInfo.bodyComposition.metabolism}
              </div>
            </div>
            <div className="bg-muted/50 p-2 rounded-lg">
              <span className="">Prioridad:</span>
              <div className="font-medium capitalize">
                {bodyAnalysisInfo.recommendations?.priority}
              </div>
            </div>
          </div>

          {/* Objetivos específicos del análisis */}
          {bodyAnalysisInfo.recommendations?.goals &&
            bodyAnalysisInfo.recommendations?.goals.length > 0 && (
              <div className="mt-3 bg-muted/50 p-2 rounded-lg">
                <span className=" text-xs">Objetivos específicos:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {bodyAnalysisInfo.recommendations?.goals.map(
                    (goal, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-primary rounded-full text-xs"
                      >
                        {goal}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      )}

      {nutritionGoals ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {/* Calorías */}
          <div className="space-y-2 sm:space-y-3 bg-muted/50 p-3 sm:p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Calorías</span>
              <span className="text-xs italic">
                {todayProgress.totalCalories - todayProgress.caloriesBurned}/
                {nutritionGoals.dailyCalories}
              </span>
            </div>
            <div className="w-full rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${getProgressPercentage(
                    todayProgress.totalCalories - todayProgress.caloriesBurned,
                    nutritionGoals.dailyCalories
                  )}%`,
                }}
              ></div>
            </div>
            <div className="text-xs italic">
              {Math.round(
                getProgressPercentage(
                  todayProgress.totalCalories - todayProgress.caloriesBurned,
                  nutritionGoals.dailyCalories
                )
              )}
              % completado
            </div>
          </div>

          {/* Proteína */}
          <div className="space-y-2 sm:space-y-3 bg-muted/50 p-3 sm:p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Proteínas</span>
              <span className="text-xs italic">
                {todayProgress.protein.toFixed(1)}/{nutritionGoals.protein}g
              </span>
            </div>
            <div className="w-full  rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${getProgressPercentage(
                    todayProgress.protein,
                    nutritionGoals.protein
                  )}%`,
                }}
              ></div>
            </div>
            <div className="text-xs italic">
              {Math.round(
                getProgressPercentage(
                  todayProgress.protein,
                  nutritionGoals.protein
                )
              )}
              % completado
            </div>
          </div>

          {/* Carbohidratos */}
          <div className="space-y-2 sm:space-y-3 bg-muted/50 p-3 sm:p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Carbohidratos</span>
              <span className="text-xs italic">
                {todayProgress.carbs.toFixed(1)}/{nutritionGoals.carbs}g
              </span>
            </div>
            <div className="w-full  rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${getProgressPercentage(
                    todayProgress.carbs,
                    nutritionGoals.carbs
                  )}%`,
                }}
              ></div>
            </div>
            <div className="text-xs italic">
              {Math.round(
                getProgressPercentage(todayProgress.carbs, nutritionGoals.carbs)
              )}
              % completado
            </div>
          </div>

          {/* Grasas */}
          <div className="space-y-2 sm:space-y-3 bg-muted/50 p-3 sm:p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold">Grasas</span>
              <span className="text-xs italic">
                {todayProgress.fat.toFixed(1)}/{nutritionGoals.fat}g
              </span>
            </div>
            <div className="w-full  rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${getProgressPercentage(
                    todayProgress.fat,
                    nutritionGoals.fat
                  )}%`,
                }}
              ></div>
            </div>
            <div className="text-xs italic">
              {Math.round(
                getProgressPercentage(todayProgress.fat, nutritionGoals.fat)
              )}
              % completado
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">
            No hay objetivos nutricionales establecidos
          </h3>
          <p className="text-gray-600 dark:text-muted-foreground mb-4">
            Realiza un análisis corporal para establecer objetivos
            personalizados
          </p>
          <Button onClick={onOpenBodyAnalyzer}>
            <User className="h-4 w-4 mr-2" />
            Realizar Análisis Corporal
          </Button>
        </div>
      )}

      {/* Información adicional del análisis corporal */}
      {bodyAnalysisInfo?.recommendations?.restrictions &&
        bodyAnalysisInfo.recommendations.restrictions.length > 0 && (
          <div className="mt-6 p-4  rounded-lg">
            <h4 className="font-semibold text-sm mb-2 text-red-800 dark:text-red-200">
              🚫 Restricciones Alimentarias
            </h4>
            <div className="flex flex-wrap gap-2">
              {bodyAnalysisInfo.recommendations.restrictions.map(
                (restriction, index) => (
                  <span
                    key={index}
                    className="px-2 py-1  text-red-800 dark:text-red-200 rounded text-xs"
                  >
                    {restriction}
                  </span>
                )
              )}
            </div>
          </div>
        )}

      {/* Suplementos recomendados */}
      {bodyAnalysisInfo?.recommendations?.supplements &&
        bodyAnalysisInfo.recommendations.supplements.length > 0 && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2 ">
              💊 Suplementos Recomendados
            </h4>
            <div className="flex flex-wrap gap-2">
              {bodyAnalysisInfo.recommendations.supplements.map(
                (supplement, index) => (
                  <span
                    key={index}
                    className="px-2 py-1  text-yellow-800 dark:text-yellow-200 rounded text-xs"
                  >
                    {supplement}
                  </span>
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
};

export default function NutritionPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { isLoading } = useInitializeStore();
  const { getTodayKey } = useDateHelper();
  const searchParams = useSearchParams();

  const {
    nutritionAnalyses,
    bodyAnalyses,
    skinFoldRecords,
    physicalActivities,
    weightEntries,
    deleteNutritionAnalysis,
    deleteBodyAnalysis,
    updateNutritionAnalysis: _updateNutritionAnalysis,
    deleteSkinFoldRecord,
    updateSkinFoldRecord: _updateSkinFoldRecord,
    addWeightEntry,
    deleteWeightEntry,
    preferences,
    updatePreferences: _updatePreferences,
    getAllFoodAnalysis,
    getAllBodyAnalysis,
    getAllSkinFoldRecords,
    getAllPhysicalActivities,

    getDailyCalorieBalance,
  } = useNaviTrackerStore();

  const [selectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<
    "overview" | "food" | "body" | "skinfold" | "physical-activity" | "weight"
  >("overview");

  // Establecer tab inicial basado en URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      [
        "overview",
        "food",
        "body",
        "skinfold",
        "physical-activity",
        "weight",
      ].includes(tabParam)
    ) {
      setActiveTab(
        tabParam as
          | "overview"
          | "food"
          | "body"
          | "skinfold"
          | "physical-activity"
          | "weight"
      );
    }
  }, [searchParams]);
  const [showFoodAnalyzer, setShowFoodAnalyzer] = useState(false);
  const [showBodyAnalyzer, setShowBodyAnalyzer] = useState(false);
  const [showSkinFoldDialog, setShowSkinFoldDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPhysicalActivityDialog, setShowPhysicalActivityDialog] =
    useState(false);
  const [editingAnalysis, setEditingAnalysis] =
    useState<NutritionAnalysis | null>(null);

  // Filtros para análisis nutricionales
  const [foodFilters, setFoodFilters] = useState({
    dateFilter: "all" as "all" | "today" | "week" | "month",
    mealTypeFilter: "all" as "all" | MealType,
    sortBy: "date" as "date" | "calories" | "confidence",
  });

  // Calcular objetivos nutricionales basados en las preferencias del usuario
  const nutritionGoals = useMemo((): NutritionGoals | null => {
    // Primero intentar obtener de las preferencias del usuario (establecidas en SetGoalsDialog)
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

    // Si no hay objetivos establecidos pero hay análisis corporal, usar recomendaciones de la API
    if (bodyAnalyses.length > 0) {
      const latestBodyAnalysis = bodyAnalyses.sort(
        (a: _BodyAnalysis, b: _BodyAnalysis) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }
      )[0];

      // Si el análisis tiene datos completos de la API, usarlos
      if (latestBodyAnalysis?.fullAnalysisData?.recommendations) {
        const apiRec = latestBodyAnalysis.fullAnalysisData.recommendations;
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

    // Fallback: valores por defecto
    return {
      dailyCalories: 2000,
      protein: 150,
      carbs: 250,
      fat: 67,
    };
  }, [preferences, bodyAnalyses]);

  // Calcular progreso del día actual
  const todayProgress = useMemo((): DailyProgress => {
    const today = getTodayKey();
    const todayAnalyses = nutritionAnalyses.filter(
      (analysis: NutritionAnalysis) => analysis.date === today
    );

    const _dailyCalorieBalance = getDailyCalorieBalance(new Date());

    // Calcular calorías de comida
    const foodTotals = todayAnalyses.reduce(
      (acc, analysis: NutritionAnalysis) => {
        acc.totalCalories += analysis.totalCalories;
        acc.protein += analysis.macronutrients.protein;
        acc.carbs += analysis.macronutrients.carbs;
        acc.fat += analysis.macronutrients.fat;
        acc.fiber += analysis.macronutrients.fiber;
        return acc;
      },
      {
        totalCalories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      }
    );

    // Calcular calorías quemadas por actividad física
    const todayActivities = physicalActivities.filter(
      (activity) => activity.date === today
    );

    const caloriesBurned = todayActivities.reduce(
      (total, activity) => total + (activity.activeEnergyKcal || 0),
      0
    );

    // Balance neto (calorías consumidas - calorías quemadas)
    const netCalories = foodTotals.totalCalories - caloriesBurned;

    return {
      ...foodTotals,
      mealsCount: todayAnalyses.length,
      caloriesBurned,
      netCalories,
    };
  }, [nutritionAnalyses, physicalActivities]);

  // Obtener el último análisis corporal
  const lastBodyAnalysis = useMemo(() => {
    if (bodyAnalyses.length === 0) return null;
    return bodyAnalyses.sort((a: _BodyAnalysis, b: _BodyAnalysis) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })[0];
  }, [bodyAnalyses]);

  // AGREGAR ESTADOS Y HANDLER
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [selectedBodyAnalysis, setSelectedBodyAnalysis] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated && !user) {
      router.push("/auth/login");
    }
  }, [user, isAuthenticated, router]);

  if (!isAuthenticated || !user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isLoading ? "Cargando datos nutricionales..." : "Cargando..."}
          </p>
        </div>
      </div>
    );
  }

  // Lógica del NutritionTracker existente
  const today = new Date();
  const todayKey = getDateKey(today);
  const todayNutrition = nutritionAnalyses.filter(
    (n: NutritionAnalysis) => n.date === todayKey
  );
  const _totalCaloriesToday = todayNutrition.reduce(
    (sum: number, n: NutritionAnalysis) => sum + n.totalCalories,
    0
  );

  // Filtrar análisis nutricionales
  const filteredNutritionAnalyses = nutritionAnalyses
    .filter((analysis: NutritionAnalysis) => {
      const analysisDate = new Date(analysis.createdAt || analysis.date);
      const now = new Date();

      // Filtro por fecha
      if (foodFilters.dateFilter === "today") {
        return analysis.date === getDateKey(now);
      } else if (foodFilters.dateFilter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return analysisDate >= weekAgo;
      } else if (foodFilters.dateFilter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return analysisDate >= monthAgo;
      }

      // Filtro por tipo de comida
      if (foodFilters.mealTypeFilter !== "all") {
        return analysis.mealType === foodFilters.mealTypeFilter;
      }

      return true;
    })
    .sort((a: NutritionAnalysis, b: NutritionAnalysis) => {
      if (foodFilters.sortBy === "date") {
        return (
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
        );
      } else if (foodFilters.sortBy === "calories") {
        return b.totalCalories - a.totalCalories;
      } else if (foodFilters.sortBy === "confidence") {
        return b.aiConfidence - a.aiConfidence;
      }
      return 0;
    });

  // Calcular estadísticas semanales
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const weeklyAnalyses = nutritionAnalyses.filter(
    (analysis: NutritionAnalysis) => {
      const analysisDate = new Date(analysis.createdAt || analysis.date);
      return analysisDate >= weekStart && analysisDate <= selectedDate;
    }
  );

  const weeklyStats = {
    averageCalories:
      weeklyAnalyses.length > 0
        ? Math.round(
            weeklyAnalyses.reduce(
              (sum: number, analysis: NutritionAnalysis) =>
                sum + analysis.totalCalories,
              0
            ) / weeklyAnalyses.length
          )
        : 0,
    totalAnalyses: weeklyAnalyses.length,
    bodyAnalysesCount: bodyAnalyses.length,
  };

  const handleDeleteMeal = async (analysisId: string) => {
    console.log("🔍 Analysis ID:", analysisId);
    if (
      confirm(
        "¿Estás seguro de que quieres eliminar este análisis nutricional?"
      )
    ) {
      try {
        // Llamar a la API
        const response = await api.nutrition.deleteAnalysis(analysisId);
        console.log("🔍 Response:", response);

        if (response.success) {
          // Actualizar el store local
          await deleteNutritionAnalysis(analysisId);
          toast.success("Análisis eliminado correctamente");
        } else {
          toast.error("Error al eliminar el análisis");
        }
      } catch (error) {
        console.error("❌ Error eliminando análisis:", error);
        // Intentar eliminar del store local como fallback
        await deleteNutritionAnalysis(analysisId);
        toast.success("Análisis eliminado del almacenamiento local");
      }
    }
  };

  const _handleDeleteBodyAnalysis = async (analysisId: string) => {
    if (
      confirm("¿Estás seguro de que quieres eliminar este análisis corporal?")
    ) {
      try {
        await deleteBodyAnalysis(analysisId);
        toast.success("Análisis corporal eliminado correctamente");
      } catch (error) {
        console.error("❌ Error eliminando análisis corporal:", error);
        toast.error("Error al eliminar el análisis corporal");
      }
    }
  };

  const handleEditAnalysis = (analysis: NutritionAnalysis) => {
    setEditingAnalysis(analysis);
    setShowEditDialog(true);
  };

  const handleAnalysisUpdated = async () => {
    // Refrescar los datos después de actualizar
    console.log("✅ Análisis actualizado, refrescando datos...");

    try {
      // El store de Zustand ya maneja la actualización automática
      // pero podemos forzar una actualización si es necesario
      // await refetchNutritionData(); // Si tuviéramos esta función

      // Cerrar el diálogo de edición
      setShowEditDialog(false);
      setEditingAnalysis(null);

      toast.success("Datos actualizados correctamente");
    } catch (error) {
      console.error("❌ Error refrescando datos:", error);
    }
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setEditingAnalysis(null);
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "🌅";
      case "lunch":
        return "☀️";
      case "dinner":
        return "🌙";
      case "snack":
        return "🍎";
      default:
        return "🍽️";
    }
  };

  const formatDate = (timestamp: string | undefined, fallbackDate: string) => {
    if (timestamp) {
      console.log("🔍 Timestamp:", typeof timestamp);
      return {
        date: new Date(timestamp).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        }),
        time: new Date(timestamp).toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    }

    const date = new Date(fallbackDate);
    return {
      date: date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      }),
      time: "Sin hora",
    };
  };

  const _handleSetAsGoals = (analysis: _BodyAnalysis) => {
    console.log("🔍 Analysis:", analysis);
    setSelectedBodyAnalysis(analysis);
    setShowGoalsModal(true);
  };

  // Nuevo handler para modo manual
  const handleOpenManualGoals = () => {
    setSelectedBodyAnalysis(null); // Sin análisis corporal
    setShowGoalsModal(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Centro Nutricional</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Análisis de alimentos, pliegues cutáneos y monitoreo corporal
        </p>
      </div>

      {/* Tabs - horizontal scrollable on mobile */}
      <div className="border-b">
        <nav className="flex overflow-x-auto gap-0 -mb-px scrollbar-hide">
          {[
            { id: "overview", label: "Resumen", icon: BarChart3 },
            { id: "food", label: "Comidas", icon: Camera },
            {
              id: "physical-activity",
              label: "Actividad",
              icon: Dumbbell,
            },
            { id: "weight", label: "Peso", icon: Scale },
            { id: "skinfold", label: "Pliegues", icon: Target },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-2 px-2.5 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab con Dashboard */}
      {activeTab === "overview" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Dashboard Nutricional */}
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            <div className="w-full md:w-2/3 h-full">
              <NutritionDashboard
                todayProgress={todayProgress}
                nutritionGoals={nutritionGoals}
                lastBodyAnalysis={lastBodyAnalysis}
                onOpenBodyAnalyzer={() => setShowBodyAnalyzer(true)}
                onOpenManualGoals={handleOpenManualGoals}
                onOpenCreatePhysicalActivity={() =>
                  setShowPhysicalActivityDialog(true)
                }
              />
            </div>
            <div className="w-full md:w-1/3">
              <WeightWidget
                entries={weightEntries}
                onAddWeight={() => {}}
                targetWeight={preferences?.targetWeight}
              />
            </div>
          </div>

          {/* Quick Actions */}
          {/*}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => setShowFoodAnalyzer(true)}
              className="h-20 flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <Camera className="h-6 w-6" />
              <span>Analizar Alimento</span>
            </Button>

            
            <Button
              onClick={() => setShowBodyAnalyzer(true)}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <User className="h-6 w-6" />
              <span>Análisis Corporal</span>
            </Button>
            
            <Button
              onClick={() => setShowSkinFoldDialog(true)}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Target className="h-6 w-6" />
              <span>Pliegues Cutáneos</span>
            </Button>
          </div>
          */}
          {/* Estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-lg font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                Estadísticas
              </h3>
              <div className="space-y-2 sm:space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Promedio calorías:</span>
                  <span className="font-medium">
                    {weeklyStats.averageCalories} kcal/día
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Análisis nutricionales:</span>
                  <span className="font-medium">
                    {weeklyStats.totalAnalyses} registros
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Análisis corporales:</span>
                  <span className="font-medium">
                    {weeklyStats.bodyAnalysesCount} análisis
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-lg font-medium">Acciones rápidas</h3>
              <div className="space-y-2">
                <Button
                  onClick={() => setShowFoodAnalyzer(true)}
                  variant="outline"
                  className="w-full justify-start text-sm"
                  size="sm"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Analizar comida por foto
                </Button>
                <Button
                  onClick={() => setShowBodyAnalyzer(true)}
                  variant="outline"
                  className="w-full justify-start text-sm"
                  size="sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  Análisis corporal completo
                </Button>
                <Button
                  onClick={() => setActiveTab("food")}
                  variant="outline"
                  className="w-full justify-start text-sm"
                  size="sm"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver historial nutricional
                </Button>
              </div>
            </div>
          </div>

          {/* Widget de costos de IA */}
          <AICostWidget />
        </div>
      )}

      {/* Food Tracking Tab */}
      {activeTab === "food" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-medium">
                Historial Nutricional
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Gestiona y filtra tus análisis
              </p>
            </div>
            <Button
              onClick={() => setShowFoodAnalyzer(true)}
              size="sm"
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Nuevo análisis
            </Button>
          </div>

          {/* Filtros */}
          <div className="p-4 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Período
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {foodFilters.dateFilter === "all" && "Todos"}
                      {foodFilters.dateFilter === "today" && "Hoy"}
                      {foodFilters.dateFilter === "week" && "Última semana"}
                      {foodFilters.dateFilter === "month" && "Último mes"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem
                      onClick={() =>
                        setFoodFilters({
                          ...foodFilters,
                          dateFilter: "all",
                        })
                      }
                    >
                      Todos
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setFoodFilters({
                          ...foodFilters,
                          dateFilter: "today",
                        })
                      }
                    >
                      Hoy
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setFoodFilters({
                          ...foodFilters,
                          dateFilter: "week",
                        })
                      }
                    >
                      Última semana
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setFoodFilters({
                          ...foodFilters,
                          dateFilter: "month",
                        })
                      }
                    >
                      Último mes
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo de comida
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {foodFilters.mealTypeFilter === "all" && "Todas"}
                      {foodFilters.mealTypeFilter === "breakfast" &&
                        "🌅 Desayuno"}
                      {foodFilters.mealTypeFilter === "lunch" && "☀️ Almuerzo"}
                      {foodFilters.mealTypeFilter === "dinner" && "🌙 Cena"}
                      {foodFilters.mealTypeFilter === "snack" && "🍎 Snack"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem
                      onClick={() =>
                        setFoodFilters({
                          ...foodFilters,
                          mealTypeFilter: "all",
                        })
                      }
                    >
                      Todas
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setFoodFilters({
                          ...foodFilters,
                          mealTypeFilter: "breakfast" as MealType,
                        })
                      }
                    >
                      🌅 Desayuno
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setFoodFilters({
                          ...foodFilters,
                          mealTypeFilter: "lunch" as MealType,
                        })
                      }
                    >
                      ☀️ Almuerzo
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setFoodFilters({
                          ...foodFilters,
                          mealTypeFilter: "dinner" as MealType,
                        })
                      }
                    >
                      🌙 Cena
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setFoodFilters({
                          ...foodFilters,
                          mealTypeFilter: "snack" as MealType,
                        })
                      }
                    >
                      🍎 Snack
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Ordenar por
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      {foodFilters.sortBy === "date" && "Fecha"}
                      {foodFilters.sortBy === "calories" && "Calorías"}
                      {foodFilters.sortBy === "confidence" && "Confianza"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem
                      onClick={() =>
                        setFoodFilters({
                          ...foodFilters,
                          sortBy: "date",
                        })
                      }
                    >
                      Fecha
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setFoodFilters({
                          ...foodFilters,
                          sortBy: "calories",
                        })
                      }
                    >
                      Calorías
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        setFoodFilters({
                          ...foodFilters,
                          sortBy: "confidence",
                        })
                      }
                    >
                      Confianza
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Lista de análisis */}
          {filteredNutritionAnalyses.length > 0 ? (
            <div className="space-y-4">
              {filteredNutritionAnalyses.map((analysis) => {
                const dateInfo = formatDate(
                  analysis.createdAt instanceof Date
                    ? analysis.createdAt.toISOString()
                    : analysis.createdAt,
                  analysis.date
                );
                const _isEditing = editingAnalysis?.id === analysis.id;

                return (
                  <div
                    key={analysis.id}
                    className="rounded-xl shadow-sm border p-3 sm:p-4"
                  >
                    <div className="flex items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <div className="text-xl sm:text-2xl flex-shrink-0">
                          {getMealTypeIcon(analysis.mealType)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm sm:text-base">
                            {analysis.mealType.charAt(0).toUpperCase() +
                              analysis.mealType.slice(1)}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            {dateInfo.date} - {dateInfo.time}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="font-medium text-sm sm:text-lg">
                            {analysis.totalCalories} kcal
                          </div>
                          <div className="text-[10px] sm:text-sm text-muted-foreground">
                            {Math.round(analysis.aiConfidence * 100)}%
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleEditAnalysis(analysis as NutritionAnalysis)
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMeal(analysis.id)}
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Detalles de alimentos */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {analysis.foods.map((food, index) => (
                        <div
                          key={index}
                          className="rounded-lg p-2 sm:p-3 bg-muted/50"
                        >
                          <div className="font-medium text-xs sm:text-sm">{food.name}</div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground">
                            {food.quantity} • {food.calories} kcal
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <Camera className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium  mb-2">
                No hay análisis nutricionales
              </h3>
              <p className=" mb-4">Empieza analizando tu primera comida</p>
              <Button
                onClick={() => setShowFoodAnalyzer(true)}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Analizar primera comida
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Body Analysis Tab */}
      {/*
      {activeTab === "body" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Análisis Corporales</h3>
              <p className="">Historial de análisis de composición corporal</p>
            </div>
            <Button
              onClick={() => setShowBodyAnalyzer(true)}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Nuevo análisis
            </Button>
          </div>

          {bodyAnalyses.length > 0 ? (
            <div className="space-y-4">
              {bodyAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="rounded-lg shadow-sm border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">
                        Análisis{" "}
                        {analysis.createdAt
                          ? new Date(analysis.createdAt).toLocaleDateString(
                              "es-ES"
                            )
                          : "Fecha no disponible"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Peso: {analysis.measurements?.weight}kg • Altura:{" "}
                        {analysis.measurements?.height}cm Análisis completado
                      </div>
                      <div className="flex items-center gap-2">
                        {analysis.insights && analysis.insights.length > 0 && (
                          <div className="mt-2 bg-muted/50 p-2 rounded-lg">
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              Insights:
                            </div>
                            <div className="space-y-1">
                              {analysis.insights.map((insight, index) => (
                                <div
                                  key={index}
                                  className="text-xs text-muted-foreground"
                                >
                                  • {insight}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {analysis.insights && analysis.insights.length > 0 && (
                          <div className="mt-2 bg-muted/50 p-2 rounded-lg">
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              Recomendaciones:
                            </div>
                            <div className="space-y-1">
                              {analysis.recommendations?.nutrition.map(
                                (insight, index) => (
                                  <div
                                    key={index}
                                    className="text-xs text-muted-foreground"
                                  >
                                    • {insight}
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDeleteBodyAnalysis(analysis.id || "")
                        }
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetAsGoals(analysis)}
                      >
                        <Target className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium  mb-2">
                No hay análisis corporales
              </h3>
              <p className=" mb-4">Realiza tu primer análisis corporal</p>
              <Button
                onClick={() => setShowBodyAnalyzer(true)}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Primer análisis
              </Button>
            </div>
          )}
        </div>
      )}
      */}
      {/* Physical Activity Tab */}
      {activeTab === "physical-activity" && (
        <div className="space-y-6">
          <PhysicalActivityTracker
            date={selectedDate.toISOString().split("T")[0]}
          />
        </div>
      )}

      {/* Weight Tab */}
      {activeTab === "weight" && (
        <div className="space-y-6">
          <WeightChart
            entries={weightEntries}
            targetWeight={preferences?.targetWeight}
          />
          <WeightTracker
            entries={weightEntries}
            onEntryAdded={(entry) => {
              console.log("🔄 Peso agregado, refrescando datos...");
              addWeightEntry(entry);
            }}
            onEntryDeleted={(entryId) => {
              console.log("🔄 Peso eliminado, refrescando datos...");
              deleteWeightEntry(entryId);
            }}
          />
        </div>
      )}

      {/* Skinfold Tab */}
      {activeTab === "skinfold" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Pliegues Cutáneos</h3>
              <p className="">Historial de mediciones de pliegues cutáneos</p>
            </div>
            <Button
              onClick={() => setShowSkinFoldDialog(true)}
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Nueva medición
            </Button>
          </div>

          {skinFoldRecords.length > 0 ? (
            <div className="space-y-4">
              {skinFoldRecords.map((record) => (
                <div
                  key={record.id}
                  className="rounded-lg shadow-sm border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        Medición{" "}
                        {record.createdAt
                          ? new Date(record.createdAt).toLocaleDateString(
                              "es-ES"
                            )
                          : "Fecha no disponible"}
                      </div>
                      <div className="text-sm ">
                        {/* Suma: {sumOfSkinfolds(record.measurements)}mm */}
                        Medición registrada
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSkinFoldRecord(record.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium  mb-2">
                No hay mediciones de pliegues
              </h3>
              <p className=" mb-4">
                Registra tu primera medición de pliegues cutáneos
              </p>
              <Button
                onClick={() => setShowSkinFoldDialog(true)}
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Primera medición
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      <FoodAnalyzer
        isOpen={showFoodAnalyzer}
        onClose={() => setShowFoodAnalyzer(false)}
        selectedDate={selectedDate}
        onAnalysisSaved={() => {
          console.log("🔄 Análisis nutricional guardado, refrescando datos...");
          getAllFoodAnalysis();
          // Los datos se actualizan automáticamente por el store de Zustand
          toast.success("Datos actualizados");
        }}
      />

      <BodyAnalyzer
        isOpen={showBodyAnalyzer}
        onClose={() => setShowBodyAnalyzer(false)}
        onAnalysisSaved={() => {
          console.log("🔄 Análisis corporal guardado, refrescando datos...");
          getAllBodyAnalysis();
          // Los datos se actualizan automáticamente por el store de Zustand
          toast.success("Datos actualizados");
        }}
      />

      <SkinFoldDialog
        isOpen={showSkinFoldDialog}
        onClose={() => setShowSkinFoldDialog(false)}
        onRecordSaved={() => {
          console.log("🔄 Registro de pliegues guardado, refrescando datos...");
          getAllSkinFoldRecords();
          // Los datos se actualizan automáticamente por el store de Zustand
          toast.success("Datos actualizados");
        }}
      />

      <SetGoalsDialog
        isOpen={showGoalsModal}
        onClose={() => {
          setShowGoalsModal(false);
          setSelectedBodyAnalysis(null);
        }}
        bodyAnalysis={selectedBodyAnalysis}
        isManualMode={!selectedBodyAnalysis}
        onGoalsSaved={() => {
          console.log("🔄 Objetivos guardados, refrescando datos...");
          setShowGoalsModal(false);
          setSelectedBodyAnalysis(null);
          getAllBodyAnalysis();
          toast.success("Objetivos actualizados correctamente");
        }}
      />

      <EditNutritionAnalysisDialog
        isOpen={showEditDialog}
        onClose={handleCloseEditDialog}
        analysis={editingAnalysis}
        onAnalysisUpdated={handleAnalysisUpdated}
      />

      <CreatePhysicalActivityDialog
        open={showPhysicalActivityDialog}
        onOpenChange={() => setShowPhysicalActivityDialog(false)}
        date={selectedDate.toISOString().split("T")[0]}
        onActivityCreated={() => {
          console.log("🔄 Actividad física creada, refrescando datos...");
          getAllPhysicalActivities();
        }}
      />

      <NaviCompanion />
    </div>
  );
}
