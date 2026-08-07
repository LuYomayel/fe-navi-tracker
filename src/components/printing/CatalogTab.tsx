"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { fmtARS } from "@/lib/utils";
import { Package, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import ProductDialog from "./ProductDialog";
import type { CreatePrintProductDto, PrintProduct } from "@/types/printing";

interface CatalogTabProps {
  products: PrintProduct[];
  isSubmitting: boolean;
  onCreate: (data: CreatePrintProductDto) => Promise<boolean>;
  onUpdate: (id: string, data: CreatePrintProductDto) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function CatalogTab({
  products,
  isSubmitting,
  onCreate,
  onUpdate,
  onDelete,
}: CatalogTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PrintProduct | null>(null);
  const deleteConfirm = useConfirm<PrintProduct>();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {products.length} producto{products.length === 1 ? "" : "s"}
        </h2>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Producto
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Sin productos todavia"
          description="Cargá el primer diseño del catálogo (nombre, gramos, horas)."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Cargar producto
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <Card key={p.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-semibold">
                      {p.name}
                    </span>
                    {!p.active && (
                      <Badge variant="outline" className="shrink-0">
                        inactivo
                      </Badge>
                    )}
                    {!p.licenseOk && (
                      <Badge variant="warning" className="shrink-0">
                        sin licencia
                      </Badge>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {p.author && `${p.author} · `}
                    {p.grams}g · {p.hours}h · {p.colorsLabel} color
                    {p.colorsLabel === "1" ? "" : "es"}
                    {p.sizeMm ? ` · ${p.sizeMm}` : ""}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {p.makerworldUrl && (
                    <ActionIconButton
                      icon={ExternalLink}
                      aria-label="Ver en MakerWorld"
                      onClick={() => window.open(p.makerworldUrl!, "_blank")}
                    />
                  )}
                  <ActionIconButton
                    icon={Pencil}
                    aria-label="Editar producto"
                    onClick={() => {
                      setEditing(p);
                      setDialogOpen(true);
                    }}
                  />
                  <ActionIconButton
                    icon={Trash2}
                    variant="destructive"
                    aria-label="Borrar producto"
                    onClick={() => deleteConfirm.confirm(p)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-muted/50 p-1.5">
                  <div className="text-[10px] text-muted-foreground">
                    Costo real
                  </div>
                  <div className="font-mono text-xs font-bold tabular-nums">
                    {fmtARS(p.cost)}
                  </div>
                </div>
                <div className="rounded-md bg-muted/50 p-1.5">
                  <div className="text-[10px] text-muted-foreground">
                    A Marcelito
                  </div>
                  <div className="font-mono text-xs font-bold tabular-nums">
                    {fmtARS(p.priceToMarcelito)}
                  </div>
                </div>
                <div className="rounded-md bg-success/10 p-1.5">
                  <div className="text-[10px] text-muted-foreground">
                    Ganancia
                  </div>
                  <div className="font-mono text-xs font-bold tabular-nums text-success">
                    {fmtARS(p.profit)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ProductDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={(data) =>
          editing ? onUpdate(editing.id, data) : onCreate(data)
        }
        editingProduct={editing}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={deleteConfirm.onOpenChange}
        title={`Borrar "${deleteConfirm.payload?.name}"?`}
        description="Se borra del catálogo. Las ventas ya cargadas de este producto no se tocan."
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
