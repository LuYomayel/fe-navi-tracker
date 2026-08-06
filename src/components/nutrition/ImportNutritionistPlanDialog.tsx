"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileUp,
  Loader2,
  FileText,
  X,
  Target,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useMealPrep } from "@/hooks/useMealPrep";
import { useNaviTrackerStore } from "@/store";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";

interface ImportNutritionistPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOURCE_LABELS: Record<string, string> = {
  plan: "📄 Extraídos del PDF del plan",
  "promedio-dias": "🧮 Promedio de las calorías diarias del plan",
  "estimado-ia": "✨ Estimados por IA desde las porciones del plan",
};

interface DetectedGoals {
  planName: string;
  source: string;
  rationale?: string | null;
  dailyCalorieGoal: string;
  proteinGoal: string;
  carbsGoal: string;
  fatGoal: string;
}

export function ImportNutritionistPlanDialog({
  isOpen,
  onClose,
}: ImportNutritionistPlanDialogProps) {
  const { importPlan, isImporting, activePlan } = useMealPrep();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedImages, setExtractedImages] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  // Paso "objetivos detectados" (estilo antropometría: revisar y aplicar)
  const [step, setStep] = useState<"upload" | "goals">("upload");
  const [computing, setComputing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [detected, setDetected] = useState<DetectedGoals | null>(null);

  useEffect(() => {
    if (isOpen) setStep("upload");
  }, [isOpen]);

  // Calcula los objetivos que se desprenden de un plan y abre el paso de revisión
  const computeGoals = async (planId: string) => {
    setComputing(true);
    try {
      const res = await api.mealPrep.computePlanGoals(planId);
      const d = res.data!;
      setDetected({
        planName: d.planName,
        source: d.source,
        rationale: d.rationale,
        dailyCalorieGoal: String(d.goals.dailyCalorieGoal ?? ""),
        proteinGoal: String(d.goals.proteinGoal ?? ""),
        carbsGoal: String(d.goals.carbsGoal ?? ""),
        fatGoal: String(d.goals.fatGoal ?? ""),
      });
      setStep("goals");
    } catch {
      toast.error("Error", "No se pudieron calcular los objetivos del plan");
    } finally {
      setComputing(false);
    }
  };

  const applyGoals = async () => {
    if (!detected) return;
    const num = (s: string) => {
      const n = parseFloat(s);
      return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
    };
    const goals = {
      dailyCalorieGoal: num(detected.dailyCalorieGoal),
      proteinGoal: num(detected.proteinGoal),
      carbsGoal: num(detected.carbsGoal),
      fatGoal: num(detected.fatGoal),
    };
    if (!goals.dailyCalorieGoal) {
      toast.error("Error", "Las calorías diarias son obligatorias");
      return;
    }
    setApplying(true);
    try {
      await api.preferences.updateGoals(goals);
      try {
        await useNaviTrackerStore.getState().loadNutritionGoals();
      } catch {
        // best effort
      }
      toast.success(
        "Objetivos actualizados",
        `${goals.dailyCalorieGoal} kcal · P${goals.proteinGoal ?? "—"} C${goals.carbsGoal ?? "—"} G${goals.fatGoal ?? "—"} (desde "${detected.planName}")`
      );
      onClose();
    } catch {
      toast.error("Error", "No se pudieron aplicar los objetivos");
    } finally {
      setApplying(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Auto-fill name from filename
    if (!name) {
      const baseName = file.name.replace(/\.pdf$/i, "");
      setName(baseName);
    }

    // Extract images from PDF
    try {
      setIsExtracting(true);
      const images = await extractImagesFromPdf(file);
      setExtractedImages(images);

      if (images.length === 0) {
        toast.error("Error", "No se pudieron extraer paginas del PDF");
      }
    } catch (error) {
      console.error("Error extracting PDF:", error);
      toast.error("Error", "No se pudo procesar el PDF. Intenta con otro archivo.");
    } finally {
      setIsExtracting(false);
    }
  };

  const extractImagesFromPdf = async (file: File): Promise<string[]> => {
    // Dynamically import pdfjs-dist
    const pdfjsLib = await import("pdfjs-dist");

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const images: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      await page.render({ canvas, canvasContext: ctx, viewport } as Parameters<typeof page.render>[0]).promise;
      // Get base64 without the data:image/jpeg;base64, prefix
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      images.push(dataUrl.split(",")[1]);
    }

    return images;
  };

  const handleImport = async () => {
    if (!name.trim()) {
      toast.error("Error", "El nombre del plan es obligatorio");
      return;
    }
    if (extractedImages.length === 0) {
      toast.error("Error", "Selecciona un archivo PDF primero");
      return;
    }

    try {
      const plan = await importPlan({
        images: extractedImages,
        name: name.trim(),
        pdfFilename: selectedFile?.name,
      });

      setName("");
      setSelectedFile(null);
      setExtractedImages([]);

      // En vez de cerrar: calcular y mostrar los objetivos detectados
      if (plan?.id) {
        await computeGoals(plan.id);
      } else {
        onClose();
      }
    } catch {
      // Error handled by hook
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setExtractedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (step === "goals" && detected) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Objetivos detectados del plan
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 text-sm">
              <div className="font-semibold">{detected.planName}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {SOURCE_LABELS[detected.source] || detected.source}
              </div>
              {detected.rationale && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {detected.rationale}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="pg-kcal">Calorías diarias</Label>
              <Input
                id="pg-kcal"
                inputMode="numeric"
                value={detected.dailyCalorieGoal}
                onChange={(e) =>
                  setDetected({ ...detected, dailyCalorieGoal: e.target.value })
                }
                className="text-lg font-semibold"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["proteinGoal", "Proteína (g)"],
                  ["carbsGoal", "Carbos (g)"],
                  ["fatGoal", "Grasas (g)"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <Label className="text-xs">{label}</Label>
                  <Input
                    inputMode="numeric"
                    value={detected[key]}
                    onChange={(e) =>
                      setDetected({ ...detected, [key]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Revisá los valores (podés ajustarlos) y aplicalos como tus
              objetivos nutricionales. Van a reemplazar los actuales.
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={applying}
              >
                Ahora no
              </Button>
              <Button className="flex-1" onClick={applyGoals} disabled={applying}>
                {applying ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                )}
                Aplicar objetivos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5" />
            Importar plan del nutricionista
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Subi el PDF de tu plan nutricional. La IA va a extraer la
            estructura de comidas, cantidades y objetivos caloricos.
          </p>

          {/* Plan activo actual: queda claro que YA hay uno subido */}
          {activePlan && (
            <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 p-3">
              <FileText className="h-5 w-5 shrink-0 text-success" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">
                  {activePlan.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  Plan activo
                  {activePlan.pdfFilename ? ` · ${activePlan.pdfFilename}` : ""}
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                disabled={computing}
                onClick={() => computeGoals(activePlan.id)}
              >
                {computing ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-1 h-4 w-4" />
                )}
                Calcular objetivos
              </Button>
            </div>
          )}

          {/* Plan Name */}
          <div className="space-y-1.5">
            <Label>Nombre del plan</Label>
            <Input
              placeholder="Ej: Plan Marzo 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-1.5">
            <Label>Archivo PDF</Label>

            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click para seleccionar PDF
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Solo archivos .pdf
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border">
                <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isExtracting
                      ? "Procesando..."
                      : `${extractedImages.length} pagina${extractedImages.length !== 1 ? "s" : ""} extraida${extractedImages.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Import Button */}
          <Button
            onClick={handleImport}
            disabled={
              isImporting ||
              isExtracting ||
              !name.trim() ||
              extractedImages.length === 0
            }
            className="w-full"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analizando con IA...
              </>
            ) : isExtracting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando PDF...
              </>
            ) : (
              <>
                <FileUp className="h-4 w-4 mr-2" />
                Importar plan
              </>
            )}
          </Button>

          {isImporting && (
            <p className="text-xs text-muted-foreground text-center">
              La IA esta analizando tu plan nutricional. Esto puede tardar
              20-40 segundos...
            </p>
          )}
          {computing && (
            <p className="text-xs text-muted-foreground text-center">
              Calculando los objetivos que se desprenden del plan…
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
