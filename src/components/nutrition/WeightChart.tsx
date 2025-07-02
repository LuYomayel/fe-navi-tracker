"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Scale, Target } from "lucide-react";
import { WeightEntry, WeightAnalysis } from "@/types";

interface WeightChartProps {
  entries: WeightEntry[];
  targetWeight?: number;
}

export function WeightChart({ entries, targetWeight }: WeightChartProps) {
  const analysis = useMemo(() => {
    if (entries.length === 0) return null;

    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const current = sortedEntries[0];
    const previous = sortedEntries[1];

    let weightChange = 0;
    let weightChangePercentage = 0;
    let trend: "increasing" | "decreasing" | "stable" = "stable";

    if (previous) {
      weightChange = current.weight - previous.weight;
      weightChangePercentage = (weightChange / previous.weight) * 100;

      if (Math.abs(weightChange) > 0.1) {
        trend = weightChange > 0 ? "increasing" : "decreasing";
      }
    }

    // Clasificación BMI
    let classification: "underweight" | "normal" | "overweight" | "obese" =
      "normal";
    if (current.bmi) {
      if (current.bmi < 18.5) classification = "underweight";
      else if (current.bmi >= 25 && current.bmi < 30)
        classification = "overweight";
      else if (current.bmi >= 30) classification = "obese";
    }

    // Progreso hacia objetivo
    let progressToTarget: number | undefined;
    if (targetWeight) {
      const totalChange = Math.abs(
        targetWeight - (previous?.weight || current.weight)
      );
      const currentProgress = Math.abs(targetWeight - current.weight);
      progressToTarget = Math.max(
        0,
        ((totalChange - currentProgress) / totalChange) * 100
      );
    }

    return {
      currentWeight: current.weight,
      previousWeight: previous?.weight,
      weightChange,
      weightChangePercentage,
      bmiChange:
        current.bmi && previous?.bmi ? current.bmi - previous.bmi : undefined,
      bfrChange:
        current.bfr && previous?.bfr ? current.bfr - previous.bfr : undefined,
      trend,
      period: "day" as const,
      classification,
      targetWeight,
      progressToTarget,
    } as WeightAnalysis;
  }, [entries, targetWeight]);

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "underweight":
        return "text-blue-600";
      case "normal":
        return "text-green-600";
      case "overweight":
        return "text-yellow-600";
      case "obese":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getClassificationLabel = (classification: string) => {
    switch (classification) {
      case "underweight":
        return "Bajo peso";
      case "normal":
        return "Normal";
      case "overweight":
        return "Sobrepeso";
      case "obese":
        return "Obesidad";
      default:
        return "Sin clasificar";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-red-600" />;
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "text-red-600";
      case "decreasing":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (!analysis || entries.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Scale className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Sin datos de peso</h3>
          <p className="text-muted-foreground">
            Registra tu primer peso para ver el análisis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Análisis principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Análisis de Peso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Peso actual */}
            <div className="text-center">
              <div className="text-3xl font-bold">
                {analysis.currentWeight} kg
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                Peso Actual
              </div>

              {analysis.previousWeight && (
                <div
                  className={`flex items-center justify-center gap-1 text-sm ${getTrendColor(
                    analysis.trend
                  )}`}
                >
                  {getTrendIcon(analysis.trend)}
                  <span>
                    {analysis.weightChange > 0 ? "+" : ""}
                    {analysis.weightChange.toFixed(1)} kg
                  </span>
                  <span className="text-xs">
                    ({analysis.weightChangePercentage > 0 ? "+" : ""}
                    {analysis.weightChangePercentage.toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>

            {/* BMI */}
            {entries[0].bmi && (
              <div className="text-center">
                <div className="text-3xl font-bold">{entries[0].bmi}</div>
                <div className="text-sm text-muted-foreground mb-2">BMI</div>
                <Badge
                  variant="outline"
                  className={getClassificationColor(analysis.classification)}
                >
                  {getClassificationLabel(analysis.classification)}
                </Badge>

                {analysis.bmiChange && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {analysis.bmiChange > 0 ? "+" : ""}
                    {analysis.bmiChange.toFixed(1)} desde última medición
                  </div>
                )}
              </div>
            )}

            {/* Grasa corporal */}
            {entries[0].bodyFatPercentage && (
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {entries[0].bodyFatPercentage}%
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  Grasa Corporal
                </div>

                {analysis.bfrChange && (
                  <div
                    className={`text-xs ${
                      analysis.bfrChange > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {analysis.bfrChange > 0 ? "+" : ""}
                    {analysis.bfrChange.toFixed(1)}% desde última medición
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Objetivo y progreso */}
      {targetWeight && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progreso hacia Objetivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Peso objetivo:</span>
                <span className="font-medium">{targetWeight} kg</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Diferencia:</span>
                <span
                  className={`font-medium ${
                    analysis.currentWeight > targetWeight
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {Math.abs(analysis.currentWeight - targetWeight).toFixed(1)}{" "}
                  kg
                  {analysis.currentWeight > targetWeight
                    ? " por encima"
                    : " por debajo"}
                </span>
              </div>

              {analysis.progressToTarget !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Progreso:</span>
                    <span className="font-medium">
                      {analysis.progressToTarget.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(analysis.progressToTarget, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas adicionales */}
      {(entries[0].muscleMassPercentage ||
        entries[0].bodyWaterPercentage ||
        entries[0].score) && (
        <Card>
          <CardHeader>
            <CardTitle>Métricas Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {entries[0].muscleMassPercentage && (
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {entries[0].muscleMassPercentage}%
                  </div>
                  <div className="text-sm text-blue-800">Masa Muscular</div>
                </div>
              )}

              {entries[0].bodyWaterPercentage && (
                <div className="text-center p-3 bg-cyan-50 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-600">
                    {entries[0].bodyWaterPercentage}%
                  </div>
                  <div className="text-sm text-cyan-800">Agua Corporal</div>
                </div>
              )}

              {entries[0].score && (
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {entries[0].score}
                  </div>
                  <div className="text-sm text-purple-800">Score General</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historial reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Historial Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {entries.slice(0, 5).map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-lg"
              >
                <div>
                  <div className="font-medium">{entry.weight} kg</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString("es-ES", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {entry.bmi && (
                    <Badge variant="outline" size="sm">
                      BMI: {entry.bmi}
                    </Badge>
                  )}
                  {entry.bodyFatPercentage && (
                    <Badge variant="outline" size="sm">
                      BF: {entry.bodyFatPercentage}%
                    </Badge>
                  )}
                  {index === 0 && (
                    <Badge variant="default" size="sm">
                      Actual
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
