"use client";

import React, { useState, useEffect } from "react";
import { Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MealType, NutritionAnalysis, Macronutrients } from "@/types";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import { useNaviTrackerStore } from "@/store";

interface EditNutritionAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: NutritionAnalysis | null;
  onAnalysisUpdated: () => void;
}

export function EditNutritionAnalysisDialog({
  isOpen,
  onClose,
  analysis,
  onAnalysisUpdated,
}: EditNutritionAnalysisDialogProps) {
  const [editableAnalysis, setEditableAnalysis] =
    useState<NutritionAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Obtener función de actualización del store
  const { updateNutritionAnalysis } = useNaviTrackerStore();

  // Opciones de tipo de comida
  const mealTypeOptions = [
    { value: MealType.BREAKFAST, label: "Desayuno", emoji: "🌅" },
    { value: MealType.LUNCH, label: "Almuerzo", emoji: "☀️" },
    { value: MealType.DINNER, label: "Cena", emoji: "🌙" },
    { value: MealType.SNACK, label: "Snack", emoji: "🍎" },
    { value: MealType.OTHER, label: "Otro", emoji: "🍽️" },
  ];

  // Cargar análisis cuando se abre el modal
  useEffect(() => {
    if (analysis && isOpen) {
      setEditableAnalysis({ ...analysis });
    } else {
      setEditableAnalysis(null);
    }
  }, [analysis, isOpen]);

  const handleMacronutrientChange = (
    macro: keyof Macronutrients,
    value: number
  ) => {
    if (!editableAnalysis) return;

    setEditableAnalysis((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        macronutrients: {
          ...prev.macronutrients,
          [macro]: value,
        },
      };
    });
  };

  const handleCaloriesChange = (calories: number) => {
    if (!editableAnalysis) return;

    setEditableAnalysis((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        totalCalories: calories,
      };
    });
  };

  const handleMealTypeChange = (mealType: MealType) => {
    if (!editableAnalysis) return;

    setEditableAnalysis((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        mealType,
      };
    });
  };

  const handleSave = async () => {
    if (!editableAnalysis) return;

    setIsLoading(true);
    try {
      // Actualizar la fecha de modificación
      const analysisToUpdate = {
        ...editableAnalysis,
        updatedAt: new Date(),
      };

      // Llamar a la API para actualizar
      const response = await api.nutrition.updateAnalysis(
        editableAnalysis.id,
        analysisToUpdate
      );

      // Actualizar también en el store local para refrescar la UI inmediatamente
      await updateNutritionAnalysis(editableAnalysis.id, {
        mealType: editableAnalysis.mealType,
        totalCalories: editableAnalysis.totalCalories,
        macronutrients: editableAnalysis.macronutrients,
        updatedAt: new Date(),
      });

      toast.success("Análisis actualizado correctamente");

      // Notificar que el análisis fue actualizado
      onAnalysisUpdated();

      // Cerrar el diálogo
      onClose();
    } catch (error) {
      console.error("Error actualizando análisis:", error);
      toast.error("Error al actualizar el análisis");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEditableAnalysis(null);
    onClose();
  };

  const getMacroPercentage = (
    macro: number,
    totalCalories: number,
    caloriesPerGram: number
  ) => {
    if (totalCalories === 0) return 0;
    return Math.round(((macro * caloriesPerGram) / totalCalories) * 100);
  };

  if (!editableAnalysis) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl sm:max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Análisis Nutricional
            <span className="text-sm text-muted-foreground font-normal">
              {new Date(editableAnalysis.date).toLocaleDateString("es-ES")}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tipo de comida */}
          <div>
            <Label htmlFor="mealType">Tipo de comida</Label>
            <select
              id="mealType"
              value={editableAnalysis.mealType}
              onChange={(e) => handleMealTypeChange(e.target.value as MealType)}
              className="w-full p-2 border rounded-lg bg-background"
            >
              {mealTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.emoji} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Información Nutricional</h3>

            <div>
              <Label htmlFor="totalCalories">Calorías totales</Label>
              <Input
                id="totalCalories"
                type="number"
                min="0"
                value={editableAnalysis.totalCalories}
                onChange={(e) =>
                  handleCaloriesChange(parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Macronutrientes (gramos)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="protein">
                    Proteína
                    <span className="text-xs text-muted-foreground ml-1">
                      (
                      {getMacroPercentage(
                        editableAnalysis.macronutrients.protein,
                        editableAnalysis.totalCalories,
                        4
                      )}
                      %)
                    </span>
                  </Label>
                  <Input
                    id="protein"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editableAnalysis.macronutrients.protein}
                    onChange={(e) =>
                      handleMacronutrientChange(
                        "protein",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="carbs">
                    Carbohidratos
                    <span className="text-xs text-muted-foreground ml-1">
                      (
                      {getMacroPercentage(
                        editableAnalysis.macronutrients.carbs,
                        editableAnalysis.totalCalories,
                        4
                      )}
                      %)
                    </span>
                  </Label>
                  <Input
                    id="carbs"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editableAnalysis.macronutrients.carbs}
                    onChange={(e) =>
                      handleMacronutrientChange(
                        "carbs",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="fat">
                    Grasas
                    <span className="text-xs text-muted-foreground ml-1">
                      (
                      {getMacroPercentage(
                        editableAnalysis.macronutrients.fat,
                        editableAnalysis.totalCalories,
                        9
                      )}
                      %)
                    </span>
                  </Label>
                  <Input
                    id="fat"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editableAnalysis.macronutrients.fat}
                    onChange={(e) =>
                      handleMacronutrientChange(
                        "fat",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="fiber">Fibra</Label>
                  <Input
                    id="fiber"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editableAnalysis.macronutrients.fiber}
                    onChange={(e) =>
                      handleMacronutrientChange(
                        "fiber",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="sugar">Azúcares</Label>
                  <Input
                    id="sugar"
                    type="number"
                    min="0"
                    step="0.1"
                    value={editableAnalysis.macronutrients.sugar}
                    onChange={(e) =>
                      handleMacronutrientChange(
                        "sugar",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="sodium">Sodio (mg)</Label>
                  <Input
                    id="sodium"
                    type="number"
                    min="0"
                    value={editableAnalysis.macronutrients.sodium}
                    onChange={(e) =>
                      handleMacronutrientChange(
                        "sodium",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Alimentos detectados */}
          {editableAnalysis.foods && editableAnalysis.foods.length > 0 && (
            <div>
              <h4 className="font-medium text-lg mb-3">Alimentos detectados</h4>
              <div className="space-y-2">
                {editableAnalysis.foods.map((food, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <span className="font-medium">{food.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({food.quantity})
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{food.calories} kcal</div>
                      {food.confidence && (
                        <div className="text-xs text-gray-500">
                          {Math.round(food.confidence * 100)}% confianza
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-accent p-4 rounded-lg">
            <h4 className="font-medium text-accent-foreground mb-2">
              💡 Información del análisis
            </h4>
            <div className="text-sm text-accent-foreground space-y-1">
              <p>
                • Confianza IA:{" "}
                {Math.round((editableAnalysis.aiConfidence || 0) * 100)}%
              </p>
              <p>
                • Creado:{" "}
                {new Date(editableAnalysis.createdAt).toLocaleString("es-ES")}
              </p>
              {editableAnalysis.updatedAt && (
                <p>
                  • Modificado:{" "}
                  {new Date(editableAnalysis.updatedAt).toLocaleString("es-ES")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
