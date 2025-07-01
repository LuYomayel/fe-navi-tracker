"use client";

import { useXp } from "@/hooks/useXp";
import { Star, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface XpGlobalIndicatorProps {
  className?: string;
  compact?: boolean;
}

export function XpGlobalIndicator({
  className = "",
  compact = false,
}: XpGlobalIndicatorProps) {
  const { xpStats, isLoading } = useXp();

  if (isLoading || !xpStats) {
    return (
      <Card className={`${className} animate-pulse`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-muted rounded"></div>
            <div className="w-16 h-4 bg-muted rounded"></div>
            <div className="w-8 h-4 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = Math.min(100, xpStats.xpProgressPercentage);
  const xpToNext = Math.max(0, xpStats.xpForNextLevel - xpStats.xp);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
          <span className="text-sm font-semibold">{xpStats.totalXp}</span>
        </div>
        <Badge variant="outline" className="text-xs">
          Nv. {xpStats.level}
        </Badge>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">
                {xpStats.totalXp.toLocaleString()}
              </span>
              <Badge variant="secondary">Nivel {xpStats.level}</Badge>
            </div>
          </div>

          {xpStats.streak > 1 && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-600">
                {xpStats.streak} días
              </span>
            </div>
          )}

          {/* Mostrar rachas específicas si están disponibles */}
          {(xpStats as any).streaks && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-blue-600">
                H:{(xpStats as any).streaks.habits.streak}
              </span>
              <span className="text-green-600">
                N:{(xpStats as any).streaks.nutrition.streak}
              </span>
              <span className="text-purple-600">
                A:{(xpStats as any).streaks.activity.streak}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {xpStats.xp} / {xpStats.xpForNextLevel} XP
            </span>
            <span>{xpToNext} para siguiente nivel</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
