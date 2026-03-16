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
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import { FileText, Upload, Loader2, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

// Type for the full analysis returned by the backend
interface AnthropometryAnalysis {
  basics: {
    weight: number | null;
    height: number | null;
    seatedHeight?: number | null;
    age?: number | null;
  };
  skinFolds: {
    triceps: number | null;
    subscapular: number | null;
    supraspinal: number | null;
    abdominal: number | null;
    thigh: number | null;
    calf: number | null;
    sumOfSix: number | null;
  };
  diameters: Record<string, number | null>;
  perimeters: Record<string, number | null>;
  bodyComposition: {
    adipose: { percentage: number | null; kg: number | null };
    muscular: { percentage: number | null; kg: number | null };
    residual: { percentage: number | null; kg: number | null };
    bone: { percentage: number | null; kg: number | null };
    skin: { percentage: number | null; kg: number | null };
  };
  somatotype: {
    endomorphy: number | null;
    mesomorphy: number | null;
    ectomorphy: number | null;
  };
  indexes: {
    bmi: number | null;
    waistHipRatio: number | null;
    muscleToOsseousIndex: number | null;
    adiposeToMuscularIndex: number | null;
    bmr: number | null;
    idealWeight: number | null;
  };
  zScores: Record<string, number>;
}

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
  const { addSkinFoldRecord, updateSkinFoldRecord } =
    useNaviTrackerStore();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"manual" | "pdf">("manual");
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [pdfFile, setPdfFile] = useState<{ data: string; filename: string } | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);
  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false);
  const [fullAnalysis, setFullAnalysis] = useState<AnthropometryAnalysis | null>(null);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

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

  const pdfInputRef = useRef<HTMLInputElement>(null);

  const extractImagesFromPdf = async (file: File): Promise<string[]> => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const images: string[] = [];

    setPdfPageCount(pdf.numPages);

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      await page.render({ canvasContext: ctx, viewport }).promise;
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      images.push(dataUrl.split(",")[1]);
    }

    return images;
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Por favor selecciona un archivo PDF");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("El PDF es demasiado grande. Maximo 10MB.");
      return;
    }

    // Store the file reference
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPdfFile({ data: base64, filename: file.name });
    };
    reader.readAsDataURL(file);

    // Now extract images and analyze
    setIsAnalyzingPdf(true);
    setIsLoading(true);

    try {
      toast.info("Extrayendo paginas del PDF...");
      const images = await extractImagesFromPdf(file);

      if (images.length === 0) {
        toast.error("No se pudieron extraer paginas del PDF");
        return;
      }

      toast.info(`${images.length} pagina(s) extraidas. Analizando con IA... (20-40 segundos)`);

      const result = await api.skinFold.analyzePdf({ images });

      if (result.success && result.data) {
        const { record, fullAnalysis: analysis } = result.data as {
          record: SkinFoldRecord;
          fullAnalysis: AnthropometryAnalysis;
        };

        // Pre-fill form with extracted skin fold values
        if (record.values) {
          setFormData((prev) => ({
            ...prev,
            values: { ...prev.values, ...record.values },
            technician: record.technician || prev.technician,
          }));
        }

        // Extract date from the analysis if available
        if (analysis.basics?.age) {
          // Keep user's selected date, don't override
        }

        setAiConfidence(record.aiConfidence ?? 0.9);
        setFullAnalysis(analysis);
        setShowFullAnalysis(true);

        toast.success(
          `Analisis completado! Se extrajeron ${Object.values(record.values || {}).filter((v) => typeof v === "number" && v > 0).length} pliegues cutaneos`
        );
      } else {
        toast.error("Error en el analisis del PDF");
      }
    } catch (error) {
      console.error("Error analyzing PDF:", error);
      toast.error("Error al analizar el PDF. Verifica que sea un informe de antropometria valido.");
    } finally {
      setIsAnalyzingPdf(false);
      setIsLoading(false);
    }
  };

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

  const handleSave = async () => {
    const validation = validateSkinFoldRecord({
      ...formData,
      values: formData.values,
    });

    if (!validation.isValid) {
      toast.error("Errores: " + validation.errors.join(", "));
      return;
    }

    setIsLoading(true);

    try {
      // Build notes: if we have full analysis, store it as structured JSON
      let notesContent = formData.notes;
      if (fullAnalysis) {
        const analysisNote = {
          source: "anthropometry-pdf",
          bodyComposition: fullAnalysis.bodyComposition,
          somatotype: fullAnalysis.somatotype,
          indexes: fullAnalysis.indexes,
          diameters: fullAnalysis.diameters,
          perimeters: fullAnalysis.perimeters,
          basics: fullAnalysis.basics,
          zScores: fullAnalysis.zScores,
          userNotes: formData.notes,
        };
        notesContent = JSON.stringify(analysisNote);
      }

      const recordData = {
        ...formData,
        notes: notesContent,
        aiConfidence: aiConfidence || undefined,
        ...(pdfFile && { pdfUrl: pdfFile.data, pdfFilename: pdfFile.filename }),
      };

      if (editingRecord) {
        await updateSkinFoldRecord(editingRecord.id, recordData);
        toast.success("Registro actualizado");
      } else {
        await addSkinFoldRecord(recordData);
        toast.success("Registro guardado");
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
      setPdfFile(null);
      setFullAnalysis(null);
      setShowFullAnalysis(false);
      setPdfPageCount(0);

      if (onRecordSaved) {
        onRecordSaved();
      }
    } catch (error) {
      console.error("Error guardando registro:", error);
      toast.error("Error guardando el registro");
    } finally {
      setIsLoading(false);
    }
  };

  const getMeasuredCount = () => {
    return Object.values(formData.values).filter(
      (v) => typeof v === "number" && v > 0
    ).length;
  };

  const renderBodyComposition = () => {
    if (!fullAnalysis?.bodyComposition) return null;
    const bc = fullAnalysis.bodyComposition;
    const items = [
      { label: "Adiposa", data: bc.adipose, color: "text-amber-600 dark:text-amber-400" },
      { label: "Muscular", data: bc.muscular, color: "text-green-600 dark:text-green-400" },
      { label: "Residual", data: bc.residual, color: "text-blue-600 dark:text-blue-400" },
      { label: "Osea", data: bc.bone, color: "text-gray-600 dark:text-gray-400" },
      { label: "Piel", data: bc.skin, color: "text-pink-600 dark:text-pink-400" },
    ];

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Composicion Corporal (5 Componentes)</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {items.map(({ label, data, color }) => (
            <div key={label} className="bg-muted/50 rounded-lg p-2 text-center">
              <p className={`text-xs font-medium ${color}`}>{label}</p>
              <p className="text-sm font-bold">{data.percentage != null ? `${data.percentage}%` : "-"}</p>
              <p className="text-xs text-muted-foreground">{data.kg != null ? `${data.kg} kg` : "-"}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSomatotype = () => {
    if (!fullAnalysis?.somatotype) return null;
    const s = fullAnalysis.somatotype;
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Somatotipo (Heath & Carter)</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 text-center">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Endomorfia</p>
            <p className="text-lg font-bold text-amber-800 dark:text-amber-200">{s.endomorphy ?? "-"}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
            <p className="text-xs font-medium text-green-700 dark:text-green-300">Mesomorfia</p>
            <p className="text-lg font-bold text-green-800 dark:text-green-200">{s.mesomorphy ?? "-"}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Ectomorfia</p>
            <p className="text-lg font-bold text-blue-800 dark:text-blue-200">{s.ectomorphy ?? "-"}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderIndexes = () => {
    if (!fullAnalysis?.indexes) return null;
    const idx = fullAnalysis.indexes;
    const items = [
      { label: "IMC", value: idx.bmi, unit: "kg/m2" },
      { label: "Cintura/Cadera", value: idx.waistHipRatio, unit: "" },
      { label: "Musculo/Oseo", value: idx.muscleToOsseousIndex, unit: "" },
      { label: "Adiposo/Muscular", value: idx.adiposeToMuscularIndex, unit: "" },
      { label: "TMB", value: idx.bmr, unit: "kcal" },
      { label: "Peso Ideal", value: idx.idealWeight, unit: "kg" },
    ];

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Indices</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {items.map(({ label, value, unit }) => (
            <div key={label} className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold">
                {value != null ? `${value} ${unit}` : "-"}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBasics = () => {
    if (!fullAnalysis?.basics) return null;
    const b = fullAnalysis.basics;
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Datos Basicos</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {b.weight != null && (
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Peso</p>
              <p className="text-sm font-semibold">{b.weight} kg</p>
            </div>
          )}
          {b.height != null && (
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Talla</p>
              <p className="text-sm font-semibold">{b.height} cm</p>
            </div>
          )}
          {b.seatedHeight != null && (
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Talla sentado</p>
              <p className="text-sm font-semibold">{b.seatedHeight} cm</p>
            </div>
          )}
          {b.age != null && (
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground">Edad</p>
              <p className="text-sm font-semibold">{b.age} anos</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingRecord ? "Editar" : "Registrar"} Pliegues Cutaneos
            {aiConfidence != null && (
              <span className="text-sm bg-accent text-accent-foreground px-2 py-1 rounded">
                AI {Math.round(aiConfidence * 100)}%
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto -mx-1">
          <button
            className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "manual"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("manual")}
          >
            Manual
          </button>
          <button
            className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
              activeTab === "pdf"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("pdf")}
          >
            PDF Antropometria
          </button>
        </div>

        <div className="space-y-6">
          {/* Informacion general */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
              <Label htmlFor="technician">Tecnico/Nutricionista</Label>
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
                placeholder="Nombre del profesional"
              />
            </div>
            <div>
              <Label>Mediciones ({getMeasuredCount()}/9)</Label>
              <div className="p-2 bg-muted rounded-lg text-sm text-muted-foreground">
                {getMeasuredCount()} sitios medidos
              </div>
            </div>
          </div>

          {/* PDF Upload + Analysis Tab */}
          {activeTab === "pdf" && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  PDF de Antropometria
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Subi el PDF con los resultados de tu nutricionista. La IA va a extraer
                  automaticamente todos los pliegues, composicion corporal, somatotipo e indices.
                </p>
              </div>

              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                className="hidden"
              />

              {isAnalyzingPdf ? (
                <div className="flex flex-col items-center gap-3 p-6 bg-muted/50 rounded-xl">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <div className="text-center">
                    <p className="font-medium">Analizando PDF con IA...</p>
                    <p className="text-sm text-muted-foreground">
                      {pdfPageCount > 0
                        ? `${pdfPageCount} pagina(s) detectadas. `
                        : ""}
                      Esto puede tomar 20-40 segundos
                    </p>
                  </div>
                </div>
              ) : pdfFile && fullAnalysis ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200 truncate">
                        {pdfFile.filename}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Analisis completado - {getMeasuredCount()} pliegues extraidos
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPdfFile(null);
                        setFullAnalysis(null);
                        setShowFullAnalysis(false);
                        setAiConfidence(null);
                        setFormData((prev) => ({ ...prev, values: {}, technician: "" }));
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Quitar
                    </Button>
                  </div>

                  {/* Full Analysis Accordion */}
                  <button
                    onClick={() => setShowFullAnalysis(!showFullAnalysis)}
                    className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <span className="text-sm font-medium">Ver analisis completo</span>
                    {showFullAnalysis ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {showFullAnalysis && (
                    <div className="space-y-4 p-3 bg-muted/30 rounded-lg border">
                      {renderBasics()}
                      {renderBodyComposition()}
                      {renderSomatotype()}
                      {renderIndexes()}
                    </div>
                  )}
                </div>
              ) : pdfFile ? (
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{pdfFile.filename}</p>
                    <p className="text-xs text-muted-foreground">PDF cargado</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPdfFile(null)}
                    className="text-red-500"
                  >
                    Quitar
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => pdfInputRef.current?.click()}
                  variant="outline"
                  className="w-full py-8 flex flex-col gap-2"
                >
                  <Upload className="w-6 h-6" />
                  <span>Seleccionar PDF de antropometria</span>
                  <span className="text-xs text-muted-foreground font-normal">Max 10MB</span>
                </Button>
              )}
            </div>
          )}

          {/* Manual Input Tab */}
          {activeTab === "manual" && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  Medicion Manual
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Ingresa las mediciones tomadas con calibrador de pliegues
                  cutaneos. Valores en milimetros (mm). Deja en blanco los
                  sitios no medidos.
                </p>
              </div>
            </div>
          )}

          {/* Mediciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {SkinFoldMeasurementOrder.map((site) => (
              <div key={site} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    {SkinFoldSiteNames[site]}
                  </Label>
                  <div className="group relative">
                    <span className="text-xs text-muted-foreground cursor-help">
                      i
                    </span>
                    <div className="absolute bottom-6 right-0 hidden group-hover:block bg-popover text-popover-foreground text-xs p-2 rounded shadow-lg max-w-xs z-10 border">
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
                    -
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
              placeholder="Observaciones, condiciones de medicion, etc."
              rows={3}
            />
          </div>

          {/* Botones de accion */}
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
