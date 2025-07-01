"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Utensils, Activity, Flame } from "lucide-react";
import { useXp } from "@/hooks/useXp";

interface StreakData {
  habits: { streak: number; lastDate: string | null };
  nutrition: { streak: number; lastDate: string | null };
  activity: { streak: number; lastDate: string | null };
}

interface StreakWidgetProps {
  className?: string;
  compact?: boolean;
}

export function StreakWidget({
  className = "",
  compact = false,
}: StreakWidgetProps) {
  const { xpStats, isLoading } = useXp();

  if (isLoading || !xpStats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-4 h-4" />
            Rachas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-2 bg-muted/50 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Usar las nuevas rachas por categoría si están disponibles, sino usar la racha general
  const streaks: StreakData = (xpStats as any).streaks || {
    habits: { streak: xpStats.streak, lastDate: xpStats.lastStreakDate },
    nutrition: { streak: 0, lastDate: null },
    activity: { streak: 0, lastDate: null },
  };

  const getStreakColor = (streak: number) => {
    if (streak === 0) return "text-gray-400";
    if (streak < 3) return "text-orange-500";
    if (streak < 7) return "text-yellow-500";
    if (streak < 14) return "text-green-500";
    return "text-purple-500";
  };

  const getStreakBadgeColor = (streak: number) => {
    if (streak === 0) return "bg-gray-100 text-gray-600";
    if (streak < 3) return "bg-orange-100 text-orange-700";
    if (streak < 7) return "bg-yellow-100 text-yellow-700";
    if (streak < 14) return "bg-green-100 text-green-700";
    return "bg-purple-100 text-purple-700";
  };

  const formatLastDate = (lastDate: string | null) => {
    if (!lastDate) return "Nunca";
    const date = new Date(lastDate);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    return `Hace ${diffDays} días`;
  };

  if (compact) {
    return (
      <div className={`grid grid-cols-3 gap-2 ${className}`}>
        <div className="text-center">
          <div
            className={`text-lg font-bold ${getStreakColor(
              streaks.habits.streak
            )}`}
          >
            {streaks.habits.streak}
          </div>
          <div className="text-xs text-muted-foreground">Hábitos</div>
        </div>
        <div className="text-center">
          <div
            className={`text-lg font-bold ${getStreakColor(
              streaks.nutrition.streak
            )}`}
          >
            {streaks.nutrition.streak}
          </div>
          <div className="text-xs text-muted-foreground">Nutrición</div>
        </div>
        <div className="text-center">
          <div
            className={`text-lg font-bold ${getStreakColor(
              streaks.activity.streak
            )}`}
          >
            {streaks.activity.streak}
          </div>
          <div className="text-xs text-muted-foreground">Actividad</div>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          Rachas por Categoría
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Racha de Hábitos */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium">Hábitos</div>
                <div className="text-sm text-muted-foreground">
                  Todos los hábitos del día
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={getStreakBadgeColor(streaks.habits.streak)}>
                {streaks.habits.streak} días
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">
                {formatLastDate(streaks.habits.lastDate)}
              </div>
            </div>
          </div>

          {/* Racha de Nutrición */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Utensils className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium">Nutrición</div>
                <div className="text-sm text-muted-foreground">
                  3+ comidas registradas
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={getStreakBadgeColor(streaks.nutrition.streak)}>
                {streaks.nutrition.streak} días
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">
                {formatLastDate(streaks.nutrition.lastDate)}
              </div>
            </div>
          </div>

          {/* Racha de Actividad Física */}
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-purple-500" />
              <div>
                <div className="font-medium">Actividad Física</div>
                <div className="text-sm text-muted-foreground">
                  1+ actividad registrada
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={getStreakBadgeColor(streaks.activity.streak)}>
                {streaks.activity.streak} días
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">
                {formatLastDate(streaks.activity.lastDate)}
              </div>
            </div>
          </div>

          {/* Progreso hacia metas de racha */}
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm font-medium mb-2">Próximas Metas</div>
            <div className="space-y-2">
              {streaks.habits.streak < 7 && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Hábitos - Semana perfecta</span>
                    <span>{streaks.habits.streak}/7</span>
                  </div>
                  <Progress
                    value={(streaks.habits.streak / 7) * 100}
                    className="h-1"
                  />
                </div>
              )}
              {streaks.nutrition.streak < 7 && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Nutrición - Semana saludable</span>
                    <span>{streaks.nutrition.streak}/7</span>
                  </div>
                  <Progress
                    value={(streaks.nutrition.streak / 7) * 100}
                    className="h-1"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
