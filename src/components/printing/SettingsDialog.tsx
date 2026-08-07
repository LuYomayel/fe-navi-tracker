"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "@/lib/toast-helper";
import type { PrintSettings, UpdatePrintSettingsDto } from "@/types/printing";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PrintSettings | null;
  onSave: (data: UpdatePrintSettingsDto) => Promise<boolean>;
  onRegenerateToken: () => Promise<boolean>;
  isSubmitting?: boolean;
}

/** Parametros de costeo + link del catalogo publico (Marcelito). */
export default function SettingsDialog({
  isOpen,
  onClose,
  settings,
  onSave,
  onRegenerateToken,
  isSubmitting,
}: SettingsDialogProps) {
  const [form, setForm] = useState<UpdatePrintSettingsDto>({});
  const regenConfirm = useConfirm();

  useEffect(() => {
    if (isOpen && settings) {
      setForm({
        costPerGram: settings.costPerGram,
        wastePct: settings.wastePct * 100, // se edita en % para que sea legible
        powerPerHour: settings.powerPerHour,
        defaultMarkup: settings.defaultMarkup,
        financingSurcharge: settings.financingSurcharge,
      });
    }
  }, [isOpen, settings]);

  const publicUrl =
    typeof window !== "undefined" && settings
      ? `${window.location.origin}/catalogo/${settings.publicToken}`
      : "";

  const handleSave = async () => {
    const ok = await onSave({
      ...form,
      wastePct:
        form.wastePct !== undefined ? Number(form.wastePct) / 100 : undefined,
    });
    if (ok) onClose();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Link copiado");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Parametros del negocio</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="st-cpg">$/g filamento</Label>
                <Input
                  id="st-cpg"
                  type="number"
                  inputMode="decimal"
                  value={form.costPerGram ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, costPerGram: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="st-waste">Desperdicio %</Label>
                <Input
                  id="st-waste"
                  type="number"
                  inputMode="decimal"
                  value={form.wastePct ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, wastePct: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="st-power">$/hora luz</Label>
                <Input
                  id="st-power"
                  type="number"
                  inputMode="decimal"
                  value={form.powerPerHour ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, powerPerHour: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="st-markup">Markup default</Label>
                <Input
                  id="st-markup"
                  type="number"
                  inputMode="decimal"
                  step="0.05"
                  value={form.defaultMarkup ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      defaultMarkup: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="st-fin">
                Recargo de financiacion (ARS, aparte del $/g)
              </Label>
              <Input
                id="st-fin"
                type="number"
                inputMode="decimal"
                value={form.financingSurcharge ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    financingSurcharge: Number(e.target.value),
                  })
                }
              />
            </div>

            <Button className="w-full" onClick={handleSave} disabled={isSubmitting}>
              Guardar parametros
            </Button>

            <div className="space-y-1.5 rounded-lg border p-3">
              <Label className="text-sm">Catalogo publico (para Marcelito)</Label>
              <div className="flex items-center gap-2">
                <Input readOnly value={publicUrl} className="text-xs" />
                <Button variant="outline" size="icon" onClick={copyLink} type="button">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                type="button"
                onClick={() => regenConfirm.confirm()}
                disabled={isSubmitting}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Generar link nuevo (revoca el actual)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={regenConfirm.open}
        onOpenChange={regenConfirm.onOpenChange}
        title="Generar un link nuevo?"
        description="El link que tiene Marcelito ahora deja de funcionar. Vas a tener que mandarle el nuevo."
        confirmLabel="Generar nuevo"
        destructive
        onConfirm={async () => {
          regenConfirm.onConfirm();
          await onRegenerateToken();
        }}
      />
    </>
  );
}
