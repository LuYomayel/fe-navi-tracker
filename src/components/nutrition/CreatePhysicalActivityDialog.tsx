"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Edit3, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { PhysicalActivity, CreatePhysicalActivityDto } from "@/types";
import { toast } from "@/hooks/use-toast";

interface CreatePhysicalActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onActivityCreated: (activity: PhysicalActivity) => void;
  date: string;
}

export function CreatePhysicalActivityDialog({
  open,
  onOpenChange,
  onActivityCreated,
  date,
}: CreatePhysicalActivityDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"image" | "manual">("manual");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Form data para entrada manual
  const [manualData, setManualData] = useState({
    steps: "",
    distanceKm: "",
    activeEnergyKcal: "",
    exerciseMinutes: "",
    standHours: "",
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;

    try {
      setIsLoading(true);

      const activityData: CreatePhysicalActivityDto = {
        date,
        screenshotUrl: selectedImage,
        source: "image",
      };

      const response = await api.physicalActivity.create(activityData);

      if (response.success) {
        onActivityCreated(response.data as PhysicalActivity);
        resetForm();

        toast({
          title: "¡Actividad registrada!",
          description:
            "Tu actividad física se analizó y registró correctamente",
        });
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Error",
        description:
          "No se pudo analizar la imagen. Intenta con entrada manual.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    try {
      setIsLoading(true);

      const activityData: CreatePhysicalActivityDto = {
        date,
        steps: manualData.steps ? parseInt(manualData.steps) : undefined,
        distanceKm: manualData.distanceKm
          ? parseFloat(manualData.distanceKm)
          : undefined,
        activeEnergyKcal: manualData.activeEnergyKcal
          ? parseInt(manualData.activeEnergyKcal)
          : undefined,
        exerciseMinutes: manualData.exerciseMinutes
          ? parseInt(manualData.exerciseMinutes)
          : undefined,
        standHours: manualData.standHours
          ? parseInt(manualData.standHours)
          : undefined,
        source: "manual",
      };

      const response = await api.physicalActivity.create(activityData);

      if (response.success) {
        onActivityCreated(response.data as PhysicalActivity);
        resetForm();
        toast({
          title: "¡Actividad registrada!",
          description: "Tu actividad física se registró correctamente",
        });
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error creating manual activity:", error);
      toast({
        title: "Error",
        description: "No se pudo registrar la actividad",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setManualData({
      steps: "",
      distanceKm: "",
      activeEnergyKcal: "",
      exerciseMinutes: "",
      standHours: "",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setManualData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Actividad Física</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selector de modo */}
          <div className="flex gap-2">
            <Button
              variant={mode === "manual" ? "default" : "outline"}
              onClick={() => setMode("manual")}
              className="flex-1"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Entrada Manual
            </Button>
            <Button
              variant={mode === "image" ? "default" : "outline"}
              onClick={() => setMode("image")}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Imagen
            </Button>
          </div>

          {mode === "image" && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Sube una captura de pantalla de tu app de fitness (Strava,
                    Nike Run Club, etc.)
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {selectedImage ? (
                      <div className="space-y-4">
                        <img
                          src={selectedImage}
                          alt="Actividad física"
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <Button
                          onClick={handleAnalyzeImage}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Analizando...
                            </>
                          ) : (
                            "Analizar con IA"
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 mx-auto text-gray-400" />
                        <div>
                          <Label
                            htmlFor="image-upload"
                            className="cursor-pointer"
                          >
                            <Button variant="outline" asChild>
                              <span>Seleccionar imagen</span>
                            </Button>
                          </Label>
                          <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {mode === "manual" && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="steps">Pasos</Label>
                    <Input
                      id="steps"
                      type="number"
                      placeholder="10000"
                      value={manualData.steps}
                      onChange={(e) =>
                        handleInputChange("steps", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distance">Distancia (km)</Label>
                    <Input
                      id="distance"
                      type="number"
                      step="0.1"
                      placeholder="5.2"
                      value={manualData.distanceKm}
                      onChange={(e) =>
                        handleInputChange("distanceKm", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calories">Calorías Activas (kcal)</Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="300"
                      value={manualData.activeEnergyKcal}
                      onChange={(e) =>
                        handleInputChange("activeEnergyKcal", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exercise">Minutos de Ejercicio</Label>
                    <Input
                      id="exercise"
                      type="number"
                      placeholder="45"
                      value={manualData.exerciseMinutes}
                      onChange={(e) =>
                        handleInputChange("exerciseMinutes", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="stand">Horas de Pie</Label>
                    <Input
                      id="stand"
                      type="number"
                      placeholder="8"
                      value={manualData.standHours}
                      onChange={(e) =>
                        handleInputChange("standHours", e.target.value)
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleManualSubmit}
                  disabled={isLoading}
                  className="w-full mt-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Registrar Actividad"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
