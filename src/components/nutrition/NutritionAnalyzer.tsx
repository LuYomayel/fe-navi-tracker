"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  BarChart3,
  Loader2,
  Check,
  Calculator,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MealType,
  DetectedFood,
  Macronutrients,
  FoodCategory as _FoodCategory,
} from "@/types";
import { useNaviTrackerStore } from "@/store";
import { api } from "@/lib/api-client";
import { getDateKey } from "@/lib/utils";
import { toast } from "@/lib/toast-helper";

interface FoodAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onAnalysisSaved?: () => void;
}

interface AnalysisResult {
  foods: DetectedFood[];
  totalCalories: number;
  macronutrients: Macronutrients;
  confidence: number;
  mealType: MealType;
  recommendations: string[];
}

type AnalysisMethod = "photo" | "manual";

export function FoodAnalyzer({
  isOpen,
  onClose,
  selectedDate,
  onAnalysisSaved,
}: FoodAnalyzerProps) {
  const [step, setStep] = useState<
    | "method_selection"
    | "capture"
    | "manual_input"
    | "selecting"
    | "analyzing"
    | "results"
    | "adjustment"
  >("method_selection");

  const [analysisMethod, setAnalysisMethod] = useState<AnalysisMethod>("photo");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [manualData, setManualData] = useState({
    ingredients: "",
    servings: 1,
  });

  const [selectedMealType, setSelectedMealType] = useState<MealType>(
    MealType.LUNCH
  );
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [, setIsAnalyzing] = useState(false);

  // Estados para ajustes finales
  const [adjustmentPercentage, setAdjustmentPercentage] = useState<number>(0);
  const [editableResult, setEditableResult] = useState<AnalysisResult | null>(
    null
  );

  // Limpiar localStorage viejo al abrir el componente
  useEffect(() => {
    if (isOpen) {
      try {
        localStorage.removeItem("nutritionAnalyses");
        console.log("🧹 localStorage de análisis nutricionales limpiado");
      } catch {
        console.log("No hay datos viejos para limpiar");
      }
    }
  }, [isOpen]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleMethodSelection = (method: AnalysisMethod) => {
    setAnalysisMethod(method);
    switch (method) {
      case "photo":
        setStep("capture");
        break;
      case "manual":
        setStep("manual_input");
        break;
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setStep("selecting");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleManualInput = async () => {
    if (!manualData.ingredients.trim()) {
      toast.error("Error", "Por favor describe los ingredientes de tu comida");
      return;
    }

    setIsAnalyzing(true);
    setStep("analyzing");

    try {
      // 🚀 Llamar a la nueva API de análisis manual con ingredientes
      const analysisData = await api.analyzeFood.analyzeManualFood({
        ingredients: manualData.ingredients,
        servings: manualData.servings,
        mealType: selectedMealType,
      });

      console.log("🔍 Resultado de análisis manual con IA:", analysisData);

      const result: AnalysisResult = {
        foods: (analysisData.data as AnalysisResult).foods || [],
        totalCalories: (analysisData.data as AnalysisResult).totalCalories || 0,
        macronutrients: (analysisData.data as AnalysisResult)
          .macronutrients || {
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
        },
        confidence: (analysisData.data as AnalysisResult).confidence || 0.8,
        mealType: selectedMealType,
        recommendations: (analysisData.data as AnalysisResult)
          .recommendations || [
          "Análisis basado en descripción de ingredientes",
          "Los valores son estimaciones basadas en IA",
        ],
      };

      setAnalysisResult(result);
      setEditableResult({ ...result });
      setStep("results");
    } catch (error) {
      console.error("❌ Error analyzing manual ingredients:", error);
      toast.error(
        "Error",
        "No se pudo analizar los ingredientes. Inténtalo de nuevo."
      );
      setStep("selecting");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setStep("analyzing");

    // 🚀 Llamar a la API real de análisis de comida
    try {
      const analysisData = await api.analyzeFood.analyzeImage({
        image: selectedImage,
        mealType: selectedMealType,
      });

      const result: AnalysisResult = {
        foods: (analysisData.data as AnalysisResult).foods || [],
        totalCalories: (analysisData.data as AnalysisResult).totalCalories || 0,
        macronutrients: (analysisData.data as AnalysisResult)
          .macronutrients || {
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
        },
        confidence: (analysisData.data as AnalysisResult).confidence || 0.5,
        mealType: selectedMealType,
        recommendations:
          (analysisData.data as AnalysisResult).recommendations || [],
      };

      setAnalysisResult(result);
      setEditableResult({ ...result });
      setStep("results");
    } catch (error) {
      console.error("❌ Error analyzing image:", error);

      // Mostrar mensaje de error
      toast.error(
        "Error",
        "No se pudo analizar la imagen. Inténtalo de nuevo."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProceedToAdjustment = () => {
    setStep("adjustment");
  };

  const applyPercentageAdjustment = () => {
    if (!editableResult || adjustmentPercentage === 0) return;

    const factor = 1 + adjustmentPercentage / 100;

    const adjustedResult = {
      ...editableResult,
      totalCalories: Math.round(editableResult.totalCalories * factor),
      macronutrients: {
        protein:
          Math.round(editableResult.macronutrients.protein * factor * 10) / 10,
        carbs:
          Math.round(editableResult.macronutrients.carbs * factor * 10) / 10,
        fat: Math.round(editableResult.macronutrients.fat * factor * 10) / 10,
        fiber:
          Math.round(editableResult.macronutrients.fiber * factor * 10) / 10,
        sugar:
          Math.round(editableResult.macronutrients.sugar * factor * 10) / 10,
        sodium: Math.round(editableResult.macronutrients.sodium * factor),
      },
      foods: editableResult.foods.map((food) => ({
        ...food,
        calories: Math.round(food.calories * factor),
        macronutrients: {
          protein: Math.round(food.macronutrients.protein * factor * 10) / 10,
          carbs: Math.round(food.macronutrients.carbs * factor * 10) / 10,
          fat: Math.round(food.macronutrients.fat * factor * 10) / 10,
          fiber: Math.round(food.macronutrients.fiber * factor * 10) / 10,
          sugar: Math.round(food.macronutrients.sugar * factor * 10) / 10,
          sodium: Math.round(food.macronutrients.sodium * factor),
        },
      })),
    };

    setEditableResult(adjustedResult);
    setAdjustmentPercentage(0);
    toast.success("✅ Ajuste aplicado correctamente");
  };

  const handleSave = async () => {
    const resultToSave = editableResult || analysisResult;
    if (!resultToSave) return;

    try {
      // Esto es lo que tengo que enviar a la API

      // Guardar en base de datos
      const apiResponse = await api.nutrition.createAnalysis({
        id: "default",
        userId: "default",
        date: getDateKey(selectedDate),
        mealType: resultToSave.mealType,
        foods: resultToSave.foods,
        totalCalories: resultToSave.totalCalories,
        macronutrients: resultToSave.macronutrients,
        imageUrl: analysisMethod === "photo" ? "" : "", // No guardamos la imagen para evitar QuotaExceededError
        aiConfidence: resultToSave.confidence,
        userAdjustments: {
          adjustedCalories: resultToSave.totalCalories,
          adjustedFoods: resultToSave.foods,
          notes: `Ajuste aplicado: ${adjustmentPercentage}%`,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("🔍 API Response:", apiResponse);

      // Usar el store de Zustand que tiene integración con base de datos
      const store = useNaviTrackerStore.getState();

      const analysis = {
        userId: "default",
        date: getDateKey(selectedDate),
        mealType: resultToSave.mealType,
        foods: resultToSave.foods,
        totalCalories: resultToSave.totalCalories,
        macronutrients: resultToSave.macronutrients,
        imageUrl: analysisMethod === "photo" ? "" : "", // No guardamos la imagen para evitar QuotaExceededError
        aiConfidence: resultToSave.confidence,
        userAdjustments: {
          adjustedCalories: resultToSave.totalCalories,
          adjustedFoods: resultToSave.foods,
          notes: `Ajuste aplicado: ${adjustmentPercentage}%`,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Usar el store que ya tiene integración con base de datos
      await store.addNutritionAnalysis(analysis);

      console.log("✅ Análisis nutricional guardado:", analysis);
      toast.success("✅ Análisis nutricional guardado correctamente");

      // Reset component
      handleReset();
      onClose();

      if (onAnalysisSaved) {
        onAnalysisSaved();
      }
    } catch (error) {
      console.error("❌ Error guardando análisis nutricional:", error);

      // Fallback: guardar solo los datos esenciales en localStorage (sin imagen)
      try {
        const analysisLight = {
          id: `nutrition_${Date.now()}`,
          date: getDateKey(selectedDate),
          mealType: resultToSave.mealType,
          totalCalories: resultToSave.totalCalories,
          confidence: resultToSave.confidence,
          timestamp: new Date().toISOString(),
        };

        const existingAnalyses = JSON.parse(
          localStorage.getItem("nutritionAnalysesLight") || "[]"
        );

        // Mantener solo los últimos 10 análisis para evitar problemas de espacio
        if (existingAnalyses.length >= 10) {
          existingAnalyses.shift();
        }

        existingAnalyses.push(analysisLight);
        localStorage.setItem(
          "nutritionAnalysesLight",
          JSON.stringify(existingAnalyses)
        );

        console.log("✅ Análisis guardado en localStorage (versión ligera)");
        toast.success("✅ Análisis nutricional guardado correctamente");

        // Reset component
        handleReset();
        onClose();

        if (onAnalysisSaved) {
          onAnalysisSaved();
        }
      } catch (localStorageError) {
        console.error("❌ Error guardando en localStorage:", localStorageError);
        toast.error(
          "❌ Error al guardar el análisis. Intenta limpiar el almacenamiento del navegador."
        );
      }
    }
  };

  const handleReset = () => {
    setStep("method_selection");
    setAnalysisMethod("photo");
    setSelectedImage("");
    setManualData({
      ingredients: "",
      servings: 1,
    });
    setAnalysisResult(null);
    setEditableResult(null);
    setAdjustmentPercentage(0);
    setIsAnalyzing(false);
  };

  const mealTypeOptions = [
    { value: MealType.BREAKFAST, label: "Desayuno", emoji: "🌅" },
    { value: MealType.LUNCH, label: "Almuerzo", emoji: "☀️" },
    { value: MealType.DINNER, label: "Cena", emoji: "🌙" },
    { value: MealType.SNACK, label: "Snack", emoji: "🍎" },
    { value: MealType.OTHER, label: "Otro", emoji: "🍽️" },
  ];

  const getMacroPercentage = (
    macro: number,
    totalCalories: number,
    caloriesPerGram: number
  ) => {
    return Math.round(((macro * caloriesPerGram) / totalCalories) * 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análisis Nutricional - {selectedDate.toLocaleDateString("es-ES")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === "method_selection" && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  ¿Cómo quieres analizar tu comida?
                </h3>
                <p className="text-muted-foreground">
                  Elige el método que mejor se adapte a tu situación
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={() => handleMethodSelection("photo")}
                  className="flex items-center gap-3 p-6 h-auto justify-start"
                  variant="outline"
                >
                  <Camera className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">Tomar/Subir foto</div>
                    <div className="text-sm text-muted-foreground">
                      Analiza platos de comida o recetas escritas con IA
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => handleMethodSelection("manual")}
                  className="flex items-center gap-3 p-6 h-auto justify-start"
                  variant="outline"
                >
                  <Calculator className="h-6 w-6" />
                  <div className="text-left">
                    <div className="font-medium">Ingreso manual</div>
                    <div className="text-sm text-muted-foreground">
                      Escribe los valores nutricionales directamente
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          )}

          {step === "manual_input" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Ingresa los datos manualmente
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        Análisis con IA
                      </h4>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Describe los ingredientes de tu comida y la IA calculará
                      automáticamente las calorías y macronutrientes. Sé
                      específico con las cantidades cuando sea posible.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="ingredients">
                        Ingredientes y descripción
                      </Label>
                      <Textarea
                        id="ingredients"
                        placeholder="Ej: 150g de pechuga de pollo a la plancha, 100g de arroz integral cocido, 1 cucharada de aceite de oliva, ensalada mixta con tomate y pepino"
                        value={manualData.ingredients}
                        onChange={(e) =>
                          setManualData((prev) => ({
                            ...prev,
                            ingredients: e.target.value,
                          }))
                        }
                        rows={4}
                        className="resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Incluye cantidades (gramos, tazas, unidades) y
                        métodos de cocción para mayor precisión
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="servings">Número de porciones</Label>
                        <Input
                          id="servings"
                          type="number"
                          min="1"
                          value={manualData.servings}
                          onChange={(e) =>
                            setManualData((prev) => ({
                              ...prev,
                              servings: parseInt(e.target.value) || 1,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="mealType">Tipo de comida</Label>
                        <select
                          id="mealType"
                          value={selectedMealType}
                          onChange={(e) =>
                            setSelectedMealType(e.target.value as MealType)
                          }
                          className="w-full p-2 border rounded-lg bg-background"
                        >
                          {mealTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.emoji} {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <h5 className="font-medium mb-2 text-sm">
                        Ejemplos de descripciones:
                      </h5>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <li>
                          • &quot;200g salmón al horno, 150g quinoa, brócoli al
                          vapor&quot;
                        </li>
                        <li>
                          • &quot;1 taza de pasta con salsa de tomate, queso
                          parmesano&quot;
                        </li>
                        <li>
                          • &quot;Ensalada césar con pollo, crutones,
                          aderezo&quot;
                        </li>
                        <li>
                          • &quot;Tacos de carne (3 tortillas, 120g carne,
                          guacamole)&quot;
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Volver
                </Button>
                <Button onClick={handleManualInput} className="flex-1">
                  Continuar con análisis
                </Button>
              </div>
            </div>
          )}

          {step === "selecting" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Confirma los detalles
                </h3>
                <div className="space-y-4">
                  <img
                    src={selectedImage}
                    alt="Comida seleccionada"
                    className="w-full max-w-md mx-auto rounded-lg border"
                  />

                  <div>
                    <Label htmlFor="mealType">Tipo de comida</Label>
                    <select
                      id="mealType"
                      value={selectedMealType}
                      onChange={(e) =>
                        setSelectedMealType(e.target.value as MealType)
                      }
                      className="w-full p-2 border rounded-lg bg-background"
                    >
                      {mealTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.emoji} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Cambiar foto
                </Button>
                <Button onClick={handleAnalyze} className="flex-1">
                  Analizar alimentos
                </Button>
              </div>
            </div>
          )}

          {step === "analyzing" && (
            <div className="text-center space-y-6 py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Analizando tu comida...
                </h3>
                <p className="text-muted-foreground">
                  Nuestro asistente IA está identificando los alimentos y
                  calculando su información nutricional.
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Esto puede tomar unos segundos
              </div>
            </div>
          )}

          {step === "results" && analysisResult && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                <span className="font-medium">¡Análisis completado!</span>
                <span className="text-sm text-muted-foreground">
                  Confianza: {Math.round(analysisResult.confidence * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedImage}
                    alt="Comida analizada"
                    className="w-full rounded-lg border"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-lg mb-2">
                      Resumen Nutricional
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Calorías totales:</span>
                        <span className="font-medium">
                          {analysisResult.totalCalories} kcal
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Proteína:</span>
                        <span className="font-medium">
                          {analysisResult.macronutrients.protein.toFixed(1)}g (
                          {getMacroPercentage(
                            analysisResult.macronutrients.protein,
                            analysisResult.totalCalories,
                            4
                          )}
                          %)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carbohidratos:</span>
                        <span className="font-medium">
                          {analysisResult.macronutrients.carbs.toFixed(1)}g (
                          {getMacroPercentage(
                            analysisResult.macronutrients.carbs,
                            analysisResult.totalCalories,
                            4
                          )}
                          %)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Grasas:</span>
                        <span className="font-medium">
                          {analysisResult.macronutrients.fat.toFixed(1)}g (
                          {getMacroPercentage(
                            analysisResult.macronutrients.fat,
                            analysisResult.totalCalories,
                            9
                          )}
                          %)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fibra:</span>
                        <span className="font-medium">
                          {analysisResult.macronutrients.fiber.toFixed(1)}g
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-lg mb-3">
                  Alimentos detectados
                </h4>
                <div className="space-y-2">
                  {analysisResult.foods.map((food, index) => (
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
                        <div className="text-xs text-gray-500">
                          {Math.round(food.confidence * 100)}% confianza
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-accent p-4 rounded-lg">
                <h4 className="font-medium text-accent-foreground mb-2">
                  💡 Información adicional
                </h4>
                <div className="text-sm text-accent-foreground space-y-1">
                  <p>
                    • Azúcares: {analysisResult.macronutrients.sugar.toFixed(1)}
                    g
                  </p>
                  <p>
                    • Sodio: {analysisResult.macronutrients.sodium.toFixed(0)}mg
                  </p>
                  <p>
                    • Este análisis es una estimación basada en reconocimiento
                    visual
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Analizar otra comida
                </Button>
                <Button onClick={handleProceedToAdjustment} className="flex-1">
                  Ajustar análisis
                </Button>
              </div>
            </div>
          )}

          {step === "adjustment" && editableResult && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Ajustar análisis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Puedes ajustar los valores si consideras que la IA se ha
                  equivocado
                </p>

                <div className="space-y-6">
                  {/* Ajuste por porcentaje */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">
                      Ajuste rápido por porcentaje
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Si el plato era más grande o más pequeño de lo estimado
                    </p>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label htmlFor="adjustmentPercentage">
                          Porcentaje de ajuste (ej: -20 para reducir un 20%)
                        </Label>
                        <Input
                          id="adjustmentPercentage"
                          type="number"
                          min="-50"
                          max="100"
                          placeholder="0"
                          value={adjustmentPercentage || ""}
                          onChange={(e) =>
                            setAdjustmentPercentage(
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                      <Button
                        onClick={applyPercentageAdjustment}
                        disabled={adjustmentPercentage === 0}
                        variant="outline"
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>

                  {/* Ajuste manual */}
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">
                      Ajuste manual de valores
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="editCalories">Calorías totales</Label>
                        <Input
                          id="editCalories"
                          type="number"
                          min="0"
                          value={editableResult.totalCalories}
                          onChange={(e) =>
                            setEditableResult((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    totalCalories:
                                      parseInt(e.target.value) || 0,
                                  }
                                : null
                            )
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="editProtein">Proteína (g)</Label>
                          <Input
                            id="editProtein"
                            type="number"
                            min="0"
                            step="0.1"
                            value={editableResult.macronutrients.protein}
                            onChange={(e) =>
                              setEditableResult((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      macronutrients: {
                                        ...prev.macronutrients,
                                        protein:
                                          parseFloat(e.target.value) || 0,
                                      },
                                    }
                                  : null
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="editCarbs">Carbohidratos (g)</Label>
                          <Input
                            id="editCarbs"
                            type="number"
                            min="0"
                            step="0.1"
                            value={editableResult.macronutrients.carbs}
                            onChange={(e) =>
                              setEditableResult((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      macronutrients: {
                                        ...prev.macronutrients,
                                        carbs: parseFloat(e.target.value) || 0,
                                      },
                                    }
                                  : null
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="editFat">Grasas (g)</Label>
                          <Input
                            id="editFat"
                            type="number"
                            min="0"
                            step="0.1"
                            value={editableResult.macronutrients.fat}
                            onChange={(e) =>
                              setEditableResult((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      macronutrients: {
                                        ...prev.macronutrients,
                                        fat: parseFloat(e.target.value) || 0,
                                      },
                                    }
                                  : null
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="editFiber">Fibra (g)</Label>
                          <Input
                            id="editFiber"
                            type="number"
                            min="0"
                            step="0.1"
                            value={editableResult.macronutrients.fiber}
                            onChange={(e) =>
                              setEditableResult((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      macronutrients: {
                                        ...prev.macronutrients,
                                        fiber: parseFloat(e.target.value) || 0,
                                      },
                                    }
                                  : null
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vista previa de los valores actuales */}
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Vista previa actual</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        Calorías:{" "}
                        <span className="font-medium">
                          {editableResult.totalCalories} kcal
                        </span>
                      </div>
                      <div>
                        Proteína:{" "}
                        <span className="font-medium">
                          {editableResult.macronutrients.protein.toFixed(1)}g
                        </span>
                      </div>
                      <div>
                        Carbohidratos:{" "}
                        <span className="font-medium">
                          {editableResult.macronutrients.carbs.toFixed(1)}g
                        </span>
                      </div>
                      <div>
                        Grasas:{" "}
                        <span className="font-medium">
                          {editableResult.macronutrients.fat.toFixed(1)}g
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("results")}
                  className="flex-1"
                >
                  Volver a resultados
                </Button>
                <Button onClick={handleSave} className="flex-1">
                  Guardar análisis final
                </Button>
              </div>
            </div>
          )}

          {step === "capture" && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Sube una foto de tu comida o receta
                </h3>
                <p className="text-muted-foreground">
                  Nuestro asistente IA puede analizar tanto platos de comida
                  como recetas escritas, calculando las calorías y
                  macronutrientes automáticamente.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleCameraCapture}
                  className="flex flex-col items-center gap-3 p-8 h-auto"
                  variant="outline"
                >
                  <Camera className="h-8 w-8" />
                  <span>Tomar foto</span>
                </Button>

                <Button
                  onClick={handleFileSelect}
                  className="flex flex-col items-center gap-3 p-8 h-auto"
                  variant="outline"
                >
                  <Upload className="h-8 w-8" />
                  <span>Subir imagen</span>
                </Button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Asegúrate de que la imagen esté bien iluminada</p>
                <p>• Para platos: incluye todos los alimentos visibles</p>
                <p>• Para recetas: que el texto sea legible y completo</p>
                <p>• La foto debe ser clara y enfocada</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}

          {step === "selecting" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">
                  Confirma los detalles
                </h3>
                <div className="space-y-4">
                  <img
                    src={selectedImage}
                    alt="Comida seleccionada"
                    className="w-full max-w-md mx-auto rounded-lg border"
                  />

                  <div>
                    <Label htmlFor="mealType">Tipo de comida</Label>
                    <select
                      id="mealType"
                      value={selectedMealType}
                      onChange={(e) =>
                        setSelectedMealType(e.target.value as MealType)
                      }
                      className="w-full p-2 border rounded-lg bg-background"
                    >
                      {mealTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.emoji} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  Cambiar foto
                </Button>
                <Button onClick={handleAnalyze} className="flex-1">
                  Analizar alimentos
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
