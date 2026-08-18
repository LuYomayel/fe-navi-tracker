"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { fmtARS } from "@/lib/utils";
import {
  Inbox,
  Trash2,
  ArrowRight,
  HandCoins,
  X,
  Check,
  Plus,
  Pencil,
} from "lucide-react";
import OrderDialog from "./OrderDialog";
import type {
  PrintOrder,
  PrintOrderStatus,
  PrintPaymentNotice,
  PrintProduct,
  PrintSale,
} from "@/types/printing";

interface OrdersTabProps {
  orders: PrintOrder[];
  notices: PrintPaymentNotice[];
  products: PrintProduct[];
  isSubmitting: boolean;
  onUpdateStatus: (id: string, status: PrintOrderStatus) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onCreate: (data: {
    customerName?: string;
    items: { productId: string; qty: number; unitPrice?: number }[];
    notes?: string;
    status?: PrintOrderStatus;
  }) => Promise<boolean>;
  onUpdate: (
    id: string,
    data: {
      customerName?: string;
      notes?: string;
      items?: { productId: string; qty: number; unitPrice?: number }[];
    },
  ) => Promise<boolean>;
  onPay: (id: string, amount?: number) => Promise<boolean>;
  onResolveNotice: (
    id: string,
    status: "confirmado" | "descartado",
  ) => Promise<boolean>;
}

/** Siguiente paso natural (boton grande); el resto va por el selector. */
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
  {
    label: string;
    variant:
      | "default"
      | "secondary"
      | "success"
      | "warning"
      | "info"
      | "destructive"
      | "outline";
  }
> = {
  pedido: { label: "nuevo pedido", variant: "warning" },
  confirmado: { label: "confirmado", variant: "info" },
  imprimiendo: { label: "imprimiendo", variant: "info" },
  listo: { label: "listo para entregar", variant: "success" },
  entregado: { label: "entregado", variant: "secondary" },
  cancelado: { label: "cancelado", variant: "destructive" },
};

const ALL_STATUSES: PrintOrderStatus[] = [
  "pedido",
  "confirmado",
  "imprimiendo",
  "listo",
  "entregado",
  "cancelado",
];

/** Cobrado/adeudado de un pedido desde sus ventas (legacy-aware). */
function paymentInfo(o: PrintOrder): { paid: number; due: number } {
  const ventas = (o.sales ?? []).filter((s: PrintSale) => s.kind === "venta");
  let paid = 0;
  let due = 0;
  for (const s of ventas) {
    const total = s.qty * s.chargedUnit;
    const fromSettlements = (s.settlements ?? []).reduce(
      (a, st) => a + st.amount,
      0,
    );
    const settled =
      s.status === "liquidado" && !s.settlements?.length && s.incomeId
        ? total
        : fromSettlements;
    paid += settled;
    due += Math.max(0, total - settled);
  }
  return { paid, due };
}

/**
 * Pedidos (del link de Marcelito o cargados a mano) + avisos de pago.
 * El pedido es el ENCARGO; la venta linkeada es la plata. Entregar crea la
 * venta; retroceder/cancelar/borrar la limpia si no tiene pagos.
 */
