"use client";

import { useState, useRef } from "react";
import {
  Camera,
  Scale,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeightEntry, CreateWeightEntryManualDto } from "@/types";
import { toast } from "@/lib/toast-helper";
import { api } from "@/lib/api-client";

interface WeightTrackerProps {
  entries: WeightEntry[];
  onEntryAdded: (entry: WeightEntry) => void;
  onEntryDeleted: (entryId: string) => void;
}

export function WeightTracker({
  entries,
  onEntryAdded,
  onEntryDeleted,
}: WeightTrackerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [entryType, setEntryType] = useState<"manual" | "photo">("manual");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados del formulario
  const [formData, setFormData] = useState({
    weight: "",
    bodyFatPercentage: "",
    muscleMassPercentage: "",
    bodyWaterPercentage: "",
    bmi: "",
    bfr: "",
    score: "",
    notes: "",
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createEntryFromImage = async (imageBase64: string) => {
    try {
      const response = await api.nutrition.createWeightEntryImage({
        imageBase64,
      });
      if (!response.success) {
        throw new Error("Error al procesar la imagen");
      }
      const newEntry = response.data as WeightEntry;
      onEntryAdded(newEntry);
      toast.success("Registro de peso guardado correctamente");
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      toast.error("Error al procesar la imagen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.weight) {
      toast.error("El peso es obligatorio");
      return;
    }

    setIsLoading(true);

    try {
      if (entryType === "photo") {
        if (!selectedImage) {
          toast.error("Debes seleccionar una foto");
          setIsLoading(false);
          return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
          const imageBase64 = e.target?.result as string;
          await createEntryFromImage(imageBase64);
        };
        reader.readAsDataURL(selectedImage);
      } else {
        await submitManualEntry();
      }
    } catch (error) {
      console.error("Error creating weight entry:", error);
      toast.error("Error al guardar el registro de peso");
      setIsLoading(false);
    }
  };

  const submitManualEntry = async () => {
    const entryData: CreateWeightEntryManualDto = {
      date: new Date().toISOString().split("T")[0],
      weight: parseFloat(formData.weight),
      bodyFatPercentage: formData.bodyFatPercentage
        ? parseFloat(formData.bodyFatPercentage)
        : undefined,
      muscleMassPercentage: formData.muscleMassPercentage
        ? parseFloat(formData.muscleMassPercentage)
        : undefined,
      bodyWaterPercentage: formData.bodyWaterPercentage
        ? parseFloat(formData.bodyWaterPercentage)
        : undefined,
      bmi: formData.bmi ? parseFloat(formData.bmi) : undefined,
      bfr: formData.bfr ? parseFloat(formData.bfr) : undefined,
      score: formData.score ? parseFloat(formData.score) : undefined,
      source: "manual",
      notes: formData.notes || undefined,
    };
    console.log("entryData", entryData);
    //return;

    try {
      const response = await api.nutrition.createWeightEntryManual(entryData);
      if (!response.success) {
        throw new Error("Error al guardar el registro de peso");
      }
      console.log("response", response);

      const newEntry = response.data as WeightEntry;
      onEntryAdded(newEntry);
      resetForm();
      setIsModalOpen(false);
      toast.success("Registro de peso guardado correctamente");
    } catch (error) {
      console.error("Error al guardar el registro:", error);
      toast.error("Error al guardar el registro de peso");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      weight: "",
      bodyFatPercentage: "",
      muscleMassPercentage: "",
      bodyWaterPercentage: "",
      bmi: "",
      bfr: "",
      score: "",
      notes: "",
    });
    setSelectedImage(null);
    setImagePreview(null);
    setEntryType("manual");
  };

  const getWeightTrend = () => {
    if (entries.length < 2) return null;

    const latest = entries[0];
    const previous = entries[1];
    const change = latest.weight - previous.weight;

    return {
      change: Math.abs(change),
      direction: change > 0 ? "up" : change < 0 ? "down" : "stable",
    };
  };

  const trend = getWeightTrend();

  return (
    <div className="space-y-6">
      {/* Resumen actual */}
      {entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Peso Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{entries[0].weight} kg</div>
                <div className="text-sm text-muted-foreground">Peso</div>
                {trend && (
                  <div
                    className={`flex items-center justify-center gap-1 text-xs mt-1 ${
                      trend.direction === "up"
                        ? "text-red-600"
                        : trend.direction === "down"
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {trend.direction === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : trend.direction === "down" ? (
                      <TrendingDown className="h-3 w-3" />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}
                    {trend.change.toFixed(1)} kg
                  </div>
                )}
              </div>

              {entries[0].bmi && (
                <div className="text-center">
                  <div className="text-2xl font-bold">{entries[0].bmi}</div>
                  <div className="text-sm text-muted-foreground">BMI</div>
                </div>
              )}

              {entries[0].bodyFatPercentage && (
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {entries[0].bodyFatPercentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Grasa Corporal
                  </div>
                </div>
              )}

              {entries[0].score && (
                <div className="text-center">
                  <div className="text-2xl font-bold">{entries[0].score}</div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botón para agregar nuevo registro */}
      <div className="flex justify-center">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Registrar Peso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nuevo Registro de Peso</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selector de tipo de entrada */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={entryType === "manual" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEntryType("manual")}
                  className="flex-1"
                >
                  <Scale className="h-4 w-4 mr-2" />
                  Manual
                </Button>
                <Button
                  type="button"
                  variant={entryType === "photo" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEntryType("photo")}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Foto
                </Button>
              </div>

              {/* Upload de imagen si es por foto */}
              {entryType === "photo" && (
                <div className="space-y-2">
                  <Label>Foto de la balanza</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Seleccionar Foto
                  </Button>

                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Campos del formulario */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Peso (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        weight: e.target.value,
                      }))
                    }
                    required={entryType === "manual"}
                  />
                </div>

                <div>
                  <Label htmlFor="bmi">BMI</Label>
                  <Input
                    id="bmi"
                    type="number"
                    step="0.1"
                    value={formData.bmi}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bmi: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bodyFat">Grasa Corporal (%)</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    value={formData.bodyFatPercentage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bodyFatPercentage: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="muscleMass">Masa Muscular (%)</Label>
                  <Input
                    id="muscleMass"
                    type="number"
                    step="0.1"
                    value={formData.muscleMassPercentage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        muscleMassPercentage: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bodyWater">Agua Corporal (%)</Label>
                  <Input
                    id="bodyWater"
                    type="number"
                    step="0.1"
                    value={formData.bodyWaterPercentage}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bodyWaterPercentage: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="score">Score</Label>
                  <Input
                    id="score"
                    type="number"
                    step="0.1"
                    value={formData.score}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        score: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Ej: Medición después del desayuno..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de registros */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Historial de Peso</h3>
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">{entry.weight} kg</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString("es-ES")}
                      </div>
                    </div>

                    {entry.bmi && (
                      <Badge variant="outline">BMI: {entry.bmi}</Badge>
                    )}

                    {entry.bodyFatPercentage && (
                      <Badge variant="outline">
                        Grasa: {entry.bodyFatPercentage}%
                      </Badge>
                    )}

                    <Badge variant="secondary">
                      {entry.source === "manual"
                        ? "Manual"
                        : entry.source === "photo"
                        ? "Foto"
                        : "Balanza"}
                    </Badge>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEntryDeleted(entry.id)}
                  >
                    Eliminar
                  </Button>
                </div>

                {entry.notes && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {entry.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
