"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/modules/auth/store";
import { useNaviTrackerStore } from "@/store";
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

interface EditingAnalysis {
  id: string;
  date: string;
  mealType: MealType;
  time: string;
}

export default function NutritionPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { isLoading } = useInitializeStore();

  const {
    nutritionAnalyses,
    bodyAnalyses,
    skinFoldRecords,
    deleteNutritionAnalysis,
    deleteBodyAnalysis,
    updateNutritionAnalysis,
    deleteSkinFoldRecord,
    updateSkinFoldRecord,
  } = useNaviTrackerStore();

  const [selectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<
    "overview" | "food" | "body" | "skinfold"
  >("overview");
  const [showFoodAnalyzer, setShowFoodAnalyzer] = useState(false);
  const [showBodyAnalyzer, setShowBodyAnalyzer] = useState(false);
  const [showSkinFoldDialog, setShowSkinFoldDialog] = useState(false);
  const [editingAnalysis, setEditingAnalysis] =
    useState<EditingAnalysis | null>(null);

  // Filtros para análisis nutricionales
  const [foodFilters, setFoodFilters] = useState({
    dateFilter: "all" as "all" | "today" | "week" | "month",
    mealTypeFilter: "all" as "all" | MealType,
    sortBy: "date" as "date" | "calories" | "confidence",
  });

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

  // Lógica del NutritionTracker
  const today = new Date();
  const todayKey = getDateKey(today);
  const todayNutrition = nutritionAnalyses.filter((n) => n.date === todayKey);
  const totalCaloriesToday = todayNutrition.reduce(
    (sum, n) => sum + n.totalCalories,
    0
  );

  // Filtrar análisis nutricionales
  const filteredNutritionAnalyses = nutritionAnalyses
    .filter((analysis) => {
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
    .sort((a, b) => {
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

  // Estadísticas semanales
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
    if (
      confirm(
        "¿Estás seguro de que quieres eliminar este análisis nutricional?"
      )
    ) {
      await deleteNutritionAnalysis(analysisId);
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
      mealType: analysis.mealType,
      time: timestamp.toTimeString().slice(0, 5),
    });
  };

  const handleSaveEdit = async () => {
    if (!editingAnalysis) return;

    await updateNutritionAnalysis(editingAnalysis.id, {
      mealType: editingAnalysis.mealType,
      // Actualizar timestamp si es necesario
    });

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

  const formatDate = (timestamp: Date | undefined, fallbackDate: string) => {
    if (timestamp) {
      return {
        date: timestamp.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        }),
        time: timestamp.toLocaleTimeString("es-ES", {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Centro Nutricional 🍎</h1>
        <p className="text-muted-foreground mt-2">
          Análisis inteligente de alimentos, seguimiento de pliegues cutáneos y
          monitoreo corporal
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "Resumen", icon: BarChart3 },
            { id: "food", label: "Seguimiento", icon: Camera },
            { id: "body", label: "Análisis Corporal", icon: User },
            { id: "skinfold", label: "Pliegues Cutáneos", icon: Target },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Actions */}
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

          {/* Estadísticas */}
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
                  <span className="font-medium">
                    {weeklyStats.totalAnalyses} registros
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Análisis corporales:</span>
                  <span className="font-medium">
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
                const dateInfo = formatDate(analysis.createdAt, analysis.date);
                const isEditing = editingAnalysis?.id === analysis.id;

                return (
                  <div
                    key={analysis.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">
                          {getMealTypeIcon(analysis.mealType)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">
                            {analysis.mealType.charAt(0).toUpperCase() +
                              analysis.mealType.slice(1)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {dateInfo.date} - {dateInfo.time}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-medium text-lg">
                            {analysis.totalCalories} kcal
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {Math.round(analysis.aiConfidence * 100)}% confianza
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAnalysis(analysis)}
                            className="hover:bg-accent"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMeal(analysis.id)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Detalles de alimentos */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {analysis.foods.map((food, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                        >
                          <div className="font-medium text-sm">{food.name}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
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
            <div className="text-center py-12">
              <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium  mb-2">
                No hay análisis nutricionales
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Empieza analizando tu primera comida
              </p>
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
      {activeTab === "body" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Análisis Corporales</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Historial de análisis de composición corporal
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
              {bodyAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        Análisis{" "}
                        {analysis.createdAt
                          ? new Date(analysis.createdAt).toLocaleDateString(
                              "es-ES"
                            )
                          : "Fecha no disponible"}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {/* Peso: {analysis.currentWeight}kg • Altura: {analysis.height}cm */}
                        Análisis completado
                      </div>
                    </div>
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No hay análisis corporales
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Realiza tu primer análisis corporal
              </p>
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

      {/* Skinfold Tab */}
      {activeTab === "skinfold" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Pliegues Cutáneos</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Historial de mediciones de pliegues cutáneos
              </p>
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
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
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
                      <div className="text-sm text-gray-600 dark:text-gray-400">
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
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No hay mediciones de pliegues
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
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
      />

      <BodyAnalyzer
        isOpen={showBodyAnalyzer}
        onClose={() => setShowBodyAnalyzer(false)}
      />

      <SkinFoldDialog
        isOpen={showSkinFoldDialog}
        onClose={() => setShowSkinFoldDialog(false)}
      />
    </div>
  );
}
