"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/modules/auth/store";
import { useNaviTrackerStore } from "@/store";
import { useInitializeStore } from "@/hooks/useInitializeStore";

// Componentes de shadcn/ui
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Iconos de Lucide
import {
  Calendar,
  TrendingUp,
  Apple,
  Activity,
  Plus,
  ChevronRight,
  BarChart3,
  Clock,
} from "lucide-react";
import { getDateKey } from "@/lib/utils";
import { DailyReflectionWidget } from "@/components/calendar/DailyReflectionWidget";
import { NaviCompanion } from "@/components/navi/NaviCompanion";
import { XpDashboard } from "@/components/xp/XpDashboard";
import { StreakWidget } from "@/components/xp/StreakWidget";
export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { isLoading } = useInitializeStore();

  const {
    nutritionAnalyses,
    bodyAnalyses,
    activities = [],
  } = useNaviTrackerStore();

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (isAuthenticated && !user) {
      router.push("/auth/login");
    }
  }, [user, isAuthenticated, router]);

  // Mostrar loading mientras se inicializa
  if (!isAuthenticated || !user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isLoading ? "Cargando tu panel de control..." : "Cargando..."}
          </p>
        </div>
      </div>
    );
  }

  // Estadísticas de hoy
  const today = new Date();
  const todayKey = getDateKey(today);
  const todayNutrition = nutritionAnalyses.filter((n) => n.date === todayKey);
  const totalCaloriesToday = todayNutrition.reduce(
    (sum, n) => sum + n.totalCalories,
    0
  );

  // Para actividades, usamos las que fueron creadas hoy (ya que no tienen date específico)
  const todayActivities = activities.filter((a) => {
    const activityDate = new Date(a.createdAt);
    return getDateKey(activityDate) === todayKey;
  });

  // Estadísticas de la semana
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">¡Hola, {user.name}! 👋</h1>
        <p className="text-muted-foreground mt-2">
          Aquí tienes tu resumen de hábitos y progreso de hoy
        </p>
      </div>

      {/* Dashboards de XP y Rachas */}
      <div className="grid gap-6 md:grid-cols-2">
        <XpDashboard />
        <StreakWidget />
      </div>

      {/* Resumen de estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calorías Hoy</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCaloriesToday}</div>
            <p className="text-xs text-muted-foreground">
              {todayNutrition.length} comidas registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Actividades Hoy
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayActivities.length}</div>
            <p className="text-xs text-muted-foreground">hábitos completados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Promedio Semanal
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCaloriesWeek}</div>
            <p className="text-xs text-muted-foreground">calorías por día</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Análisis Corporales
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bodyAnalyses.length}</div>
            <p className="text-xs text-muted-foreground">registros totales</p>
          </CardContent>
        </Card>
      </div>

      {/* Secciones principales */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sección de Hábitos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Seguimiento de Hábitos
                </CardTitle>
                <CardDescription>
                  Gestiona tus hábitos diarios y mantén la constancia
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Actividades de hoy</p>
                <p className="text-sm text-muted-foreground">
                  {todayActivities.length} completadas
                </p>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                Últimos 7 días: {weeklyActivities.length}
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/habits">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Calendario
                </Link>
              </Button>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sección de Nutrición */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="h-5 w-5" />
                  Nutrición y Salud
                </CardTitle>
                <CardDescription>
                  Analiza tu alimentación y progreso físico
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Calorías de hoy</p>
                <p className="text-sm text-muted-foreground">
                  {totalCaloriesToday} kcal en {todayNutrition.length} comidas
                </p>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 mr-1" />
                Promedio: {averageCaloriesWeek} kcal/día
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/nutrition">
                  <Apple className="h-4 w-4 mr-2" />
                  Ver Análisis
                </Link>
              </Button>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widget de Reflexión Diaria */}
      <DailyReflectionWidget />

      {/* Acceso rápido */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link href="/habits">
            <Calendar className="h-4 w-4 mr-2" />
            Ir a Hábitos
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/nutrition">
            <Apple className="h-4 w-4 mr-2" />
            Ir a Nutrición
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      <NaviCompanion />
    </div>
  );
}
