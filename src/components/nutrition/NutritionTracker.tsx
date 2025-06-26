"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FoodAnalyzer } from "./NutritionAnalyzer";
import { BodyAnalyzer } from "./BodyAnalyzer";
import { SkinFoldDialog } from "./SkinFoldDialog";
import { useNaviTrackerStore } from "@/store";
import {
  getDateKey,
  calculateNutritionGoalsFromBodyAnalysis,
} from "@/lib/utils";
import {
  sumOfSkinfolds,
  estimateBodyFatJacksonPollock,
  compareSkinFoldRecords,
} from "@/lib/anthropometry";
import { SkinFoldSiteNames } from "@/types/skinFold";
import {
  MealType,
  NutritionAnalysis,
  BodyAnalysis,
  SkinFoldRecord,
} from "@/types";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";

interface NutritionTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

interface EditingAnalysis {
  id: string;
  date: string;
  mealType: MealType;
  time: string;
}

export function NutritionTracker({
  isOpen,
  onClose,
  selectedDate = new Date(),
}: NutritionTrackerProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "food" | "body" | "skinfolds"
  >("overview");
  const [showFoodAnalyzer, setShowFoodAnalyzer] = useState(false);
  const [showBodyAnalyzer, setShowBodyAnalyzer] = useState(false);
  const [showSkinFoldDialog, setShowSkinFoldDialog] = useState(false);
  const [editingAnalysis, setEditingAnalysis] =
    useState<EditingAnalysis | null>(null);
  const [editingSkinFold, setEditingSkinFold] = useState<SkinFoldRecord | null>(
    null
  );
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [selectedBodyAnalysis, setSelectedBodyAnalysis] =
    useState<BodyAnalysis | null>(null);

  // Filtros para análisis nutricionales
  const [foodFilters, setFoodFilters] = useState({
    dateFilter: "all" as "all" | "today" | "week" | "month",
    mealTypeFilter: "all" as "all" | MealType,
    sortBy: "date" as "date" | "calories" | "confidence",
  });

  // Obtener datos del store
  const {
    nutritionAnalyses,
    bodyAnalyses,
    skinFoldRecords,
    deleteNutritionAnalysis,
    updateNutritionAnalysis,
    deleteBodyAnalysis,
    deleteSkinFoldRecord,
    updatePreferences,
    preferences,
  } = useNaviTrackerStore();

  // Filtrar análisis nutricionales del día seleccionado
  const todayAnalyses = nutritionAnalyses.filter(
    (analysis) => analysis.date === getDateKey(selectedDate)
  );

  // Aplicar filtros a análisis nutricionales
  const filteredNutritionAnalyses = nutritionAnalyses
    .filter((analysis) => {
      const analysisDate = new Date(analysis.createdAt || analysis.date);
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Filtro por fecha
      if (
        foodFilters.dateFilter === "today" &&
        analysis.date !== getDateKey(today)
      ) {
        return false;
      }
      if (foodFilters.dateFilter === "week" && analysisDate < weekAgo) {
        return false;
      }
      if (foodFilters.dateFilter === "month" && analysisDate < monthAgo) {
        return false;
      }

      // Filtro por tipo de comida
      if (
        foodFilters.mealTypeFilter !== "all" &&
        analysis.mealType !== foodFilters.mealTypeFilter
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date);
      const dateB = new Date(b.createdAt || b.date);

      switch (foodFilters.sortBy) {
        case "date":
          return dateB.getTime() - dateA.getTime();
        case "calories":
          return b.totalCalories - a.totalCalories;
        case "confidence":
          return b.aiConfidence - a.aiConfidence;
        default:
          return dateB.getTime() - dateA.getTime();
      }
    });

  // Calcular estadísticas del día basadas en datos reales
  const todayNutrition = {
    totalCalories: todayAnalyses.reduce(
      (sum, analysis) => sum + analysis.totalCalories,
      0
    ),
    targetCalories: preferences?.dailyCalorieGoal || 2200,
    macros: {
      protein: {
        consumed: todayAnalyses.reduce(
          (sum, analysis) => sum + analysis.macronutrients.protein,
          0
        ),
        target: preferences?.proteinGoal || 165,
        percentage: 0,
      },
      carbs: {
        consumed: todayAnalyses.reduce(
          (sum, analysis) => sum + analysis.macronutrients.carbs,
          0
        ),
        target: preferences?.carbsGoal || 220,
        percentage: 0,
      },
      fat: {
        consumed: todayAnalyses.reduce(
          (sum, analysis) => sum + analysis.macronutrients.fat,
          0
        ),
        target: preferences?.fatGoal || 73,
        percentage: 0,
      },
    },
    meals: todayAnalyses.map((analysis) => ({
      type: analysis.mealType.toLowerCase(),
      name:
        analysis.mealType.charAt(0).toUpperCase() + analysis.mealType.slice(1),
      calories: analysis.totalCalories,
      time: analysis.createdAt
        ? new Date(analysis.createdAt).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Sin hora",
      foods: analysis.foods.map((food) => food.name),
      id: analysis.id,
    })),
  };

  // Calcular porcentajes
  todayNutrition.macros.protein.percentage = Math.round(
    (todayNutrition.macros.protein.consumed /
      todayNutrition.macros.protein.target) *
      100
  );
  todayNutrition.macros.carbs.percentage = Math.round(
    (todayNutrition.macros.carbs.consumed /
      todayNutrition.macros.carbs.target) *
      100
  );
  todayNutrition.macros.fat.percentage = Math.round(
    (todayNutrition.macros.fat.consumed / todayNutrition.macros.fat.target) *
      100
  );

  // Calcular estadísticas semanales
  const weekStart = new Date(selectedDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const weeklyAnalyses = nutritionAnalyses.filter((analysis) => {
    const analysisDate = new Date(analysis.createdAt || analysis.date);
    return analysisDate >= weekStart && analysisDate <= selectedDate;
  });

  const weeklyStats = {
    averageCalories:
      weeklyAnalyses.length > 0
        ? Math.round(
            weeklyAnalyses.reduce(
              (sum, analysis) => sum + analysis.totalCalories,
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
      const response = await api.nutrition.deleteAnalysis(analysisId);
      console.log("🔍 Response:", response);
      if (response.success) {
        toast.success("Análisis eliminado correctamente");
        //await deleteNutritionAnalysis(analysisId);
      } else {
        toast.error("Error al eliminar el análisis");
      }
    }
  };

  const handleDeleteBodyAnalysis = async (analysisId: string) => {
    if (
      confirm("¿Estás seguro de que quieres eliminar este análisis corporal?")
    ) {
      await deleteBodyAnalysis(analysisId);
    }
  };

  const handleEditAnalysis = (analysis: NutritionAnalysis) => {
    const timestamp = analysis.createdAt
      ? new Date(analysis.createdAt)
      : new Date();
    setEditingAnalysis({
      id: analysis.id,
      date: analysis.date,
      mealType: analysis.mealType as MealType,
      time: timestamp.toTimeString().slice(0, 5),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingAnalysis) return;

    try {
      const [hours, minutes] = editingAnalysis.time.split(":");
      const editDate = new Date(editingAnalysis.date);
      editDate.setHours(parseInt(hours), parseInt(minutes));

      await updateNutritionAnalysis(editingAnalysis.id, {
        date: editingAnalysis.date,
        mealType: editingAnalysis.mealType,
        updatedAt: editDate,
      });

      setEditingAnalysis(null);
      alert("✅ Análisis actualizado correctamente");
    } catch (error) {
      console.error("Error actualizando análisis:", error);
      alert("❌ Error al actualizar el análisis");
    }
  };

  const handleSetAsGoals = async (bodyAnalysis: BodyAnalysis) => {
    setSelectedBodyAnalysis(bodyAnalysis);
    setShowGoalsModal(true);
  };

  const handleDeleteSkinFold = async (recordId: string) => {
    if (
      confirm(
        "¿Estás seguro de que quieres eliminar este registro de pliegues cutáneos?"
      )
    ) {
      try {
        await deleteSkinFoldRecord(recordId);
      } catch (error) {
        console.error("Error eliminando registro de pliegues:", error);
        alert("Error eliminando el registro");
      }
    }
  };

  const handleEditSkinFold = (record: SkinFoldRecord) => {
    setEditingSkinFold(record);
    setShowSkinFoldDialog(true);
  };

  const handleCloseSkinFoldDialog = () => {
    setShowSkinFoldDialog(false);
    setEditingSkinFold(null);
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

  const formatDate = (timestamp: Date | undefined, fallbackDate: string) => {
    try {
      if (timestamp) {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
          return {
            date: date.toLocaleDateString("es-ES"),
            time: date.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        }
      }

      // Fallback a la fecha sin hora
      const date = new Date(fallbackDate);
      return {
        date: date.toLocaleDateString("es-ES"),
        time: "Sin hora",
      };
    } catch {
      return {
        date: "Fecha inválida",
        time: "Sin hora",
      };
    }
  };

  if (showFoodAnalyzer) {
    return (
      <FoodAnalyzer
        isOpen={true}
        onClose={() => setShowFoodAnalyzer(false)}
        selectedDate={selectedDate}
      />
    );
  }

  if (showBodyAnalyzer) {
    return (
      <BodyAnalyzer isOpen={true} onClose={() => setShowBodyAnalyzer(false)} />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Centro Nutricional - {selectedDate.toLocaleDateString("es-ES")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              📊 Resumen
            </button>
            <button
              onClick={() => setActiveTab("food")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "food"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              🍽️ Historial de Comidas
            </button>
            <button
              onClick={() => setActiveTab("body")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "body"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              👤 Análisis Corporal
            </button>
            <button
              onClick={() => setActiveTab("skinfolds")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "skinfolds"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              🗺️ Pliegues Cutáneos
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Objetivos actuales */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Objetivos Nutricionales
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Calorías objetivo:
                    </span>
                    <div className="font-medium">
                      {preferences?.dailyCalorieGoal || 2200} kcal
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Proteína objetivo:
                    </span>
                    <div className="font-medium">
                      {preferences?.proteinGoal || 165}g
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Grasa corporal objetivo:
                    </span>
                    <div className="font-medium">
                      {preferences?.bodyFatGoal || 15}%
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Masa muscular objetivo:
                    </span>
                    <div className="font-medium">
                      {preferences?.muscleMassGoal || 70}kg
                    </div>
                  </div>
                </div>

                {!preferences?.dailyCalorieGoal && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      💡 <strong>Tip:</strong> Realiza un análisis corporal y
                      establécelo como objetivos para obtener recomendaciones
                      personalizadas.
                    </p>
                  </div>
                )}
              </div>

              {/* Estadísticas del día */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                  <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Calorías hoy
                  </div>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {todayNutrition.totalCalories}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    de {todayNutrition.targetCalories} kcal
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (todayNutrition.totalCalories /
                            todayNutrition.targetCalories) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Proteína
                  </div>
                  <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                    {Math.round(todayNutrition.macros.protein.consumed)}g
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    {todayNutrition.macros.protein.percentage}% objetivo
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg">
                  <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                    Carbohidratos
                  </div>
                  <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">
                    {Math.round(todayNutrition.macros.carbs.consumed)}g
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">
                    {todayNutrition.macros.carbs.percentage}% objetivo
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                  <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    Grasas
                  </div>
                  <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {Math.round(todayNutrition.macros.fat.consumed)}g
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">
                    {todayNutrition.macros.fat.percentage}% objetivo
                  </div>
                </div>
              </div>

              {/* Comidas del día */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Comidas de hoy</h3>
                  <Button
                    onClick={() => setShowFoodAnalyzer(true)}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Agregar comida
                  </Button>
                </div>

                <div className="space-y-3">
                  {todayNutrition.meals.map((meal, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">
                          {getMealTypeIcon(meal.type)}
                        </div>
                        <div>
                          <div className="font-medium">{meal.name}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {meal.foods.join(", ")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-medium">
                            {meal.calories} kcal
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {meal.time}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const analysis = nutritionAnalyses.find(
                              (a) => a.id === meal.id
                            );
                            if (analysis) handleEditAnalysis(analysis);
                          }}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {todayNutrition.meals.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No has registrado comidas hoy</p>
                      <Button
                        onClick={() => setShowFoodAnalyzer(true)}
                        size="sm"
                        variant="outline"
                        className="mt-2"
                      >
                        Agregar primera comida
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Estadísticas semanales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estadísticas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Promedio de calorías:</span>
                      <span className="font-medium">
                        {weeklyStats.averageCalories} kcal/día
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Análisis nutricionales:</span>
                      <span className="font-medium text-green-600">
                        {weeklyStats.totalAnalyses} registros
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Análisis corporales:</span>
                      <span className="font-medium text-blue-600">
                        {weeklyStats.bodyAnalysesCount} análisis
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Acciones rápidas</h3>
                  <div className="space-y-2">
                    <Button
                      onClick={() => setShowFoodAnalyzer(true)}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Analizar comida por foto
                    </Button>
                    <Button
                      onClick={() => setShowBodyAnalyzer(true)}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Análisis corporal completo
                    </Button>
                    <Button
                      onClick={() => setActiveTab("food")}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver historial nutricional
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Food Tracking Tab */}
          {activeTab === "food" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    Historial de Análisis Nutricionales
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Gestiona y filtra tus análisis de comidas
                  </p>
                </div>
                <Button
                  onClick={() => setShowFoodAnalyzer(true)}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Nuevo análisis
                </Button>
              </div>

              {/* Filtros */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Período
                    </label>
                    <select
                      value={foodFilters.dateFilter}
                      onChange={(e) =>
                        setFoodFilters({
                          ...foodFilters,
                          dateFilter: e.target.value as any,
                        })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    >
                      <option value="all">Todos</option>
                      <option value="today">Hoy</option>
                      <option value="week">Última semana</option>
                      <option value="month">Último mes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tipo de comida
                    </label>
                    <select
                      value={foodFilters.mealTypeFilter}
                      onChange={(e) =>
                        setFoodFilters({
                          ...foodFilters,
                          mealTypeFilter: e.target.value as any,
                        })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    >
                      <option value="all">Todas</option>
                      <option value="breakfast">🌅 Desayuno</option>
                      <option value="lunch">☀️ Almuerzo</option>
                      <option value="dinner">🌙 Cena</option>
                      <option value="snack">🍎 Snack</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Ordenar por
                    </label>
                    <select
                      value={foodFilters.sortBy}
                      onChange={(e) =>
                        setFoodFilters({
                          ...foodFilters,
                          sortBy: e.target.value as any,
                        })
                      }
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    >
                      <option value="date">Fecha</option>
                      <option value="calories">Calorías</option>
                      <option value="confidence">Confianza</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredNutritionAnalyses.length > 0 ? (
                <div className="space-y-4">
                  {filteredNutritionAnalyses.map((analysis) => {
                    const dateInfo = formatDate(
                      analysis.createdAt,
                      analysis.date
                    );
                    const isEditing = editingAnalysis?.id === analysis.id;

                    return (
                      <div
                        key={analysis.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {getMealTypeIcon(analysis.mealType)}
                            </div>
                            <div>
                              {isEditing ? (
                                <div className="space-y-2">
                                  <select
                                    value={editingAnalysis.mealType}
                                    onChange={(e) =>
                                      setEditingAnalysis({
                                        ...editingAnalysis,
                                        mealType: e.target.value as MealType,
                                      })
                                    }
                                    className="p-1 border rounded text-sm"
                                  >
                                    <option value="breakfast">
                                      🌅 Desayuno
                                    </option>
                                    <option value="lunch">☀️ Almuerzo</option>
                                    <option value="dinner">🌙 Cena</option>
                                    <option value="snack">🍎 Snack</option>
                                  </select>
                                  <div className="flex gap-2">
                                    <input
                                      type="date"
                                      value={editingAnalysis.date}
                                      onChange={(e) =>
                                        setEditingAnalysis({
                                          ...editingAnalysis,
                                          date: e.target.value,
                                        })
                                      }
                                      className="p-1 border rounded text-sm"
                                    />
                                    <input
                                      type="time"
                                      value={editingAnalysis.time}
                                      onChange={(e) =>
                                        setEditingAnalysis({
                                          ...editingAnalysis,
                                          time: e.target.value,
                                        })
                                      }
                                      className="p-1 border rounded text-sm"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="font-medium">
                                    {analysis.mealType.charAt(0).toUpperCase() +
                                      analysis.mealType.slice(1)}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    {dateInfo.date} - {dateInfo.time}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="font-medium text-lg">
                                {analysis.totalCalories} kcal
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {Math.round(analysis.aiConfidence * 100)}%
                                confianza
                              </div>
                            </div>
                            {isEditing ? (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  onClick={handleSaveEdit}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  ✓
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingAnalysis(null)}
                                  className="text-gray-600"
                                >
                                  ✕
                                </Button>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditAnalysis(analysis)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteMeal(analysis.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2">
                              Alimentos detectados:
                            </h4>
                            <div className="space-y-1">
                              {analysis.foods.map((food, index) => (
                                <div
                                  key={index}
                                  className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded"
                                >
                                  <span className="font-medium">
                                    {food.name}
                                  </span>{" "}
                                  - {food.quantity}
                                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                                    ({food.calories} kcal)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-sm mb-2">
                              Macronutrientes:
                            </h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Proteína:</span>
                                <span>
                                  {Math.round(analysis.macronutrients.protein)}g
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Carbohidratos:</span>
                                <span>
                                  {Math.round(analysis.macronutrients.carbs)}g
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Grasas:</span>
                                <span>
                                  {Math.round(analysis.macronutrients.fat)}g
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Fibra:</span>
                                <span>
                                  {Math.round(analysis.macronutrients.fiber)}g
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Recomendaciones no disponibles en el tipo NutritionAnalysis actual */}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-medium mb-2">
                    No hay análisis nutricionales
                  </h4>
                  <p className="mb-4">
                    No se encontraron análisis con los filtros seleccionados
                  </p>
                  <Button
                    onClick={() =>
                      setFoodFilters({
                        dateFilter: "all",
                        mealTypeFilter: "all",
                        sortBy: "date",
                      })
                    }
                    variant="outline"
                    className="mr-2"
                  >
                    Limpiar filtros
                  </Button>
                  <Button
                    onClick={() => setShowFoodAnalyzer(true)}
                    className="flex items-center gap-2"
                  >
                    <Camera className="h-4 w-4" />
                    Hacer primer análisis
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Body Analysis Tab */}
          {activeTab === "body" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Análisis Corporal</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Historial de análisis corporales y gestión de objetivos
                  </p>
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
                  {bodyAnalyses
                    .slice()
                    .reverse()
                    .map((analysis) => {
                      const dateInfo = formatDate(
                        analysis.createdAt,
                        (analysis.createdAt instanceof Date
                          ? analysis.createdAt.toISOString()
                          : analysis.createdAt) || new Date().toISOString()
                      );

                      return (
                        <div
                          key={analysis.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-lg">
                                Análisis Corporal
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {dateInfo.date} - {dateInfo.time}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="font-medium">
                                  {analysis.bodyType}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {Math.round(analysis.confidence * 100)}%
                                  confianza
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetAsGoals(analysis)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Establecer como objetivos"
                              >
                                <Target className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  analysis.id &&
                                  handleDeleteBodyAnalysis(analysis.id)
                                }
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-sm mb-2">
                                Mediciones:
                              </h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Grasa corporal:</span>
                                  <span>{analysis.measurements?.bodyFat}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Masa muscular:</span>
                                  <span>
                                    {analysis.measurements?.muscleMass}
                                  </span>
                                </div>
                                {analysis.measurements?.bmi && (
                                  <div className="flex justify-between">
                                    <span>BMI:</span>
                                    <span>{analysis.measurements?.bmi}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-sm mb-2">
                                Recomendaciones:
                              </h4>
                              <div className="space-y-2">
                                <h4 className="font-medium">
                                  Recomendaciones:
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {analysis.recommendations?.map((rec, i) => (
                                    <li key={i}>• {rec}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                            <div className="text-sm text-green-700 dark:text-green-300">
                              💡 <strong>Tip:</strong> Haz clic en el botón{" "}
                              <Target className="h-3 w-3 inline" /> para
                              establecer las recomendaciones de este análisis
                              como tus objetivos nutricionales.
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-medium mb-2">
                    No hay análisis corporales
                  </h4>
                  <p className="mb-4">
                    Realiza tu primer análisis corporal para obtener
                    recomendaciones personalizadas
                  </p>
                  <Button
                    onClick={() => setShowBodyAnalyzer(true)}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Hacer primer análisis
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Skinfolds Tab */}
          {activeTab === "skinfolds" && (
            <div className="space-y-6">
              {/* Header con botón para agregar */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  Historial de Pliegues Cutáneos
                </h3>
                <Button
                  onClick={() => setShowSkinFoldDialog(true)}
                  className="flex items-center gap-2"
                >
                  📏 Registrar Pliegues
                </Button>
              </div>

              {/* Resumen del último registro */}
              {skinFoldRecords.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    📊 Último Registro
                  </h4>
                  {(() => {
                    const latest = skinFoldRecords[0];
                    const totalSum = sumOfSkinfolds(latest);
                    const bodyFat = estimateBodyFatJacksonPollock(
                      latest,
                      preferences?.age || 30,
                      (preferences?.gender === "other"
                        ? "male"
                        : preferences?.gender) || "male"
                    );
                    const previous = skinFoldRecords[1];
                    const comparison = previous
                      ? compareSkinFoldRecords(latest, previous)
                      : null;

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Suma total de pliegues
                          </div>
                          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {totalSum} mm
                            {comparison && (
                              <span
                                className={`ml-2 text-sm ${
                                  comparison.totalChange > 0
                                    ? "text-red-500"
                                    : "text-green-500"
                                }`}
                              >
                                {comparison.totalChange > 0 ? "+" : ""}
                                {comparison.totalChange}mm
                              </span>
                            )}
                          </div>
                        </div>

                        {bodyFat && (
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              % Grasa estimado
                            </div>
                            <div className="text-xl font-bold text-green-600 dark:text-green-400">
                              {bodyFat}%
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Sitios medidos
                          </div>
                          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                            {
                              Object.values(latest.values).filter(
                                (v) => typeof v === "number" && v > 0
                              ).length
                            }
                            /9
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Lista de registros */}
              {skinFoldRecords.length > 0 ? (
                <div className="space-y-4">
                  {skinFoldRecords.map((record) => {
                    const totalSum = sumOfSkinfolds(record);
                    const bodyFat = estimateBodyFatJacksonPollock(
                      record,
                      preferences?.age || 30,
                      (preferences?.gender === "other"
                        ? "male"
                        : preferences?.gender) || "male"
                    );
                    const { date, time } = formatDate(
                      record.createdAt ? new Date(record.createdAt) : undefined,
                      record.date
                    );

                    return (
                      <div
                        key={record.id}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              🗺️ Pliegues Cutáneos
                              {record.aiConfidence && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  AI {Math.round(record.aiConfidence * 100)}%
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {date} • {time}
                              {record.technician && (
                                <span className="ml-2">
                                  • {record.technician}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditSkinFold(record)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteSkinFold(record.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Mediciones */}
                          <div>
                            <h4 className="font-medium text-sm mb-2">
                              Mediciones (mm):
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {Object.entries(record.values).map(
                                ([site, value]) => (
                                  <div
                                    key={site}
                                    className="flex justify-between"
                                  >
                                    <span>
                                      {
                                        SkinFoldSiteNames[
                                          site as keyof typeof SkinFoldSiteNames
                                        ]
                                      }
                                      :
                                    </span>
                                    <span className="font-medium">
                                      {value}mm
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* Estadísticas */}
                          <div>
                            <h4 className="font-medium text-sm mb-2">
                              Estadísticas:
                            </h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Suma total:</span>
                                <span className="font-medium">
                                  {totalSum}mm
                                </span>
                              </div>
                              {bodyFat && (
                                <div className="flex justify-between">
                                  <span>% Grasa estimado:</span>
                                  <span className="font-medium">
                                    {bodyFat}%
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span>Sitios medidos:</span>
                                <span className="font-medium">
                                  {
                                    Object.values(record.values).filter(
                                      (v) => typeof v === "number" && v > 0
                                    ).length
                                  }
                                  /9
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {record.notes && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-sm">
                              <span className="font-medium">Notas:</span>{" "}
                              {record.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h4 className="text-lg font-medium mb-2">
                    No hay registros de pliegues cutáneos
                  </h4>
                  <p className="mb-4">
                    Registra tus primeras mediciones para hacer seguimiento de
                    tu composición corporal
                  </p>
                  <Button
                    onClick={() => setShowSkinFoldDialog(true)}
                    className="flex items-center gap-2"
                  >
                    📏 Registrar Pliegues
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>

      {/* SkinFold Dialog */}
      <SkinFoldDialog
        isOpen={showSkinFoldDialog}
        onClose={handleCloseSkinFoldDialog}
        editingRecord={editingSkinFold || undefined}
      />

      {/* Modal para establecer objetivos */}
      {showGoalsModal && selectedBodyAnalysis && (
        <Dialog open={showGoalsModal} onOpenChange={setShowGoalsModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Establecer Objetivos Nutricionales
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Para calcular objetivos personalizados basados en tu análisis
                corporal, necesitamos algunos datos adicionales:
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);

                  const _personalData = {
                    height: Number(formData.get("height")),
                    currentWeight: Number(formData.get("weight")),
                    targetWeight: Number(formData.get("targetWeight")),
                    age: Number(formData.get("age")),
                    gender: formData.get("gender") as "male" | "female",
                    activityLevel: formData.get("activityLevel") as any,
                    fitnessGoals: [formData.get("goal") as string],
                  };

                  try {
                    const newGoals = calculateNutritionGoalsFromBodyAnalysis(
                      selectedBodyAnalysis as unknown as Record<string, unknown>
                    );

                    await updatePreferences({
                      ...preferences,
                      ...newGoals,
                    });

                    setShowGoalsModal(false);
                    setSelectedBodyAnalysis(null);
                    alert(
                      "✅ Objetivos nutricionales establecidos correctamente"
                    );
                  } catch (error) {
                    console.error("Error estableciendo objetivos:", error);
                    alert("❌ Error al establecer los objetivos");
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Altura (cm)
                    </label>
                    <input
                      name="height"
                      type="number"
                      required
                      defaultValue={preferences?.height || ""}
                      className="w-full p-2 border rounded-md"
                      placeholder="175"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Peso actual (kg)
                    </label>
                    <input
                      name="weight"
                      type="number"
                      required
                      defaultValue={preferences?.currentWeight || ""}
                      className="w-full p-2 border rounded-md"
                      placeholder="70"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Peso objetivo (kg)
                    </label>
                    <input
                      name="targetWeight"
                      type="number"
                      required
                      defaultValue={preferences?.targetWeight || ""}
                      className="w-full p-2 border rounded-md"
                      placeholder="65"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Edad
                    </label>
                    <input
                      name="age"
                      type="number"
                      required
                      defaultValue={preferences?.age || ""}
                      className="w-full p-2 border rounded-md"
                      placeholder="25"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Género
                  </label>
                  <select
                    name="gender"
                    required
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nivel de actividad
                  </label>
                  <select
                    name="activityLevel"
                    required
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="sedentary">
                      Sedentario (poco ejercicio)
                    </option>
                    <option value="light">Ligero (1-3 días/semana)</option>
                    <option value="moderate">Moderado (3-5 días/semana)</option>
                    <option value="active">Activo (6-7 días/semana)</option>
                    <option value="very_active">
                      Muy activo (ejercicio intenso)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Objetivo principal
                  </label>
                  <select
                    name="goal"
                    required
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="lose_weight">Perder peso</option>
                    <option value="gain_muscle">Ganar músculo</option>
                    <option value="define">Definir/Tonificar</option>
                    <option value="maintain_weight">Mantener peso</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Calcular objetivos
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowGoalsModal(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
