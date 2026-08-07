"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { fmtARS } from "@/lib/utils";
import { Boxes, Plus, Pencil, Trash2 } from "lucide-react";
import FilamentDialog from "./FilamentDialog";
import type { CreateFilamentDto, Filament } from "@/types/printing";

interface FilamentsTabProps {
  filaments: Filament[];
  isSubmitting: boolean;
  onCreate: (data: CreateFilamentDto) => Promise<boolean>;
  onUpdate: (id: string, data: CreateFilamentDto) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function FilamentsTab({
  filaments,
  isSubmitting,
  onCreate,
  onUpdate,
  onDelete,
}: FilamentsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Filament | null>(null);
  const deleteConfirm = useConfirm<Filament>();

  const total = filaments.reduce((a, f) => a + f.pricePaid, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {filaments.length} compra{filaments.length === 1 ? "" : "s"} ·{" "}
          {fmtARS(total)}
        </h2>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Filamento
        </Button>
      </div>

      {filaments.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="Sin filamento cargado"
          description="Registrá tu primera compra de filamento."
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Cargar filamento
            </Button>
          }
        />
      ) : (
        <div className="space-y-1.5">
          {filaments.map((f) => {
            const [, m, d] = f.purchasedAt.split("-");
            return (
              <Card
                key={f.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-base">
                  🧵
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-semibold">
                      {f.brand} {f.material} {f.color}
                    </span>
                    {f.discarded && (
                      <Badge variant="destructive" className="shrink-0">
                        descartado
                      </Badge>
                    )}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {d}/{m} · {fmtARS(f.pricePerGram)}/g · {f.grams}g
                    {f.notes ? ` · ${f.notes}` : ""}
                    {f.discarded && f.discardReason
                      ? ` · ${f.discardReason}`
                      : ""}
                  </div>
                </div>
                <span className="shrink-0 font-mono text-sm font-bold tabular-nums">
                  {fmtARS(f.pricePaid)}
                </span>
                <div className="flex shrink-0 items-center gap-0.5">
                  <ActionIconButton
                    icon={Pencil}
                    aria-label="Editar filamento"
                    onClick={() => {
                      setEditing(f);
                      setDialogOpen(true);
                    }}
                  />
                  <ActionIconButton
                    icon={Trash2}
                    variant="destructive"
                    aria-label="Borrar filamento"
                    onClick={() => deleteConfirm.confirm(f)}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <FilamentDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={(data) =>
          editing ? onUpdate(editing.id, data) : onCreate(data)
        }
        editingFilament={editing}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={deleteConfirm.onOpenChange}
        title={`Borrar ${deleteConfirm.payload?.brand} ${deleteConfirm.payload?.color}?`}
        description="Tambien se borra el gasto de inversión que se creó junto con la compra."
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
