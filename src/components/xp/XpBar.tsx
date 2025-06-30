"use client";

// import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useXp } from "@/hooks/useXp";
import { Trophy, Zap, Target, TrendingUp } from "lucide-react";

interface XpBarProps {
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export function XpBar({
  showDetails = true,
  compact = false,
  className = "",
}: XpBarProps) {
  const { xpStats, isLoading, isLevelingUp } = useXp();

  if (isLoading || !xpStats) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className={compact ? "p-3" : "p-4"}>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card
        className={`relative overflow-hidden ${
          isLevelingUp
            ? "ring-2 ring-yellow-400 ring-offset-2 animate-pulse"
            : ""
        }`}
      >
        {/* Efecto de nivel up */}
        {isLevelingUp && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 z-10 animate-pulse" />
        )}

        <CardContent className={compact ? "p-3" : "p-4"}>
          <div className="space-y-3">
            {/* Header con nivel y racha */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="font-bold text-lg">
                    Nivel {xpStats.level}
                  </span>
                </div>

                {xpStats.streak > 0 && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    {xpStats.streak} días
                  </Badge>
                )}
              </div>

              {showDetails && (
                <div className="text-right text-sm text-muted-foreground">
                  <div>
                    {xpStats.xp} / {xpStats.xpForNextLevel} XP
                  </div>
                  <div className="text-xs">
                    Total: {xpStats.totalXp.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Barra de progreso */}
            <div className="space-y-2">
              <Progress value={xpStats.xpProgressPercentage} className="h-3" />

              {!compact && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progreso al siguiente nivel</span>
                  <span>{xpStats.xpProgressPercentage}%</span>
                </div>
              )}
            </div>

            {/* Detalles adicionales */}
            {showDetails && !compact && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-blue-500" />
                  <div>
                    <div className="font-medium">Siguiente Nivel</div>
                    <div className="text-muted-foreground">
                      {xpStats.xpForNextLevel - xpStats.xp} XP restantes
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <div>
                    <div className="font-medium">Racha Actual</div>
                    <div className="text-muted-foreground">
                      {xpStats.streak === 0
                        ? "Empezar racha"
                        : `${xpStats.streak} días`}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        {/* Efectos visuales para level up */}
        {isLevelingUp && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap animate-bounce">
              ¡NIVEL {xpStats.level}!
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
