"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { fmtARS } from "@/lib/utils";
import { ShoppingBag, Plus, Trash2, CheckCircle2 } from "lucide-react";
import SaleDialog from "./SaleDialog";
import type { CreatePrintSaleDto, PrintProduct, PrintSale } from "@/types/printing";

interface SalesTabProps {
  sales: PrintSale[];
  products: PrintProduct[];
  isSubmitting: boolean;
  onCreate: (data: CreatePrintSaleDto) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onLiquidar: (id: string) => Promise<boolean>;
}

export default function SalesTab({
  sales,
  products,
  isSubmitting,
  onCreate,
  onDelete,
  onLiquidar,
}: SalesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const deleteConfirm = useConfirm<PrintSale>();

  const pendingTotal = sales
    .filter((s) => s.kind === "venta" && s.status === "a_liquidar")
    .reduce((a, s) => a + s.qty * s.chargedUnit, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-sm font-semibold text-muted-foreground">
          {sales.length} movimiento{sales.length === 1 ? "" : "s"}
          {pendingTotal > 0 && ` · Marcelito debe ${fmtARS(pendingTotal)}`}
        </h2>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Venta
        </Button>
      </div>

      {sales.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Sin ventas todavia"
          description="Registrá la primera venta o muestra."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Registrar
            </Button>
          }
        />
      ) : (
        <div className="space-y-1.5">
          {sales.map((s) => {
            const total = s.qty * s.chargedUnit;
            const [, m, d] = s.date.split("-");
            return (
              <Card
                key={s.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-base">
                  {s.kind === "muestra" ? "🎁" : "🖨️"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {s.qty}x {s.product?.name ?? "Producto"}
                  </div>
                  <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                    <span>{d}/{m}</span>
                    {s.channel && <span>· {s.channel}</span>}
                    {s.kind === "venta" ? (
                      <Badge
                        variant={s.status === "liquidado" ? "success" : "warning"}
                        className="ml-0.5"
                      >
                        {s.status === "liquidado" ? "liquidado" : "a liquidar"}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-0.5">
                        muestra
                      </Badge>
                    )}
                  </div>
                </div>
                <span
                  className={`shrink-0 font-mono text-sm font-bold tabular-nums ${
                    s.kind === "muestra" ? "text-muted-foreground" : ""
                  }`}
                >
                  {s.kind === "muestra" ? "regalada" : fmtARS(total)}
                </span>
                <div className="flex shrink-0 items-center gap-0.5">
                  {s.kind === "venta" && s.status === "a_liquidar" && (
                    <ActionIconButton
                      icon={CheckCircle2}
                      aria-label="Liquidar venta"
                      onClick={() => onLiquidar(s.id)}
                    />
                  )}
                  <ActionIconButton
                    icon={Trash2}
                    variant="destructive"
                    aria-label="Borrar movimiento"
                    onClick={() => deleteConfirm.confirm(s)}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <SaleDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={onCreate}
        products={products}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={deleteConfirm.onOpenChange}
        title="Borrar este movimiento?"
        description={
          deleteConfirm.payload?.status === "liquidado"
            ? "Ya estaba liquidado: tambien se borra el ingreso que generó."
            : undefined
        }
        destructive
        confirmLabel="Borrar"
        onConfirm={() => {
          deleteConfirm.onConfirm();
          if (deleteConfirm.payload) onDelete(deleteConfirm.payload.id);
        }}
      />
    </div>
  );
}
