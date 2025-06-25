"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Upload, BarChart3, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MealType, DetectedFood, Macronutrients, FoodCategory } from "@/types";
import { useNaviTrackerStore } from "@/store";
import { apiClient } from "@/lib/api-client";
import { getDateKey } from "@/lib/utils";

interface FoodAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

interface AnalysisResult {
  foods: DetectedFood[];
  totalCalories: number;
  macronutrients: Macronutrients;
  confidence: number;
  mealType: MealType;
}

// Datos de ejemplo para la demostración
const SAMPLE_FOODS: DetectedFood[] = [
  {
    name: "Pollo a la plancha",
    quantity: "150g",
    calories: 231,
    confidence: 0.92,
    macronutrients: {
      protein: 43.5,
      carbs: 0,
      fat: 5.0,
      fiber: 0,
      sugar: 0,
      sodium: 74,
    },
    category: FoodCategory.PROTEIN,
  },
  {
    name: "Arroz integral",
    quantity: "1 taza",
    calories: 216,
    confidence: 0.88,
    macronutrients: {
      protein: 5.0,
      carbs: 45.0,
      fat: 1.8,
      fiber: 3.5,
      sugar: 0.7,
      sodium: 10,
    },
    category: FoodCategory.CARBS,
  },
  {
    name: "Brócoli al vapor",
    quantity: "1 taza",
    calories: 25,
    confidence: 0.85,
    macronutrients: {
      protein: 3.0,
      carbs: 5.0,
      fat: 0.3,
      fiber: 2.3,
      sugar: 1.5,
      sodium: 33,
    },
    category: FoodCategory.VEGETABLES,
  },
];

export function FoodAnalyzer({
  isOpen,
  onClose,
  selectedDate,
}: FoodAnalyzerProps) {
  const [step, setStep] = useState<
    "capture" | "selecting" | "analyzing" | "results"
  >("capture");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedMealType, setSelectedMealType] = useState<MealType>(
    MealType.LUNCH
  );
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [, setIsAnalyzing] = useState(false);

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

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setStep("analyzing");

    // Usar la API real de análisis de comida
    try {
      // Llamar a la API real de análisis de comida
      const analysisData = await apiClient.post("/analyze-food", {
        image: selectedImage,
        mealType: selectedMealType,
      });

      const result: AnalysisResult = {
        foods: analysisData.foods,
        totalCalories: analysisData.totalCalories,
        macronutrients: analysisData.totalMacronutrients,
        confidence: analysisData.confidence,
        mealType: analysisData.mealType,
      };

      setAnalysisResult(result);
      setStep("results");
    } catch (error) {
      console.error("Error analyzing image:", error);

      // Fallback: usar datos de ejemplo si falla la API
      const result: AnalysisResult = {
        foods: SAMPLE_FOODS,
        totalCalories: SAMPLE_FOODS.reduce(
          (sum, food) => sum + food.calories,
          0
        ),
        macronutrients: SAMPLE_FOODS.reduce(
          (total, food) => ({
            protein: total.protein + food.macronutrients.protein,
            carbs: total.carbs + food.macronutrients.carbs,
            fat: total.fat + food.macronutrients.fat,
            fiber: total.fiber + food.macronutrients.fiber,
            sugar: total.sugar + food.macronutrients.sugar,
            sodium: total.sodium + food.macronutrients.sodium,
          }),
          {
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
          }
        ),
        confidence: 0.88,
        mealType: selectedMealType,
      };

      setAnalysisResult(result);
      setStep("results");

      // Mostrar mensaje de que se usó fallback
      alert("Conexión con IA no disponible. Mostrando análisis de ejemplo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!analysisResult) return;

    try {
      // Usar el store de Zustand que tiene integración con base de datos
      const store = useNaviTrackerStore.getState();

      const analysis = {
        userId: "default",
        date: getDateKey(selectedDate),
        mealType: analysisResult.mealType,
        foods: analysisResult.foods,
        totalCalories: analysisResult.totalCalories,
        macronutrients: analysisResult.macronutrients,
        totalMacronutrients: analysisResult.macronutrients,
        imageUrl: "", // No guardamos la imagen para evitar QuotaExceededError
        confidence: analysisResult.confidence,
        aiConfidence: analysisResult.confidence,
        timestamp: new Date().toISOString(),
        recommendations: [
          "Excelente elección de alimentos balanceados",
          "Mantén esta variedad en tus comidas",
          "Considera agregar más vegetales si es posible",
        ],
      };

      // Usar el store que ya tiene integración con base de datos
      await store.addNutritionAnalysis(analysis);

      console.log("✅ Análisis nutricional guardado:", analysis);
      alert("✅ Análisis nutricional guardado correctamente");

      // Reset component
      setStep("capture");
      setSelectedImage("");
      setAnalysisResult(null);
      onClose();
    } catch (error) {
      console.error("❌ Error guardando análisis nutricional:", error);

      // Fallback: guardar solo los datos esenciales en localStorage (sin imagen)
      try {
        const analysisLight = {
          id: `nutrition_${Date.now()}`,
          date: getDateKey(selectedDate),
          mealType: analysisResult.mealType,
          totalCalories: analysisResult.totalCalories,
          confidence: analysisResult.confidence,
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
        alert("✅ Análisis nutricional guardado correctamente");

        // Reset component
        setStep("capture");
        setSelectedImage("");
        setAnalysisResult(null);
        onClose();
      } catch (localStorageError) {
        console.error("❌ Error guardando en localStorage:", localStorageError);
        alert(
          "❌ Error al guardar el análisis. Intenta limpiar el almacenamiento del navegador."
        );
      }
    }
  };

  const handleReset = () => {
    setStep("capture");
    setSelectedImage("");
    setAnalysisResult(null);
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
          {step === "capture" && (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Sube una foto de tu comida
                </h3>
                <p className="text-muted-foreground">
                  Nuestro asistente IA analizará los alimentos y calculará las
                  calorías y macronutrientes automáticamente.
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
                <p>• Asegúrate de que la comida esté bien iluminada</p>
                <p>• Incluye todos los alimentos del plato</p>
                <p>• La foto debe ser clara y de cerca</p>
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
                <Button onClick={handleSave} className="flex-1">
                  Guardar análisis
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
