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
import { FileUp, Loader2, FileText, X } from "lucide-react";
import { useMealPrep } from "@/hooks/useMealPrep";
import { toast } from "@/lib/toast-helper";

interface ImportNutritionistPlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportNutritionistPlanDialog({
  isOpen,
  onClose,
}: ImportNutritionistPlanDialogProps) {
  const { importPlan, isImporting } = useMealPrep();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedImages, setExtractedImages] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

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

      await page.render({ canvasContext: ctx, viewport }).promise;
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
      await importPlan({
        images: extractedImages,
        name: name.trim(),
        pdfFilename: selectedFile?.name,
      });

      // Reset and close
      setName("");
      setSelectedFile(null);
      setExtractedImages([]);
      onClose();
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
