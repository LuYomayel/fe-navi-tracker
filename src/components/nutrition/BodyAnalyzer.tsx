"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  User,
  Loader2,
  Check,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BodyType, ActivityLevel, BodyAnalysisApiResponse } from "@/types";
import { useNaviTrackerStore } from "@/store";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "@/lib/toast-helper";
import { api } from "@/lib/api-client";

interface BodyAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Opciones de objetivos fitness
const FITNESS_GOALS = [
  {
    value: "lose_weight",
    label: "Perder peso",
    description: "Reducir grasa corporal manteniendo músculo",
  },
  {
    value: "gain_muscle",
    label: "Ganar masa muscular",
    description: "Aumentar músculo con mínima ganancia de grasa",
  },
  {
    value: "define",
    label: "Definir/Tonificar",
    description: "Reducir grasa y definir músculos existentes",
  },
  {
    value: "maintain",
    label: "Mantener peso",
    description: "Mantener composición corporal actual",
  },
  {
    value: "bulk",
    label: "Volumen",
    description: "Ganar peso y músculo rápidamente",
  },
  {
    value: "recomp",
    label: "Recomposición",
    description: "Ganar músculo y perder grasa simultáneamente",
  },
];

export function BodyAnalyzer({ isOpen, onClose }: BodyAnalyzerProps) {
  const [step, setStep] = useState<"form" | "processing" | "results">("form");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  //const [analysisResult, setAnalysisResult] = useState<BodyAnalysisResult | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<BodyAnalysisApiResponse | null>(null);
  const [, setIsAnalyzing] = useState(false);

  // Datos del formulario
  const [formData, setFormData] = useState({
    height: 170,
    weight: 70,
    age: 25,
    gender: "male" as "male" | "female" | "other",
    activityLevel: ActivityLevel.MODERATE,
    fitnessGoal: "gain_muscle",
    targetWeight: 75,
  });

  // Limpiar localStorage viejo al abrir el componente
  useEffect(() => {
    if (isOpen) {
      try {
        localStorage.removeItem("bodyAnalyses");
        console.log("🧹 localStorage limpiado de datos pesados");
      } catch {
        console.log("No hay datos viejos para limpiar");
      }
    }
  }, [isOpen]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          newImages.push(result);
          if (newImages.length === files.length) {
            setSelectedImages((prev) => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (selectedImages.length === 0) {
      toast.error(
        "Error",
        "Por favor, sube al menos una foto para el análisis"
      );
      return;
    }

    setIsAnalyzing(true);
    setStep("processing");

    try {
      // 🚀 Usar la API centralizada para análisis corporal
      const analysisData = await api.bodyAnalysis.create({
        image: selectedImages[0],
        currentWeight: formData.weight,
        targetWeight: formData.targetWeight,
        height: formData.height,
        age: formData.age,
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        goals: [formData.fitnessGoal],
      });

      console.log("✅ Análisis corporal recibido:", analysisData);

      // Convertir la respuesta de la API al formato esperado
      const apiResponse = analysisData.data as BodyAnalysisApiResponse;
      const result: BodyAnalysisApiResponse = {
        bodyType: apiResponse.bodyType || BodyType.MESOMORPH,
        bodyComposition: {
          estimatedBMI: apiResponse.bodyComposition?.estimatedBMI,
          bodyType: apiResponse.bodyType || BodyType.MESOMORPH,
          muscleMass: apiResponse.bodyComposition?.muscleMass || "medium",
          bodyFat: apiResponse.bodyComposition?.bodyFat || "medium",
          metabolism: apiResponse.bodyComposition?.metabolism || "medium",
          boneDensity: apiResponse.bodyComposition?.boneDensity || "medium",
          muscleGroups: apiResponse.bodyComposition?.muscleGroups || [],
        },
        measurements: {
          height: formData.height,
          weight: formData.weight,
          age: formData.age,
          gender: formData.gender,
          activityLevel: formData.activityLevel,
          waist: apiResponse.measurements?.waist,
          chest: apiResponse.measurements?.chest,
          hips: apiResponse.measurements?.hips,
          bodyFatPercentage: apiResponse.measurements?.bodyFatPercentage,
          muscleDefinition: apiResponse.measurements?.muscleDefinition || "low",
          posture: apiResponse.measurements?.posture || "needs_attention",
          symmetry: apiResponse.measurements?.symmetry || "needs_attention",
          overallFitness:
            apiResponse.measurements?.overallFitness || "beginner",
        },
        recommendations: {
          nutrition: apiResponse.recommendations?.nutrition || [],
          priority: apiResponse.recommendations?.priority || "general_fitness",
          dailyCalories: apiResponse.recommendations?.dailyCalories || 2200,
          macroSplit: apiResponse.recommendations?.macroSplit || {
            protein: 30,
            carbs: 40,
            fat: 30,
          },
          supplements: apiResponse.recommendations?.supplements || [],
          goals: apiResponse.recommendations?.goals || [],
        },
        progress: {
          strengths: apiResponse.progress?.strengths || [],
          areasToImprove: apiResponse.progress?.areasToImprove || [],
          generalAdvice: apiResponse.progress?.generalAdvice || "",
        },
        confidence: apiResponse.confidence || 0.8,
        disclaimer: apiResponse.disclaimer || "",
        insights: apiResponse.insights || ["Análisis completado exitosamente"],
      };

      // Validar que el bodyType sea válido
      if (!Object.values(BodyType).includes(result.bodyType)) {
        result.bodyType = BodyType.MESOMORPH;
      }

      setAnalysisResult(result);
      setStep("results");
    } catch (error) {
      console.error("❌ Error analyzing body images:", error);
      toast.error(
        "Error en análisis",
        "Error en el análisis. Por favor, intenta de nuevo."
      );
      setStep("form");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!analysisResult) return;

    try {
      // Crear el análisis con el formato correcto para el store
      const analysis = {
        bodyType: analysisResult.bodyType,
        measurements: {
          bodyFat: analysisResult.measurements.bodyFatPercentage,
          muscleMass: analysisResult.measurements.weight,
          bmi:
            analysisResult.measurements.weight &&
            analysisResult.measurements.height
              ? analysisResult.measurements.weight /
                Math.pow(analysisResult.measurements.height / 100, 2)
              : undefined,
        },
        recommendations: analysisResult.insights,
        confidence: analysisResult.confidence,
      };

      // Usar el store de Zustand que tiene integración con base de datos
      const { addBodyAnalysis } = useNaviTrackerStore.getState();
      await addBodyAnalysis(analysis);

      console.log("✅ Análisis corporal guardado:", analysis);
      alert("✅ Análisis corporal guardado correctamente");

      onClose();
    } catch (error) {
      console.error("❌ Error guardando análisis corporal:", error);

      // Fallback: guardar solo los datos esenciales en localStorage (sin imágenes)
      try {
        const analysisLight = {
          id: `body_${Date.now()}`,
          bodyType: analysisResult.bodyType,
          confidence: analysisResult.confidence,
          date: new Date().toISOString().split("T")[0],
          fitnessGoal: formData.fitnessGoal,
        };

        const existingAnalyses = JSON.parse(
          localStorage.getItem("bodyAnalysesLight") || "[]"
        );

        if (existingAnalyses.length >= 10) {
          existingAnalyses.shift();
        }

        existingAnalyses.push(analysisLight);
        localStorage.setItem(
          "bodyAnalysesLight",
          JSON.stringify(existingAnalyses)
        );

        console.log("✅ Análisis guardado en localStorage (versión ligera)");
        alert("✅ Análisis corporal guardado correctamente");

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
    setStep("form");
    setSelectedImages([]);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  const getBodyTypeDescription = (bodyType: BodyType) => {
    switch (bodyType) {
      case BodyType.ECTOMORPH:
        return {
          name: "Ectomorfo",
          description:
            "Delgado, metabolismo rápido, dificultad para ganar peso",
          emoji: "🏃‍♂️",
        };
      case BodyType.MESOMORPH:
        return {
          name: "Mesomorfo",
          description:
            "Atlético, gana músculo fácilmente, metabolismo equilibrado",
          emoji: "💪",
        };
      case BodyType.ENDOMORPH:
        return {
          name: "Endomorfo",
          description:
            "Tendencia a acumular grasa, metabolismo lento, gana peso fácilmente",
          emoji: "🏋️‍♂️",
        };
    }
  };

  const selectedGoal = FITNESS_GOALS.find(
    (goal) => goal.value === formData.fitnessGoal
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Análisis Corporal Completo con IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === "form" && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium">
                  Análisis Corporal Personalizado
                </h3>
                <p className="text-muted-foreground">
                  Completa tus datos y sube fotos para recibir un análisis
                  detallado con recomendaciones nutricionales personalizadas
                  según tu objetivo.
                </p>
              </div>

              {/* Formulario de datos personales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">📊 Datos Personales</h4>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="height">Altura (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            height: parseInt(e.target.value),
                          })
                        }
                        min="120"
                        max="250"
                      />
                    </div>

                    <div>
                      <Label htmlFor="weight">Peso Actual (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            weight: parseInt(e.target.value),
                          })
                        }
                        min="30"
                        max="200"
                      />
                    </div>

                    <div>
                      <Label htmlFor="targetWeight">Peso Objetivo (kg)</Label>
                      <Input
                        id="targetWeight"
                        type="number"
                        value={formData.targetWeight}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            targetWeight: parseInt(e.target.value),
                          })
                        }
                        min="30"
                        max="200"
                      />
                    </div>

                    <div>
                      <Label htmlFor="age">Edad</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            age: parseInt(e.target.value),
                          })
                        }
                        min="15"
                        max="100"
                      />
                    </div>

                    <div>
                      <Label htmlFor="gender">Género</Label>
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setFormData({
                            ...formData,
                            gender: e.target.value as
                              | "male"
                              | "female"
                              | "other",
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="activityLevel">Nivel de Actividad</Label>
                      <select
                        id="activityLevel"
                        value={formData.activityLevel}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          setFormData({
                            ...formData,
                            activityLevel: e.target.value as ActivityLevel,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-md bg-background"
                      >
                        <option value={ActivityLevel.SEDENTARY}>
                          Sedentario (poco o ningún ejercicio)
                        </option>
                        <option value={ActivityLevel.LIGHT}>
                          Ligero (1-3 días/semana)
                        </option>
                        <option value={ActivityLevel.MODERATE}>
                          Moderado (3-5 días/semana)
                        </option>
                        <option value={ActivityLevel.ACTIVE}>
                          Activo (6-7 días/semana)
                        </option>
                        <option value={ActivityLevel.VERY_ACTIVE}>
                          Muy Activo (ejercicio intenso diario)
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">🎯 Objetivo Fitness</h4>

                  <div className="space-y-2">
                    {FITNESS_GOALS.map((goal) => (
                      <label
                        key={goal.value}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.fitnessGoal === goal.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <input
                          type="radio"
                          name="fitnessGoal"
                          value={goal.value}
                          checked={formData.fitnessGoal === goal.value}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              fitnessGoal: e.target.value,
                            })
                          }
                          className="mt-1 mr-3"
                        />
                        <div>
                          <div className="font-medium text-sm">
                            {goal.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {goal.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sección de fotos */}
              <div className="space-y-4">
                <h4 className="font-medium">📸 Fotos para Análisis</h4>
                <p className="text-sm">
                  Sube fotos tuyas (frente, perfil, espalda) para un análisis
                  preciso. Recomendamos fotos con buena iluminación y ropa
                  ajustada.
                </p>

                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    {selectedImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={handleCameraCapture}
                    variant="outline"
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Tomar Foto
                  </Button>
                  <Button
                    onClick={handleFileSelect}
                    variant="outline"
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Fotos
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
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

              {/* Resumen y botón de análisis */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-3">📋 Resumen del Análisis</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Objetivo:</span>
                    <br />
                    <span className="font-medium">{selectedGoal?.label}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IMC Actual:</span>
                    <br />
                    <span className="font-medium">
                      {(
                        formData.weight / Math.pow(formData.height / 100, 2)
                      ).toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fotos:</span>
                    <br />
                    <span className="font-medium">
                      {selectedImages.length} imagen(es)
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Actividad:</span>
                    <br />
                    <span className="font-medium">
                      {formData.activityLevel === ActivityLevel.SEDENTARY &&
                        "Sedentario"}
                      {formData.activityLevel === ActivityLevel.LIGHT &&
                        "Ligero"}
                      {formData.activityLevel === ActivityLevel.MODERATE &&
                        "Moderado"}
                      {formData.activityLevel === ActivityLevel.ACTIVE &&
                        "Activo"}
                      {formData.activityLevel === ActivityLevel.VERY_ACTIVE &&
                        "Muy Activo"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={onClose} variant="outline" className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={selectedImages.length === 0}
                  className="flex-1"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analizar con IA
                </Button>
              </div>
            </div>
          )}

          {step === "processing" && (
            <div className="text-center space-y-6 py-12">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  Analizando tu composición corporal...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Nuestro sistema de IA está procesando tus fotos y datos para
                  crear un análisis personalizado. Esto puede tomar unos
                  momentos.
                </p>
              </div>
              <div className="space-y-2 text-sm text-gray-500">
                <div>🔍 Analizando composición corporal...</div>
                <div>📊 Calculando recomendaciones nutricionales...</div>
                <div>🎯 Personalizando según tu objetivo...</div>
              </div>
            </div>
          )}

          {step === "results" && analysisResult && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-medium">Análisis Completado</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Confianza del análisis:{" "}
                  {Math.round(analysisResult.confidence * 100)}%
                </p>
              </div>

              {/* Tipo corporal */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  {analysisResult.bodyType &&
                    getBodyTypeDescription(analysisResult.bodyType).emoji}
                  <h4 className="text-lg font-semibold">
                    Tipo Corporal:{" "}
                    {analysisResult.bodyType &&
                      getBodyTypeDescription(analysisResult.bodyType).name}
                  </h4>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {analysisResult.bodyType &&
                    getBodyTypeDescription(analysisResult.bodyType).description}
                </p>
              </div>

              {/* Recomendaciones nutricionales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    🍽️ Plan Nutricional
                  </h4>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {analysisResult.recommendations.dailyCalories} kcal/día
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400">
                      Calorías recomendadas para tu objetivo
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Proteína:</span>
                      <span className="font-medium">
                        {analysisResult.recommendations.macroSplit?.protein}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Carbohidratos:</span>
                      <span className="font-medium">
                        {analysisResult.recommendations.macroSplit?.carbs}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grasas:</span>
                      <span className="font-medium">
                        {analysisResult.recommendations.macroSplit?.fat}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    📊 Composición Corporal
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Grasa corporal estimada:</span>
                      <span className="font-medium">
                        {analysisResult.measurements.bodyFatPercentage}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Masa muscular:</span>
                      <span className="font-medium capitalize">
                        {analysisResult.bodyComposition.muscleMass}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>IMC:</span>
                      <span className="font-medium">
                        {(analysisResult.measurements.weight &&
                        analysisResult.measurements.height
                          ? analysisResult.measurements.weight /
                            Math.pow(
                              analysisResult.measurements.height / 100,
                              2
                            )
                          : 0
                        ).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights del análisis */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  🔍 Análisis Detallado
                </h4>
                <div className="space-y-2">
                  {analysisResult.insights?.map((insight, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                    >
                      {insight}
                    </div>
                  ))}
                </div>
              </div>

              {/* Suplementos recomendados */}
              {analysisResult.recommendations.supplements && (
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    💊 Suplementos Sugeridos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {analysisResult.recommendations.supplements.map(
                      (supplement, index) => (
                        <div
                          key={index}
                          className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-4 border-yellow-400 text-sm"
                        >
                          {supplement}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1"
                >
                  Nuevo Análisis
                </Button>
                <Button onClick={handleSaveAnalysis} className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Guardar Análisis
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
