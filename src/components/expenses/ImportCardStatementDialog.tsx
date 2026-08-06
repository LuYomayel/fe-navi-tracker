"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import { fmtARS } from "@/lib/utils";
import type { ExpenseCategory } from "@/types/expenses";
import {
  CreditCard,
  FileText,
  FileUp,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";

interface ParsedMovement {
  date: string;
  description: string;
  amountArs: number;
  installment: string | null;
  isTax: boolean;
  categoria?: string | null;
  categoryId?: string | null;
  duplicate?: boolean;
}

interface ParsedStatement {
  bank: string;
  cardLabel: string;
  closingDate: string;
  dueDate: string;
  totalArs: number;
  totalUsd: number;
  movements: ParsedMovement[];
  statementKey: string;
}

interface ReviewRow extends ParsedMovement {
  include: boolean;
}

/**
 * Importador de resumen de tarjeta (mismo patrón que el plan nutri y la
 * antropometría): PDF → IA desglosa los consumos → preview con categorías
 * sugeridas y duplicados marcados → confirmar carga los gastos con dedup.
 */
export function ImportCardStatementDialog({
  isOpen,
  onClose,
  onImported,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [statement, setStatement] = useState<ParsedStatement | null>(null);
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStatement(null);
      setRows([]);
      setSelectedFile(null);
      setImages([]);
      api.expenses.categories
        .list()
        .then((r) => setCategories((r.data as ExpenseCategory[]) || []))
        .catch(() => {});
    }
  }, [isOpen]);

  const extractImagesFromPdf = async (file: File): Promise<string[]> => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const out: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      await page.render({ canvas, canvasContext: ctx, viewport } as Parameters<
        typeof page.render
      >[0]).promise;
      out.push(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
    }
    return out;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    try {
      setExtracting(true);
      const imgs = await extractImagesFromPdf(file);
      setImages(imgs);
      if (!imgs.length) toast.error("Error", "No se pudieron extraer páginas del PDF");
    } catch {
      toast.error("Error", "No se pudo procesar el PDF");
    } finally {
      setExtracting(false);
    }
  };

  const handleParse = async () => {
    if (!images.length) {
      toast.error("Error", "Seleccioná el PDF del resumen primero");
      return;
    }
    setParsing(true);
    try {
      const res = await api.expenses.cardStatement.parse({ images });
      const st = res.data as ParsedStatement;
      setStatement(st);
      setRows(
        st.movements.map((m) => ({ ...m, include: !m.duplicate }))
      );
    } catch {
      toast.error("Error", "No se pudo analizar el resumen");
    } finally {
      setParsing(false);
    }
  };

  const selected = rows.filter((r) => r.include);
  const selectedTotal = selected.reduce((a, r) => a + r.amountArs, 0);

  const handleConfirm = async () => {
    if (!statement || !selected.length) return;
    setConfirming(true);
    try {
      const res = await api.expenses.cardStatement.confirm({
        statementKey: statement.statementKey,
        dueDate:
          statement.dueDate || new Date().toISOString().slice(0, 10),
        movements: selected.map((r) => ({
          date: r.date,
          description:
            r.description + (r.installment ? ` (cuota ${r.installment})` : ""),
          amount: r.amountArs,
          categoryId: r.categoryId || null,
        })),
      });
      const d = res.data as { imported: number; skipped: number };
      toast.success(
        `${d.imported} gastos importados`,
        d.skipped ? `${d.skipped} salteados por duplicados` : fmtARS(selectedTotal)
      );
      onImported();
      onClose();
    } catch {
      toast.error("Error", "No se pudieron importar los gastos");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            {statement
              ? `Resumen ${statement.bank} — cierre ${statement.closingDate}`
              : "Importar resumen de tarjeta"}
          </DialogTitle>
        </DialogHeader>

        {!statement ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Subí el PDF del resumen (el que te llega por mail). La IA
              desglosa cada consumo, sugiere categorías y detecta duplicados
              antes de cargar nada.
            </p>

            {!selectedFile ? (
              <div
                className="cursor-pointer rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click para seleccionar el PDF
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {extracting
                      ? "Procesando…"
                      : `${images.length} página${images.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => {
                    setSelectedFile(null);
                    setImages([]);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
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

            <Button
              onClick={handleParse}
              disabled={parsing || extracting || !images.length}
              className="w-full"
            >
              {parsing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analizando con IA…
                </>
              ) : (
                <>
                  <FileUp className="mr-2 h-4 w-4" />
                  Analizar resumen
                </>
              )}
            </Button>
            {parsing && (
              <p className="text-center text-xs text-muted-foreground">
                Desglosando consumos… puede tardar 20-40 segundos.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border bg-muted/40 p-3 text-sm">
              <span>
                Vence: <b>{statement.dueDate || "—"}</b>
              </span>
              <span>
                Total: <b>{fmtARS(statement.totalArs)}</b>
              </span>
              {statement.totalUsd > 0 && (
                <span className="text-muted-foreground">
                  + USD {statement.totalUsd} (no se importa)
                </span>
              )}
            </div>

            <div className="max-h-[45vh] space-y-1.5 overflow-y-auto pr-1">
              {rows.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 rounded-lg border p-2 ${
                    r.include ? "" : "opacity-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={r.include}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, include: e.target.checked } : x
                        )
                      )
                    }
                    className="h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium">
                        {r.description}
                      </span>
                      {r.installment && (
                        <Badge variant="info" className="shrink-0 text-[10px]">
                          cuota {r.installment}
                        </Badge>
                      )}
                      {r.isTax && (
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          🧾
                        </Badge>
                      )}
                      {r.duplicate && (
                        <Badge variant="warning" className="shrink-0 text-[10px]">
                          ¿duplicado?
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.date}
                    </div>
                  </div>
                  <select
                    value={r.categoryId || ""}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((x, j) =>
                          j === i
                            ? { ...x, categoryId: e.target.value || null }
                            : x
                        )
                      )
                    }
                    className="h-8 w-32 shrink-0 rounded-md border bg-background px-1.5 text-xs"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon ? `${c.icon} ` : ""}
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <span className="w-24 shrink-0 text-right font-mono text-sm font-bold tabular-nums">
                    {fmtARS(r.amountArs)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <Label className="text-sm text-muted-foreground">
                {selected.length} de {rows.length} seleccionados
              </Label>
              <span className="font-mono text-lg font-bold tabular-nums">
                {fmtARS(selectedTotal)}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStatement(null)}
                disabled={confirming}
              >
                Volver
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirm}
                disabled={confirming || !selected.length}
              >
                {confirming ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                )}
                Importar {selected.length} gastos
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
