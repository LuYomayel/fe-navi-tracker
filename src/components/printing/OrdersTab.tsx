"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { fmtARS } from "@/lib/utils";
import { Inbox, Trash2, ArrowRight, HandCoins, X, Check } from "lucide-react";
import type {
  PrintOrder,
  PrintOrderStatus,
  PrintPaymentNotice,
} from "@/types/printing";

interface OrdersTabProps {
  orders: PrintOrder[];
  notices: PrintPaymentNotice[];
  isSubmitting: boolean;
  onUpdateStatus: (id: string, status: PrintOrderStatus) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onResolveNotice: (
    id: string,
    status: "confirmado" | "descartado",
  ) => Promise<boolean>;
}

/** Siguiente paso natural de cada estado (un solo botón grande). */
const NEXT_STATUS: Partial<
  Record<PrintOrderStatus, { next: PrintOrderStatus; label: string }>
> = {
  pedido: { next: "confirmado", label: "Confirmar" },
  confirmado: { next: "imprimiendo", label: "Imprimiendo" },
  imprimiendo: { next: "listo", label: "Listo" },
  listo: { next: "entregado", label: "Entregado" },
};

const STATUS_BADGE: Record<
  PrintOrderStatus,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "info" | "destructive" | "outline" }
> = {
  pedido: { label: "nuevo pedido", variant: "warning" },
  confirmado: { label: "confirmado", variant: "info" },
  imprimiendo: { label: "imprimiendo", variant: "info" },
  listo: { label: "listo para entregar", variant: "success" },
  entregado: { label: "entregado", variant: "secondary" },
  cancelado: { label: "cancelado", variant: "destructive" },
};

/**
 * Pedidos que llegan del catalogo publico de Marcelito + avisos de pago.
 * Al marcar "Entregado" se crean las ventas a liquidar (una por item).
 */
export default function OrdersTab({
  orders,
  notices,
  isSubmitting,
  onUpdateStatus,
  onDelete,
  onResolveNotice,
}: OrdersTabProps) {
  const deleteConfirm = useConfirm<PrintOrder>();
  const cancelConfirm = useConfirm<PrintOrder>();

  const active = orders.filter(
    (o) => o.status !== "entregado" && o.status !== "cancelado",
  );
  const done = orders.filter(
    (o) => o.status === "entregado" || o.status === "cancelado",
  );

  const renderOrder = (o: PrintOrder) => {
    const total = o.items.reduce((a, i) => a + i.qty * i.unitPrice, 0);
    const next = NEXT_STATUS[o.status];
    const badge = STATUS_BADGE[o.status];
    const createdDate = new Date(o.createdAt);
    return (
      <Card key={o.id} className="space-y-2 rounded-lg border p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold">{o.customerName}</span>
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {createdDate.toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "2-digit",
              })}{" "}
              {createdDate.toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
          <span className="shrink-0 font-mono text-sm font-bold tabular-nums">
            {fmtARS(total)}
          </span>
        </div>

        <ul className="space-y-0.5 text-xs">
          {o.items.map((i) => (
            <li key={i.id} className="flex justify-between">
              <span className="min-w-0 truncate">
                {i.qty}x {i.product?.name ?? "producto"}
              </span>
              <span className="font-mono tabular-nums text-muted-foreground">
                {fmtARS(i.qty * i.unitPrice)}
              </span>
            </li>
          ))}
        </ul>
        {o.notes && (
          <p className="rounded bg-muted/50 px-2 py-1 text-xs text-muted-foreground">
            “{o.notes}”
          </p>
        )}

        {next && (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              className="flex-1"
              disabled={isSubmitting}
              onClick={() => onUpdateStatus(o.id, next.next)}
            >
              <ArrowRight className="mr-1 h-3.5 w-3.5" />
              {next.label}
            </Button>
            <ActionIconButton
              icon={Trash2}
              variant="destructive"
              aria-label="Cancelar pedido"
              onClick={() => cancelConfirm.confirm(o)}
            />
          </div>
        )}
        {o.status === "cancelado" && (
          <div className="flex justify-end">
            <ActionIconButton
              icon={Trash2}
              variant="destructive"
              aria-label="Borrar pedido"
              onClick={() => deleteConfirm.confirm(o)}
            />
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-3">
      {/* Avisos de pago de Marcelito, arriba de todo */}
      {notices.length > 0 && (
        <div className="space-y-1.5">
          {notices.map((n) => (
            <Card
              key={n.id}
              className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3"
            >
              <HandCoins className="h-4 w-4 shrink-0 text-warning-foreground dark:text-warning" />
              <div className="min-w-0 flex-1 text-xs">
                <span className="font-semibold">
                  Aviso de pago{n.amount ? `: ${fmtARS(n.amount)}` : ""}
                </span>
                {n.message && (
                  <span className="text-muted-foreground"> · “{n.message}”</span>
                )}
                <div className="text-[10px] text-muted-foreground">
                  Registrá el pago en la venta (Ventas → 🤲) y confirmá acá
                </div>
              </div>
              <div className="flex shrink-0 gap-0.5">
                <ActionIconButton
                  icon={Check}
                  aria-label="Confirmar aviso"
                  onClick={() => onResolveNotice(n.id, "confirmado")}
                />
                <ActionIconButton
                  icon={X}
                  variant="destructive"
                  aria-label="Descartar aviso"
                  onClick={() => onResolveNotice(n.id, "descartado")}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {orders.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Sin pedidos todavia"
          description="Cuando Marcelito arme un pedido desde su link, aparece acá."
        />
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-2">{active.map(renderOrder)}</div>
          )}
          {done.length > 0 && (
            <div className="space-y-2">
              <h3 className="pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Historial
              </h3>
              {done.map(renderOrder)}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={cancelConfirm.open}
        onOpenChange={cancelConfirm.onOpenChange}
        title="¿Cancelar este pedido?"
        description="Marcelito lo va a ver como cancelado en su link."
        destructive
        confirmLabel="Cancelar pedido"
        onConfirm={() => {
          cancelConfirm.onConfirm();
          if (cancelConfirm.payload)
            onUpdateStatus(cancelConfirm.payload.id, "cancelado");
        }}
      />
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={deleteConfirm.onOpenChange}
        title="¿Borrar este pedido?"
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
