"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Zap } from "lucide-react";
import { api } from "@/lib/api-client";
import { AICostStats } from "@/types";

const SERVICE_LABELS: Record<string, string> = {
  food_analysis: "Analisis de comida",
  body_analysis: "Analisis corporal",
  physical_activity: "Actividad fisica",
  weight_photo: "Foto de peso",
  skinfold: "Pliegues cutaneos",
};

export function AICostWidget() {
  const [stats, setStats] = useState<AICostStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.aiCost.getStats();
      if (response.success) {
        setStats(response.data as AICostStats);
      }
    } catch (error) {
      console.error("Error loading AI cost stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-24 bg-secondary rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalCalls === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="h-4 w-4 text-green-500" />
          Costos de IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-secondary/50 rounded-xl">
              <div className="text-lg font-bold text-green-600">
                ${stats.totalCost.toFixed(4)}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-xl">
              <div className="text-lg font-bold text-blue-600">
                ${stats.monthlyCost.toFixed(4)}
              </div>
              <div className="text-xs text-muted-foreground">Este mes</div>
            </div>
            <div className="text-center p-3 bg-secondary/50 rounded-xl">
              <div className="text-lg font-bold text-purple-600">
                {stats.totalCalls}
              </div>
              <div className="text-xs text-muted-foreground">Llamadas</div>
            </div>
          </div>

          {/* By service breakdown */}
          {stats.byService.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Por servicio
              </h4>
              <div className="space-y-1.5">
                {stats.byService.map((item) => (
                  <div
                    key={item.service}
                    className="flex items-center justify-between text-sm py-1.5 px-2 bg-secondary/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="h-3 w-3 text-amber-500" />
                      <span>{SERVICE_LABELS[item.service] || item.service}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="text-xs">{item.calls}x</span>
                      <span className="font-medium text-foreground">
                        ${item.cost.toFixed(4)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