export default function OrdersTab({
  orders,
  notices,
  products,
  isSubmitting,
  onUpdateStatus,
  onDelete,
  onCreate,
  onUpdate,
  onPay,
  onResolveNotice,
}: OrdersTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PrintOrder | null>(null);
  const deleteConfirm = useConfirm<PrintOrder>();
  const payConfirm = useConfirm<PrintOrder>();
  const noticeConfirm = useConfirm<PrintPaymentNotice>();

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
    const { paid, due } = paymentInfo(o);
    const delivered = o.status === "entregado";
    return (
      <Card key={o.id} className="space-y-2 rounded-lg border p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold">{o.customerName}</span>
              <Badge variant={badge.variant}>{badge.label}</Badge>
              {delivered &&
                (due <= 0 ? (
                  <Badge variant="success">pagado</Badge>
                ) : paid > 0 ? (
                  <Badge variant="info">
                    cobrado {fmtARS(paid)} · debe {fmtARS(due)}
                  </Badge>
                ) : (
                  <Badge variant="warning">debe {fmtARS(due)}</Badge>
                ))}
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

        <div className="flex items-center gap-1.5">
          {next && (
            <Button
              size="sm"
              className="flex-1"
              disabled={isSubmitting}
              onClick={() => onUpdateStatus(o.id, next.next)}
            >
              <ArrowRight className="mr-1 h-3.5 w-3.5" />
              {next.label}
            </Button>
          )}
          {delivered && due > 0 && (
            <Button
              size="sm"
              className="flex-1"
              disabled={isSubmitting}
              onClick={() => payConfirm.confirm(o)}
            >
              <HandCoins className="mr-1 h-3.5 w-3.5" />
              Cobrar {fmtARS(due)}
            </Button>
          )}
          {/* Salto libre de estado (lo que sea, cuando sea) */}
          <select
            aria-label="Cambiar estado"
            className="h-8 w-8 cursor-pointer appearance-none rounded-md border border-input bg-transparent text-center text-sm text-muted-foreground"
            value=""
            disabled={isSubmitting}
            onChange={(e) => {
              if (e.target.value)
                onUpdateStatus(o.id, e.target.value as PrintOrderStatus);
            }}
          >
            <option value="">⋯</option>
            {ALL_STATUSES.filter((st) => st !== o.status).map((st) => (
              <option key={st} value={st}>
                → {STATUS_BADGE[st].label}
              </option>
            ))}
          </select>
          <ActionIconButton
            icon={Pencil}
            aria-label="Editar pedido"
            onClick={() => {
              setEditing(o);
              setDialogOpen(true);
            }}
          />
          <ActionIconButton
            icon={Trash2}
            variant="destructive"
            aria-label="Borrar pedido"
            onClick={() => deleteConfirm.confirm(o)}
          />
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {orders.length} pedido{orders.length === 1 ? "" : "s"}
        </h2>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Pedido
        </Button>
      </div>

      {/* Avisos de pago de Marcelito: confirmar REGISTRA el pago */}
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
                  Avisó que pagó{n.amount ? ` ${fmtARS(n.amount)}` : " (todo el pedido)"}
                </span>
                {n.message && (
                  <span className="text-muted-foreground"> · “{n.message}”</span>
                )}
                <div className="text-[10px] text-muted-foreground">
                  Confirmar registra el pago y le baja la deuda
                </div>
              </div>
              <div className="flex shrink-0 gap-0.5">
                <Button
                  size="sm"
                  className="h-8 px-2.5 text-xs"
                  disabled={isSubmitting}
                  onClick={() => noticeConfirm.confirm(n)}
                >
                  <Check className="mr-1 h-3.5 w-3.5" />
                  Confirmar
                </Button>
                <ActionIconButton
                  icon={X}
                  variant="destructive"
                  aria-label="Descartar aviso (no registra nada)"
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
          description="Los pedidos de Marcelito llegan solos desde su link, o cargá uno vos con +."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Nuevo pedido
            </Button>
          }
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

      <OrderDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        products={products}
        editingOrder={
          editing ? (orders.find((o) => o.id === editing.id) ?? editing) : null
        }
        isSubmitting={isSubmitting}
        onCreate={onCreate}
        onUpdate={onUpdate}
      />

      <ConfirmDialog
        open={payConfirm.open}
        onOpenChange={payConfirm.onOpenChange}
        title={`¿Cobrar ${fmtARS(payConfirm.payload ? paymentInfo(payConfirm.payload).due : 0)}?`}
        description="Registra el pago completo de lo que falta de este pedido y crea el ingreso. Para un pago parcial usá la venta (Ventas → 🤲)."
        confirmLabel="Cobrar"
        onConfirm={() => {
          payConfirm.onConfirm();
          if (payConfirm.payload) onPay(payConfirm.payload.id);
        }}
      />

      <ConfirmDialog
        open={noticeConfirm.open}
        onOpenChange={noticeConfirm.onOpenChange}
        title={
          noticeConfirm.payload?.amount
            ? `¿Confirmar el pago de ${fmtARS(noticeConfirm.payload.amount)}?`
            : "¿Confirmar el pago de todo el pedido?"
        }
        description="Se registra el pago, se crea el ingreso y a Marcelito le baja la deuda."
        confirmLabel="Confirmar pago"
        onConfirm={() => {
          noticeConfirm.onConfirm();
          if (noticeConfirm.payload)
            onResolveNotice(noticeConfirm.payload.id, "confirmado");
        }}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={deleteConfirm.onOpenChange}
        title="¿Borrar este pedido?"
        description="Si generó ventas sin pagos, se borran junto con el pedido. Con pagos registrados no se puede (borrá los pagos primero)."
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
