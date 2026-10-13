"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LY_BRAND_CLASS } from "@/lib/ly-brand";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { Copy, Plus, RefreshCw, Printer, Unplug, Users } from "lucide-react";
import { toast } from "@/lib/toast-helper";
import type {
  BambuStatus,
  PrintReseller,
  PrintSettings,
  UpdatePrintSettingsDto,
} from "@/types/printing";

// Query param y no ruta dinamica: /catalogo/[token] no se puede exportar
// estatico y rompia el build del celu (Capacitor).
// En la app nativa el origin es capacitor://localhost, que no le sirve a un
// revendedor: el link siempre apunta al dominio web.
const catalogUrl = (token: string) =>
  `https://navi-tracker.luciano-yomayel.com/catalogo?t=${token}`;

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PrintSettings | null;
  onSave: (data: UpdatePrintSettingsDto) => Promise<boolean>;
  resellers: PrintReseller[];
  onCreateReseller: (name: string) => Promise<boolean>;
  onUpdateReseller: (
    id: string,
    data: { name?: string; active?: boolean },
  ) => Promise<boolean>;
  onRegenerateResellerToken: (id: string) => Promise<boolean>;
  isSubmitting?: boolean;
  bambuStatus?: BambuStatus | null;
  onConnectBambu?: (token: string) => Promise<boolean>;
  onDisconnectBambu?: () => Promise<boolean>;
}

/** Parametros de costeo + revendedores (cada uno con su link al catalogo). */
export default function SettingsDialog({
  isOpen,
  onClose,
  settings,
  onSave,
  resellers,
  onCreateReseller,
  onUpdateReseller,
  onRegenerateResellerToken,
  isSubmitting,
  bambuStatus,
  onConnectBambu,
  onDisconnectBambu,
}: SettingsDialogProps) {
  const [form, setForm] = useState<UpdatePrintSettingsDto>({});
  const [bambuToken, setBambuToken] = useState("");
  const [newReseller, setNewReseller] = useState("");
  const [regenFor, setRegenFor] = useState<PrintReseller | null>(null);
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

  const handleSave = async () => {
    const ok = await onSave({
      ...form,
      wastePct:
        form.wastePct !== undefined ? Number(form.wastePct) / 100 : undefined,
    });
    if (ok) onClose();
  };

  const copyLink = async (reseller: PrintReseller) => {
    try {
      await navigator.clipboard.writeText(catalogUrl(reseller.token));
      toast.success(`Link de ${reseller.name} copiado`);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className={`${LY_BRAND_CLASS} max-w-md`}>
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

            <div className="space-y-2 rounded-lg border p-3">
              <Label className="flex items-center gap-1.5 text-sm">
                <Users className="h-4 w-4" />
                Revendedores
              </Label>
              <p className="text-xs text-muted-foreground">
                Cada uno entra al catálogo con su link y ve solo sus pedidos y
                su deuda. Todos pagan el mismo precio.
              </p>
              {resellers.map((r) => (
                <div key={r.id} className="space-y-1.5 rounded-md bg-muted/40 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-semibold ${r.active ? "" : "text-muted-foreground line-through"}`}
                    >
                      {r.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      className="h-7 px-2 text-xs"
                      disabled={isSubmitting}
                      onClick={() => onUpdateReseller(r.id, { active: !r.active })}
                    >
                      {r.active ? "Desactivar" : "Reactivar"}
                    </Button>
                  </div>
                  {r.active && (
                    <div className="flex items-center gap-2">
                      <Input
                        readOnly
                        value={catalogUrl(r.token)}
                        className="text-xs"
                        aria-label={`Link del catálogo de ${r.name}`}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={() => copyLink(r)}
                        aria-label={`Copiar el link de ${r.name}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          setRegenFor(r);
                          regenConfirm.confirm();
                        }}
                        aria-label={`Generar un link nuevo para ${r.name}`}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newReseller}
                  onChange={(e) => setNewReseller(e.target.value)}
                  placeholder="Nombre del revendedor nuevo"
                  aria-label="Nombre del revendedor nuevo"
                />
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  disabled={isSubmitting || !newReseller.trim()}
                  onClick={async () => {
                    const ok = await onCreateReseller(newReseller.trim());
                    if (ok) setNewReseller("");
                  }}
                  aria-label="Agregar revendedor"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {onConnectBambu && (
              <div className="space-y-1.5 rounded-lg border p-3">
                <Label className="flex items-center gap-1.5 text-sm">
                  <Printer className="h-4 w-4" />
                  Impresora (Bambu Cloud)
                </Label>
                {bambuStatus?.connected ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Conectada ✅ — las impresiones se sincronizan solas cada
                      30 min y descuentan el filamento del stock.
                      {bambuStatus.lastSyncAt &&
                        ` Último sync: ${new Date(bambuStatus.lastSyncAt).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}.`}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => onDisconnectBambu?.()}
                    >
                      <Unplug className="mr-1.5 h-3.5 w-3.5" />
                      Desconectar
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Pegá el token de tu sesión de Bambu: entrá a
                      makerworld.com logueado → DevTools → Application →
                      Cookies → copiá el valor de la cookie{" "}
                      <code className="rounded bg-muted px-1">token</code>.
                      Se guarda encriptado.
                    </p>
                    <Input
                      value={bambuToken}
                      onChange={(e) => setBambuToken(e.target.value)}
                      placeholder="Token de Bambu Cloud"
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      className="w-full"
                      type="button"
                      disabled={isSubmitting || !bambuToken.trim()}
                      onClick={async () => {
                        const ok = await onConnectBambu(bambuToken.trim());
                        if (ok) setBambuToken("");
                      }}
                    >
                      Conectar impresora
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={regenConfirm.open}
        onOpenChange={regenConfirm.onOpenChange}
        title="Generar un link nuevo?"
        description={`El link que tiene ${regenFor?.name ?? "el revendedor"} ahora deja de funcionar. Vas a tener que mandarle el nuevo.`}
        confirmLabel="Generar nuevo"
        destructive
        onConfirm={async () => {
          regenConfirm.onConfirm();
          if (regenFor) await onRegenerateResellerToken(regenFor.id);
        }}
      />
    </>
  );
}
