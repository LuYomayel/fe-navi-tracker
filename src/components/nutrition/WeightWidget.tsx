"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";
import { WeightEntry } from "@/types";

interface WeightWidgetProps {
  entries: WeightEntry[];
  onAddWeight: () => void;
  targetWeight?: number;
}

export function WeightWidget({
  entries,
  onAddWeight,
  targetWeight,
}: WeightWidgetProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Peso
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="py-4">
            <Scale className="h-8 w-8 mx-auto mb-2 " />
            <p className="text-sm text-muted-foreground mb-3">Sin registros</p>
            <Button onClick={onAddWeight} size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Registrar peso
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const latest = entries[0];
  const previous = entries[1];

  const weightChange = previous ? latest.weight - previous.weight : 0;
  const hasChange = previous && Math.abs(weightChange) > 0.1;

  const getTrendIcon = () => {
    if (!hasChange) return <Minus className="h-3 w-3 text-gray-600" />;
    return weightChange > 0 ? (
      <TrendingUp className="h-3 w-3 text-red-600" />
    ) : (
      <TrendingDown className="h-3 w-3 text-green-600" />
    );
  };

  const getTrendColor = () => {
    if (!hasChange) return "text-gray-600";
    return weightChange > 0 ? "text-red-600" : "text-green-600";
  };

  const getClassification = (bmi?: number) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: "Bajo peso", color: "text-blue-600" };
    if (bmi < 25) return { label: "Normal", color: "text-green-600" };
    if (bmi < 30) return { label: "Sobrepeso", color: "text-yellow-600" };
    return { label: "Obesidad", color: "text-red-600" };
  };

  const classification = getClassification(latest.bmi);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Peso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Peso actual */}
        <div className="text-center">
          <div className="text-2xl font-bold">{latest.weight} kg</div>
          <div className="text-xs text-muted-foreground">
            {new Date(latest.date).toLocaleDateString("es-ES")}
          </div>

          {hasChange && (
            <div
              className={`flex items-center justify-center gap-1 text-xs mt-1 ${getTrendColor()}`}
            >
              {getTrendIcon()}
              <span>
                {weightChange > 0 ? "+" : ""}
                {weightChange.toFixed(1)} kg
              </span>
            </div>
          )}
        </div>

        {/* Métricas adicionales */}
        <div className="grid grid-cols-2 gap-3 text-center">
          {latest.bmi && (
            <div className="p-2 rounded-lg bg-gray-50/50  ">
              <div className="font-medium">{latest.bmi}</div>
              <div className="text-xs text-muted-foreground">BMI</div>
              {classification && (
                <div className={`text-xs mt-1`}>{classification.label}</div>
              )}
            </div>
          )}

          {latest.bodyFatPercentage && (
            <div className="p-2 rounded-lg bg-gray-50/50">
              <div className="font-medium">{latest.bodyFatPercentage}%</div>
              <div className="text-xs text-muted-foreground">Grasa</div>
            </div>
          )}

          {latest.score && !latest.bodyFatPercentage && (
            <div className="p-2 rounded-lg bg-gray-50/50">
              <div className="font-medium">{latest.score}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
          )}

          {latest.muscleMassPercentage && !latest.bmi && (
            <div className="p-2 bg-gray-50/50 rounded-lg">
              <div className="font-medium">{latest.muscleMassPercentage}%</div>
              <div className="text-xs text-muted-foreground">Músculo</div>
            </div>
          )}
        </div>

        {/* Objetivo */}
        {targetWeight && (
          <div className="p-2 bg-blue-50/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Objetivo:</span>
              <span className="font-medium">{targetWeight} kg</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Diferencia:</span>
              <span
                className={
                  latest.weight > targetWeight
                    ? "text-red-600"
                    : "text-green-600"
                }
              >
                {Math.abs(latest.weight - targetWeight).toFixed(1)} kg
              </span>
            </div>
          </div>
        )}

        {/* Botón para agregar */}
        <Button
          onClick={onAddWeight}
          size="sm"
          variant="outline"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Registrar peso
        </Button>
      </CardContent>
    </Card>
  );
}
