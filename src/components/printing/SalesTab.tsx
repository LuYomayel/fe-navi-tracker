"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { fmtARS } from "@/lib/utils";
import { ShoppingBag, Plus, Trash2, HandCoins } from "lucide-react";
import SaleDialog from "./SaleDialog";
import SettleDialog from "./SettleDialog";
import PorCobrarCard from "./PorCobrarCard";
import type {
  AddSettlementDto,
  CreatePrintSaleDto,
  PrintProduct,
  PrintSale,
  Receivables,
} from "@/types/printing";

interface SalesTabProps {
  sales: PrintSale[];
  products: PrintProduct[];
  receivables?: Receivables;
  isSubmitting: boolean;
  onCreate: (data: CreatePrintSaleDto) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onAddSettlement: (saleId: string, data: AddSettlementDto) => Promise<boolean>;
  onDeleteSettlement: (id: string) => Promise<boolean>;
}

export default function SalesTab({
  sales,
  products,
  receivables,
  isSubmitting,
  onCreate,
  onDelete,
  onAddSettlement,
  onDeleteSettlement,
}: SalesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settling, setSettling] = useState<PrintSale | null>(null);
  const deleteConfirm = useConfirm<PrintSale>();

  return (
    <div className="space-y-3">
      {receivables && <PorCobrarCard receivables={receivables} />}

      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-sm font-semibold text-muted-foreground">
          {sales.length} movimiento{sales.length === 1 ? "" : "s"}
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
                        variant={
                          s.status === "liquidado"
                            ? "success"
                            : s.status === "parcial"
                              ? "info"
                              : "warning"
                        }
                        className="ml-0.5"
                      >
                        {s.status === "liquidado"
                          ? "liquidado"
                          : s.status === "parcial"
                            ? `cobrado ${fmtARS(s.settledAmount)} · restan ${fmtARS(s.remaining)}`
                            : "a liquidar"}
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
                  {s.kind === "venta" && (s.remaining ?? 0) > 0 && (
                    <ActionIconButton
                      icon={HandCoins}
                      aria-label="Registrar pago"
                      onClick={() => setSettling(s)}
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

      <SettleDialog
        isOpen={settling !== null}
        onClose={() => setSettling(null)}
        sale={settling ? (sales.find((x) => x.id === settling.id) ?? settling) : null}
        isSubmitting={isSubmitting}
        onAdd={onAddSettlement}
        onDeleteSettlement={onDeleteSettlement}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={deleteConfirm.onOpenChange}
        title="Borrar este movimiento?"
        description={
          deleteConfirm.payload && deleteConfirm.payload.settledAmount > 0
            ? "Tiene pagos registrados: tambien se borran los ingresos que generaron."
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
