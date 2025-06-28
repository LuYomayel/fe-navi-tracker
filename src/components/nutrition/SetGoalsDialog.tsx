"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Target, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNaviTrackerStore } from "@/store";
import {
  ActivityLevel,
  BodyAnalysis,
  UserPreferences,
  SetGoalsRequest,
} from "@/types";
import { toast } from "@/lib/toast-helper";
import { api } from "@/lib/api-client";

interface SetGoalsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bodyAnalysis: BodyAnalysis | null;
  onGoalsSaved?: () => void;
  isManualMode?: boolean;
}

export const SetGoalsDialog: React.FC<SetGoalsDialogProps> = ({
  isOpen,
  onClose,
  bodyAnalysis,
  onGoalsSaved,
  isManualMode = false,
}) => {
  const { preferences, updatePreferences } = useNaviTrackerStore();

  // Estados para los objetivos ajustables
  const [adjustableGoals, setAdjustableGoals] = useState({
    dailyCalories: bodyAnalysis?.recommendations?.dailyCalories || 2000,
    protein: bodyAnalysis?.recommendations?.macroSplit?.protein || 150,
    carbs: bodyAnalysis?.recommendations?.macroSplit?.carbs || 250,
    fat: bodyAnalysis?.recommendations?.macroSplit?.fat || 67,
    fiber: 25,
    sugar: 50,
    sodium: 2300,
  });

  // Estado para mostrar el payload que se enviará
  const [showPayloadPreview, setShowPayloadPreview] = useState(false);

  // Calcular objetivos iniciales cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      console.log("🔄 Body Analysis:", bodyAnalysis);
      if (bodyAnalysis && !isManualMode) {
        // Modo con análisis corporal - usar datos de la API
        const apiRecommendations = bodyAnalysis.recommendations;

        // Usar los valores de la API como base
        const baseCalories = apiRecommendations?.dailyCalories || 2000;
        const macroSplit = apiRecommendations?.macroSplit || {
          protein: 30,
          carbs: 40,
          fat: 30,
        };

        // Calcular macros en gramos
        const protein = Math.round(
          (baseCalories * (macroSplit.protein / 100)) / 4
        );
        const carbs = Math.round((baseCalories * (macroSplit.carbs / 100)) / 4);
        const fat = Math.round((baseCalories * (macroSplit.fat / 100)) / 9);

        setAdjustableGoals({
          dailyCalories: baseCalories,
          protein,
          carbs,
          fat,
          fiber: Math.round(baseCalories / 80), // ~25g por cada 2000 kcal
          sugar: Math.round(baseCalories * 0.025), // ~2.5% de calorías
          sodium: 2300, // Recomendación estándar
        });
      } else {
        // Modo manual - usar valores por defecto o preferencias existentes
        setAdjustableGoals({
          dailyCalories: preferences?.dailyCalorieGoal || 2000,
          protein: preferences?.proteinGoal || 150,
          carbs: preferences?.carbsGoal || 250,
          fat: preferences?.fatGoal || 67,
          fiber: 25,
          sugar: 50,
          sodium: 2300,
        });
      }
    }
  }, [bodyAnalysis, isOpen, isManualMode, preferences]);

  // Función para preparar el payload completo ajustado para el endpoint
  const prepareNutritionGoalsPayload = (formData: FormData) => {
    const payload: SetGoalsRequest = {
      // Datos personales (requeridos por SetGoalsRequest)
      height: Number(formData.get("height")),
      currentWeight: Number(formData.get("weight")),
      targetWeight: Number(formData.get("targetWeight")),
      age: Number(formData.get("age")),
      gender: formData.get("gender") as "male" | "female" | "other",
      activityLevel: formData.get("activityLevel") as
        | "sedentary"
        | "light"
        | "moderate"
        | "active"
        | "very_active",
      fitnessGoal: formData.get("goal") as string,

      // Objetivos nutricionales anidados en finalGoals
      finalGoals: {
        dailyCalories: adjustableGoals.dailyCalories,
        protein: adjustableGoals.protein,
        carbs: adjustableGoals.carbs,
        fat: adjustableGoals.fat,
      },

      // Información del análisis corporal (opcional)
      bodyAnalysisId: bodyAnalysis?.id,
    };

    return payload;
  };

  // Función para enviar al endpoint (preparada para cuando esté listo)
  const saveNutritionGoalsToAPI = async (payload: SetGoalsRequest) => {
    try {
      // TODO: Reemplazar con llamada real al endpoint
      console.log(
        "🚀 Payload que se enviará al endpoint:",
        JSON.stringify(payload, null, 2)
      );

      // Simulación de llamada API
      const response = await api.preferences.post(payload);
      if (response.success) {
        toast.success("Objetivos establecidos y guardados");
      } else {
        toast.error("Error", "No se pudieron establecer los objetivos");
      }

      // Por ahora, simular éxito
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return { success: true, data: payload };
    } catch (error) {
      console.error("❌ Error enviando objetivos al API:", error);
      throw error;
    }
  };

  if (!bodyAnalysis && !isManualMode) return null;

  const fullData: BodyAnalysis = bodyAnalysis as BodyAnalysis;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {isManualMode
              ? "Establecer Objetivos Nutricionales Manualmente"
              : "Establecer Objetivos Nutricionales"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del análisis corporal - solo si no es modo manual */}
          {fullData && !isManualMode && (
            <div className="bg-muted p-4 rounded-lg space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Info className="h-4 w-4" />
                Resumen del Análisis Corporal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <strong>Tipo corporal:</strong> {bodyAnalysis?.bodyType}
                  </div>
                  <div>
                    <strong>Grasa corporal:</strong>{" "}
                    {fullData.measurements?.bodyFatPercentage ||
                      fullData.measurements?.estimatedBodyFat}
                    %
                  </div>
                  <div>
                    <strong>IMC:</strong>{" "}
                    {fullData.bodyComposition.estimatedBMI}
                  </div>
                  <div>
                    <strong>Metabolismo:</strong>{" "}
                    {fullData.bodyComposition.metabolism}
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <strong>Prioridad:</strong>{" "}
                    {fullData.recommendations?.priority}
                  </div>
                  <div>
                    <strong>Nivel fitness:</strong>{" "}
                    {fullData.measurements?.overallFitness}
                  </div>
                  <div>
                    <strong>Definición muscular:</strong>{" "}
                    {fullData.measurements?.muscleDefinition}
                  </div>
                  <div>
                    <strong>Confianza:</strong>{" "}
                    {Math.round((bodyAnalysis?.aiConfidence || 0) * 100)}%
                  </div>
                </div>
              </div>

              {/* Objetivos específicos de la API */}
              {fullData.recommendations?.goals &&
                fullData.recommendations?.goals.length > 0 && (
                  <div>
                    <strong className="text-sm">Objetivos específicos:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {fullData.recommendations?.goals.map((goal, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Recomendaciones nutricionales */}
              {fullData.recommendations?.nutrition &&
                fullData.recommendations?.nutrition.length > 0 && (
                  <div>
                    <strong className="text-sm">
                      Recomendaciones nutricionales:
                    </strong>
                    <div className="space-y-1 mt-1 max-h-32 overflow-y-auto">
                      {fullData.recommendations?.nutrition.map(
                        (recommendation, index) => (
                          <div
                            key={index}
                            className="text-xs p-2 bg-blue-50/50 rounded"
                          >
                            {recommendation}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Mensaje para modo manual */}
          {isManualMode && (
            <div className="bg-yellow-50/50 p-4 rounded-lg">
              <h3 className="font-semibold flex items-center gap-2 text-yellow-800">
                <Info className="h-4 w-4" />
                Configuración Manual
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Establece tus objetivos nutricionales manualmente. Los valores
                se calculan automáticamente basándose en tus datos personales.
              </p>
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);

              try {
                // Preparar payload completo
                const payload = prepareNutritionGoalsPayload(formData);

                // Enviar al endpoint (cuando esté listo)
                const result = await saveNutritionGoalsToAPI(payload);

                if (result.success) {
                  // Actualizar preferencias locales como backup
                  await updatePreferences({
                    ...preferences,
                    height: payload.height,
                    currentWeight: payload.currentWeight,
                    targetWeight: payload.targetWeight,
                    age: payload.age,
                    gender: payload.gender,
                    activityLevel: payload.activityLevel as ActivityLevel,
                    fitnessGoals: [payload.fitnessGoal],
                    dailyCalorieGoal: payload.finalGoals.dailyCalories,
                    proteinGoal: payload.finalGoals.protein,
                    carbsGoal: payload.finalGoals.carbs,
                    fatGoal: payload.finalGoals.fat,
                  } as Partial<UserPreferences>);

                  toast.success(
                    "Objetivos establecidos y guardados",
                    `🎯 ${payload.finalGoals.dailyCalories} kcal/día • 🥩 ${payload.finalGoals.protein}g proteína • 🍞 ${payload.finalGoals.carbs}g carbos • 🥑 ${payload.finalGoals.fat}g grasas`
                  );

                  // Ejecutar callback antes de cerrar
                  if (onGoalsSaved) {
                    onGoalsSaved();
                  }

                  onClose();
                }
              } catch (error) {
                console.error("Error estableciendo objetivos:", error);
                toast.error("Error", "No se pudieron establecer los objetivos");
              }
            }}
            className="space-y-6"
          >
            {/* Objetivos Nutricionales Ajustables */}
            <div className="space-y-4">
              <h3 className="font-semibold">
                🎯 Objetivos Nutricionales (Ajustables)
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium">
                    Calorías diarias
                  </label>
                  <Input
                    type="number"
                    value={adjustableGoals.dailyCalories}
                    onChange={(e) =>
                      setAdjustableGoals((prev) => ({
                        ...prev,
                        dailyCalories: Number(e.target.value),
                      }))
                    }
                    min="1200"
                    max="4000"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium">
                    Proteína (g)
                  </label>
                  <Input
                    type="number"
                    value={adjustableGoals.protein}
                    onChange={(e) =>
                      setAdjustableGoals((prev) => ({
                        ...prev,
                        protein: Number(e.target.value),
                      }))
                    }
                    min="50"
                    max="300"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium">
                    Carbohidratos (g)
                  </label>
                  <Input
                    type="number"
                    value={adjustableGoals.carbs}
                    onChange={(e) =>
                      setAdjustableGoals((prev) => ({
                        ...prev,
                        carbs: Number(e.target.value),
                      }))
                    }
                    min="50"
                    max="500"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium">
                    Grasas (g)
                  </label>
                  <Input
                    type="number"
                    value={adjustableGoals.fat}
                    onChange={(e) =>
                      setAdjustableGoals((prev) => ({
                        ...prev,
                        fat: Number(e.target.value),
                      }))
                    }
                    min="30"
                    max="200"
                  />
                </div>
              </div>

              {/* Objetivos adicionales */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium">
                    Fibra (g)
                  </label>
                  <Input
                    type="number"
                    value={adjustableGoals.fiber}
                    onChange={(e) =>
                      setAdjustableGoals((prev) => ({
                        ...prev,
                        fiber: Number(e.target.value),
                      }))
                    }
                    min="15"
                    max="50"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium">
                    Azúcar (g)
                  </label>
                  <Input
                    type="number"
                    value={adjustableGoals.sugar}
                    onChange={(e) =>
                      setAdjustableGoals((prev) => ({
                        ...prev,
                        sugar: Number(e.target.value),
                      }))
                    }
                    min="20"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-xs font-medium">
                    Sodio (mg)
                  </label>
                  <Input
                    type="number"
                    value={adjustableGoals.sodium}
                    onChange={(e) =>
                      setAdjustableGoals((prev) => ({
                        ...prev,
                        sodium: Number(e.target.value),
                      }))
                    }
                    min="1500"
                    max="3000"
                  />
                </div>
              </div>

              {/* Mostrar porcentajes calculados */}
              <div className=" p-3 rounded-lg">
                <div className="text-xs text-muted-foreground mb-1">
                  Distribución de macronutrientes:
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Proteína:</span>{" "}
                    {Math.round(
                      ((adjustableGoals.protein * 4) /
                        adjustableGoals.dailyCalories) *
                        100
                    )}
                    %
                  </div>
                  <div>
                    <span className="font-medium">Carbos:</span>{" "}
                    {Math.round(
                      ((adjustableGoals.carbs * 4) /
                        adjustableGoals.dailyCalories) *
                        100
                    )}
                    %
                  </div>
                  <div>
                    <span className="font-medium">Grasas:</span>{" "}
                    {Math.round(
                      ((adjustableGoals.fat * 9) /
                        adjustableGoals.dailyCalories) *
                        100
                    )}
                    %
                  </div>
                </div>
              </div>
            </div>

            {/* Datos personales */}
            <div className="space-y-4">
              <h3 className="font-semibold">📊 Datos Personales</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium">
                    Altura (cm)
                  </label>
                  <Input
                    name="height"
                    type="number"
                    min="120"
                    max="250"
                    defaultValue={
                      fullData?.measurements.height ||
                      preferences?.height ||
                      170
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium">
                    Peso actual (kg)
                  </label>
                  <Input
                    name="weight"
                    type="number"
                    min="30"
                    max="200"
                    defaultValue={
                      fullData?.measurements.weight ||
                      preferences?.currentWeight ||
                      70
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium">
                    Peso objetivo (kg)
                  </label>
                  <Input
                    name="targetWeight"
                    type="number"
                    min="30"
                    max="200"
                    defaultValue={preferences?.targetWeight || 65}
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium">Edad</label>
                  <Input
                    name="age"
                    type="number"
                    min="15"
                    max="100"
                    defaultValue={
                      fullData?.measurements.age || preferences?.age || 25
                    }
                    required
                  />
                </div>
              </div>

              {/* Género y actividad */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-xs font-medium">
                    Género
                  </label>
                  <select
                    name="gender"
                    defaultValue={
                      fullData?.measurements.gender ||
                      preferences?.gender ||
                      "male"
                    }
                    className="w-full p-2 border rounded-md bg-gray-100/50"
                    required
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-xs font-medium">
                    Nivel de actividad
                  </label>
                  <select
                    name="activityLevel"
                    defaultValue={
                      fullData?.measurements.activityLevel || "moderate"
                    }
                    className="w-full p-2 border rounded-md bg-background"
                    required
                  >
                    <option value="sedentary">Sedentario</option>
                    <option value="light">Ligero</option>
                    <option value="moderate">Moderado</option>
                    <option value="active">Activo</option>
                    <option value="very_active">Muy activo</option>
                  </select>
                </div>
              </div>

              {/* Objetivo principal */}
              <div>
                <label className="block mb-1 text-xs font-medium">
                  Objetivo principal
                </label>
                <select
                  name="goal"
                  defaultValue={
                    fullData?.measurements.goals?.[0] || "lose_weight"
                  }
                  className="w-full p-2 border rounded-md bg-background"
                  required
                >
                  <option value="lose_weight">Perder peso</option>
                  <option value="gain_muscle">Ganar músculo</option>
                  <option value="define">Definir/Tonificar</option>
                  <option value="maintain">Mantener peso</option>
                  <option value="bulk">Volumen</option>
                  <option value="recomp">Recomposición</option>
                </select>
              </div>
            </div>

            {/* Preview del payload (para desarrollo) */}
            {/*
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPayloadPreview(!showPayloadPreview)}
              >
                {showPayloadPreview ? "Ocultar" : "Mostrar"} Preview del Payload
              </Button>

              {showPayloadPreview && (
                <div className="bg-gray-100/50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">
                    Datos que se enviarán al endpoint:
                  </h4>
                  <pre className="text-xs overflow-auto max-h-40">
                    {JSON.stringify(
                      prepareNutritionGoalsPayload(new FormData()),
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>
            */}

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Establecer Objetivos
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
