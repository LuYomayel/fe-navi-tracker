"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XpBar } from "./XpBar";
import { XpLogWidget } from "./XpLogWidget";
import { useXp } from "@/hooks/useXp";
import { Trophy, Zap, Target } from "lucide-react";

interface XpDashboardProps {
  className?: string;
}

export function XpDashboard({ className = "" }: XpDashboardProps) {
  const { xpStats, isLoading } = useXp();

  if (isLoading || !xpStats) {
    return (
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}>
      {/* Barra principal de XP */}
      <div className="lg:col-span-2">
        <XpBar showDetails={true} compact={false} />
      </div>

      {/* Estadísticas rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Estadísticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{xpStats.level}</div>
            <div className="text-sm text-muted-foreground">Nivel Actual</div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {xpStats.totalXp.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">XP Total</div>
            </div>

            <div>
              <div className="text-lg font-semibold text-orange-600 flex items-center justify-center gap-1">
                <Zap className="w-4 h-4" />
                {xpStats.streak}
              </div>
              <div className="text-xs text-muted-foreground">Racha</div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                Siguiente nivel
              </span>
              <span className="font-medium">
                {xpStats.xpForNextLevel - xpStats.xp} XP
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log de actividad */}
      <div className="lg:col-span-3">
        <XpLogWidget maxItems={8} />
      </div>
    </div>
  );
}
