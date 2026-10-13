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
import { Plus, X } from "lucide-react";
import { fmtARS } from "@/lib/utils";
import type {
  PrintOrder,
  PrintOrderStatus,
  PrintProduct,
  PrintReseller,
} from "@/types/printing";

interface ItemRow {
  productId: string;
  qty: number;
  unitPrice: number | ""; // vacio = precio de reventa vigente
}

interface OrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  products: PrintProduct[];
  resellers: PrintReseller[];
  editingOrder?: PrintOrder | null;
  isSubmitting?: boolean;
  onCreate: (data: {
    resellerId?: string | null;
    customerName?: string;
    items: { productId: string; qty: number; unitPrice?: number }[];
    notes?: string;
    status?: PrintOrderStatus;
  }) => Promise<boolean>;
  onUpdate: (
    id: string,
    data: {
      resellerId?: string | null;
      customerName?: string;
      notes?: string;
      items?: { productId: string; qty: number; unitPrice?: number }[];
    },
  ) => Promise<boolean>;
}

/**
 * Alta/edicion manual de un pedido por Luciano (ej: un revendedor lo pidio
 * por WhatsApp, o es una venta directa sin revendedor). Si el pedido ya genero ventas, los items quedan bloqueados:
 * la plata se corrige desde Ventas.
 */
export default function OrderDialog({
  isOpen,
  onClose,
  products,
  resellers,
  editingOrder,
  isSubmitting,
  onCreate,
  onUpdate,
}: OrderDialogProps) {
  // "" = pedido suelto (venta directa): ahi el nombre se escribe a mano.
  const [resellerId, setResellerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<PrintOrderStatus>("pedido");
  const [items, setItems] = useState<ItemRow[]>([]);

  const hasSales = (editingOrder?.sales?.length ?? 0) > 0;
  const activeProducts = products.filter((p) => p.active);
  // Los desactivados solo aparecen si el pedido que se edita ya era suyo.
  const selectableResellers = resellers.filter(
    (r) => r.active || r.id === editingOrder?.resellerId,
  );

  useEffect(() => {
    if (!isOpen) return;
    if (editingOrder) {
      setResellerId(editingOrder.resellerId ?? "");
      setCustomerName(editingOrder.resellerId ? "" : editingOrder.customerName);
      setNotes(editingOrder.notes ?? "");
      setStatus(editingOrder.status);
      setItems(
        editingOrder.items.map((i) => ({
          productId: i.productId,
          qty: i.qty,
          unitPrice: i.unitPrice,
        })),
      );
    } else {
      setResellerId(resellers.find((r) => r.active)?.id ?? "");
      setCustomerName("");
      setNotes("");
      setStatus("pedido");
      setItems([
        { productId: activeProducts[0]?.id ?? "", qty: 1, unitPrice: "" },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editingOrder]);

  const validItems = items.filter((i) => i.productId && i.qty > 0);
  const total = validItems.reduce((a, i) => {
    const price =
      i.unitPrice !== ""
        ? Number(i.unitPrice)
        : (products.find((p) => p.id === i.productId)?.priceToMarcelito ?? 0);
    return a + price * i.qty;
  }, 0);

  const handleSave = async () => {
    if (!validItems.length && !editingOrder) return;
    const payloadItems = validItems.map((i) => ({
      productId: i.productId,
      qty: i.qty,
      ...(i.unitPrice !== "" ? { unitPrice: Number(i.unitPrice) } : {}),
    }));
    const customer = resellerId
      ? { resellerId }
      : { resellerId: null, customerName: customerName.trim() || undefined };
    const ok = editingOrder
      ? await onUpdate(editingOrder.id, {
          ...customer,
          notes,
          ...(hasSales ? {} : { items: payloadItems }),
        })
      : await onCreate({
          ...customer,
          items: payloadItems,
          notes: notes.trim() || undefined,
          status,
        });
    if (ok) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${LY_BRAND_CLASS} max-w-md`}>
        <DialogHeader>
          <DialogTitle>
            {editingOrder ? "Editar pedido" : "Nuevo pedido"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="o-reseller">Quién lo pide</Label>
            <select
              id="o-reseller"
              className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
              value={resellerId}
              onChange={(e) => setResellerId(e.target.value)}
            >
              {selectableResellers.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
              <option value="">Otro (venta directa)</option>
            </select>
            {!resellerId && (
              <Input
                id="o-customer"
                aria-label="Nombre del cliente"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nombre del cliente"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Productos</Label>
              {!hasSales && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() =>
                    setItems([
                      ...items,
                      { productId: activeProducts[0]?.id ?? "", qty: 1, unitPrice: "" },
                    ])
                  }
                >
                  <Plus className="mr-0.5 h-3.5 w-3.5" />
                  Item
                </Button>
              )}
            </div>
            {hasSales && (
              <p className="rounded bg-muted/50 px-2 py-1 text-[11px] text-muted-foreground">
                Este pedido ya generó ventas: los productos y montos se
                corrigen desde la tab Ventas.
              </p>
            )}
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <select
                  aria-label="Producto"
                  disabled={hasSales}
                  className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-60"
                  value={item.productId}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...next[i], productId: e.target.value };
                    setItems(next);
                  }}
                >
                  {activeProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({fmtARS(p.priceToMarcelito)})
                    </option>
                  ))}
                </select>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  disabled={hasSales}
                  value={item.qty || ""}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...next[i], qty: Number(e.target.value) };
                    setItems(next);
                  }}
                  className="w-16"
                  aria-label="Cantidad"
                />
                {!hasSales && items.length > 1 && (
                  <button
                    type="button"
                    aria-label="Sacar item"
                    className="p-1 text-muted-foreground hover:text-destructive"
                    onClick={() => setItems(items.filter((_, j) => j !== i))}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {!hasSales && (
              <p className="text-[11px] text-muted-foreground">
                Precio: el de reventa vigente (se congela al crear el pedido).
              </p>
            )}
          </div>

          {!editingOrder && (
            <div className="space-y-1.5">
              <Label htmlFor="o-status">Estado inicial</Label>
              <select
                id="o-status"
                className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as PrintOrderStatus)}
              >
                <option value="pedido">Pedido</option>
                <option value="confirmado">Confirmado</option>
                <option value="imprimiendo">Imprimiendo</option>
                <option value="listo">Listo</option>
                <option value="entregado">Entregado (crea la venta a liquidar)</option>
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="o-notes">Notas</Label>
            <Input
              id="o-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: lo pidió por WhatsApp, para el sábado"
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSave}
            disabled={isSubmitting || (!editingOrder && !validItems.length)}
          >
            {editingOrder
              ? "Guardar cambios"
              : `Crear pedido${total > 0 ? ` · ${fmtARS(total)}` : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
