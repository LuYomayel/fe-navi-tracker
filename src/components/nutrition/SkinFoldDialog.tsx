"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNaviTrackerStore } from "@/store";
import type { SkinFoldRecord, SkinFoldSite } from "@/types/skinFold";
import {
  SkinFoldSiteNames,
  SkinFoldDescriptions,
  SkinFoldMeasurementOrder,
} from "@/types/skinFold";
import { validateSkinFoldRecord } from "@/lib/anthropometry";
import { apiClient } from "@/lib/api-client";

interface SkinFoldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingRecord?: SkinFoldRecord;
  onRecordSaved?: () => void;
}

export function SkinFoldDialog({
  isOpen,
  onClose,
  editingRecord,
  onRecordSaved,
}: SkinFoldDialogProps) {
  const { addSkinFoldRecord, updateSkinFoldRecord, preferences } =
    useNaviTrackerStore();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai" | "manual">("manual");
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    date: string;
    technician: string;
    notes: string;
    values: Partial<Record<SkinFoldSite, number>>;
  }>(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      date: editingRecord?.date || today,
      technician: editingRecord?.technician || "",
      notes: editingRecord?.notes || "",
      values: editingRecord?.values || {},
    };
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (site: SkinFoldSite, value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [site]: numValue,
      },
    }));
  };

  const adjustValue = (site: SkinFoldSite, delta: number) => {
    const currentValue = formData.values[site] || 0;
    const newValue = Math.max(0, Math.round((currentValue + delta) * 10) / 10);
    setFormData((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [site]: newValue === 0 ? undefined : newValue,
      },
    }));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida");
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen es demasiado grande. Máximo 5MB.");
      return;
    }

    setIsLoading(true);

    try {
      // Convertir imagen a base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(",")[1];

        // Obtener datos del usuario desde preferencias
        const userData = {
          age: preferences.age || 30,
          height: preferences.height || 170,
          weight: preferences.currentWeight || 70,
          gender: preferences.gender || ("male" as const),
        };

        try {
          const result = await apiClient.post("/body-analysis/skinfold", {
            imageBase64: base64Data,
            user: userData,
          });

          if (result.success && result.data) {
            // Pre-llenar el formulario con los valores de la IA
            const analysisData = result.data as any;
            setFormData((prev) => ({
              ...prev,
              values: { ...prev.values, ...analysisData.values },
              technician: "AI",
            }));
            setAiConfidence(analysisData.aiConfidence);

            alert(
              `Análisis completado con ${Math.round(
                analysisData.aiConfidence * 100
              )}% de confianza`
            );
          } else {
            throw new Error("Error en el análisis");
          }
        } catch (error) {
          console.error("Error analizando imagen:", error);
          alert("Error analizando la imagen. Intenta de nuevo.");
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error procesando imagen:", error);
      alert("Error procesando la imagen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validar formulario
    const validation = validateSkinFoldRecord({
      ...formData,
      values: formData.values,
    });

    if (!validation.isValid) {
      alert("Errores en el formulario:\n" + validation.errors.join("\n"));
      return;
    }

    setIsLoading(true);

    try {
      const recordData = {
        ...formData,
        aiConfidence: aiConfidence || undefined,
      };

      if (editingRecord) {
        await updateSkinFoldRecord(editingRecord.id, recordData);
      } else {
        await addSkinFoldRecord(recordData);
      }

      onClose();

      // Reset form
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        date: today,
        technician: "",
        notes: "",
        values: {},
      });
      setAiConfidence(null);

      if (onRecordSaved) {
        onRecordSaved();
      }
    } catch (error) {
      console.error("Error guardando registro:", error);
      alert("Error guardando el registro");
    } finally {
      setIsLoading(false);
    }
  };

  const getMeasuredCount = () => {
    return Object.values(formData.values).filter(
      (v) => typeof v === "number" && v > 0
    ).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🗺️ {editingRecord ? "Editar" : "Registrar"} Pliegues Cutáneos
            {aiConfidence && (
              <span className="text-sm bg-accent text-accent-foreground px-2 py-1 rounded">
                AI {Math.round(aiConfidence * 100)}%
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "manual"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("manual")}
          >
            📝 Manual
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "ai"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("ai")}
          >
            🤖 Análisis con IA
          </button>
        </div>

        <div className="space-y-6">
          {/* Información general */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="technician">Técnico/Nutricionista</Label>
              <Input
                id="technician"
                type="text"
                value={formData.technician}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    technician: e.target.value,
                  }))
                }
                placeholder="Nombre del profesional o 'AI'"
              />
            </div>
            <div>
              <Label>Mediciones ({getMeasuredCount()}/9)</Label>
              <div className="p-2 bg-muted rounded-lg text-sm text-muted-foreground">
                {getMeasuredCount()} sitios medidos
              </div>
            </div>
          </div>

          {/* IA Analysis Tab */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              <div className="bg-accent p-4 rounded-lg">
                <h3 className="font-medium text-accent-foreground mb-2">
                  📸 Análisis con Inteligencia Artificial
                </h3>
                <p className="text-sm text-accent-foreground mb-4">
                  Sube una foto frontal y/o lateral para que la IA estime los
                  pliegues cutáneos. Asegúrate de que la imagen sea clara y
                  muestre los sitios de medición.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading
                    ? "Analizando..."
                    : "📷 Subir Imagen para Análisis"}
                </Button>
              </div>
            </div>
          )}

          {/* Manual Input Tab */}
          {activeTab === "manual" && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">
                  📏 Medición Manual
                </h3>
                <p className="text-sm text-green-700">
                  Ingresa las mediciones tomadas con calibrador de pliegues
                  cutáneos. Valores en milímetros (mm). Deja en blanco los
                  sitios no medidos.
                </p>
              </div>
            </div>
          )}

          {/* Mediciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SkinFoldMeasurementOrder.map((site) => (
              <div key={site} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    {SkinFoldSiteNames[site]}
                  </Label>
                  <div className="group relative">
                    <span className="text-xs text-muted-foreground cursor-help">
                      ℹ️
                    </span>
                    <div className="absolute bottom-6 right-0 hidden group-hover:block bg-black text-white text-xs p-2 rounded max-w-xs z-10">
                      {SkinFoldDescriptions[site]}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => adjustValue(site, -0.5)}
                    className="w-8 h-8 bg-muted hover:bg-muted/80 rounded text-sm font-bold"
                  >
                    −
                  </button>

                  <Input
                    type="number"
                    value={formData.values[site] || ""}
                    onChange={(e) => handleInputChange(site, e.target.value)}
                    placeholder="mm"
                    min="0"
                    max="50"
                    step="0.1"
                    className="flex-1 text-center"
                  />

                  <button
                    type="button"
                    onClick={() => adjustValue(site, 0.5)}
                    className="w-8 h-8 bg-muted hover:bg-muted/80 rounded text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Notas */}
          <div>
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Observaciones, condiciones de medición, etc."
              rows={3}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || getMeasuredCount() === 0}
            >
              {isLoading
                ? "Guardando..."
                : editingRecord
                ? "Actualizar"
                : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
