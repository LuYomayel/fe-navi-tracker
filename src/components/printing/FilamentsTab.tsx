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
  Boxes,
  Plus,
  Pencil,
  Trash2,
  PackageX,
  Printer,
  RefreshCw,
  GraduationCap,
} from "lucide-react";
import FilamentDialog from "./FilamentDialog";
import PrintJobDialog from "./PrintJobDialog";
import type {
  CreateFilamentDto,
  CreatePrintJobDto,
  Filament,
  PrintJob,
  PrintProduct,
  StockSummary,
  BambuStatus,
} from "@/types/printing";

interface FilamentsTabProps {
  filaments: Filament[];
  stock: StockSummary | null;
  jobs: PrintJob[];
  products: PrintProduct[];
  bambuStatus: BambuStatus | null;
  isSubmitting: boolean;
  onCreate: (data: CreateFilamentDto) => Promise<boolean>;
  onUpdate: (id: string, data: CreateFilamentDto) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onFinish: (id: string) => Promise<boolean>;
  onCreateJob: (data: CreatePrintJobDto) => Promise<boolean>;
  onDeleteJob: (id: string) => Promise<boolean>;
  onLinkJob: (id: string, productId: string | null) => Promise<boolean>;
  onLearnJob: (id: string, units: number) => Promise<boolean>;
  onSyncBambu: () => Promise<boolean>;
}

export default function FilamentsTab({
  filaments,
  stock,
  jobs,
  products,
  bambuStatus,
  isSubmitting,
  onCreate,
  onUpdate,
  onDelete,
  onFinish,
  onCreateJob,
  onDeleteJob,
  onLinkJob,
  onLearnJob,
  onSyncBambu,
}: FilamentsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Filament | null>(null);
  const [learning, setLearning] = useState<PrintJob | null>(null);
  const [learnUnits, setLearnUnits] = useState(1);
  const deleteConfirm = useConfirm<Filament>();
  const finishConfirm = useConfirm<Filament>();
  const deleteJobConfirm = useConfirm<PrintJob>();

  const total = filaments.reduce((a, f) => a + f.pricePaid, 0);

  return (
    <div className="space-y-4">
      {/* ── Stock por color ── */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Stock por color
        </h2>
        {!stock || stock.colors.length === 0 ? (
          <Card className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            Sin stock trackeado. Editá cada rollo activo y cargale los gramos
            que le quedan — de ahí en más las impresiones lo descuentan solas.
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {stock.colors.map((c) => {
              const low = c.totalGrams < 200;
              return (
                <Card
                  key={c.color}
                  className={`rounded-lg border p-2.5 ${low ? "border-warning/50" : ""}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full border border-border"
                      style={{
                        backgroundColor: c.colorHex ? `#${c.colorHex}` : undefined,
                      }}
                    />
                    <span className="truncate text-xs font-semibold capitalize">
                      {c.color}
                    </span>
                  </div>
                  <div className="mt-0.5 font-mono text-sm font-bold tabular-nums">
                    {Math.round(c.totalGrams)}g
                    {low && (
                      <span className="ml-1 text-[10px] font-normal text-warning-foreground dark:text-warning">
                        · comprar
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {c.rolls.length} rollo{c.rolls.length === 1 ? "" : "s"}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        {stock && stock.untrackedRolls > 0 && (
          <p className="text-[11px] text-muted-foreground">
            ⚠️ {stock.untrackedRolls} rollo(s) activos sin gramos cargados: no
            suman al stock. Editálos y poneles cuánto les queda.
          </p>
        )}
      </div>

      {/* ── Impresiones ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Impresiones
            {bambuStatus?.connected && (
              <Badge variant="success" className="ml-1.5">
                Bambu conectada
              </Badge>
            )}
          </h2>
          <div className="flex items-center gap-1.5">
            {bambuStatus?.connected && (
              <Button
                size="sm"
                variant="outline"
                disabled={isSubmitting}
                onClick={onSyncBambu}
              >
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                Sync
              </Button>
            )}
            <Button size="sm" onClick={() => setJobDialogOpen(true)}>
              <Printer className="mr-1 h-3.5 w-3.5" />
              Impresión
            </Button>
          </div>
        </div>
        {jobs.length === 0 ? (
          <Card className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            Registrá cada impresión (o conectá la Bambu desde el engranaje) y
            el filamento usado se descuenta del stock solo.
          </Card>
        ) : (
          <div className="space-y-1.5">
            {jobs.slice(0, 10).map((j) => {
              const [, m, d] = j.date.split("-");
              return (
                <Card
                  key={j.id}
                  className="flex items-center gap-2.5 rounded-lg border p-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-sm">
                    {j.source === "bambu" ? "☁️" : "🖨️"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold">
                      {j.title}
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {d}/{m}
                      {j.grams ? ` · ${Math.round(j.grams)}g` : ""}
                      {j.hours ? ` · ${j.hours}h` : ""}
                      {j.product ? ` · ${j.product.name}` : ""}
                      {!j.stockApplied ? " · sin descontar" : ""}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    {!j.productId && (
                      <select
                        aria-label="Linkear a producto"
                        className="h-7 w-7 cursor-pointer appearance-none rounded-md border border-input bg-transparent text-center text-xs text-muted-foreground"
                        value=""
                        onChange={(e) =>
                          e.target.value && onLinkJob(j.id, e.target.value)
                        }
                      >
                        <option value="">🔗</option>
                        {products
                          .filter((p) => p.active)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                      </select>
                    )}
                    {j.productId && (j.filamentsUsed?.length ?? 0) > 0 && (
                      <ActionIconButton
                        icon={GraduationCap}
                        aria-label="Aprender consumo para el producto"
                        onClick={() => {
                          setLearning(j);
                          setLearnUnits(1);
                        }}
                      />
                    )}
                    <ActionIconButton
                      icon={Trash2}
                      variant="destructive"
                      aria-label="Borrar impresión"
                      onClick={() => deleteJobConfirm.confirm(j)}
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Compras de filamento ── */}
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
                    {f.finishedAt && !f.discarded && (
                      <Badge variant="outline" className="shrink-0">
                        terminado
                      </Badge>
                    )}
                    {!f.discarded && !f.finishedAt && f.gramsLeft != null && (
                      <Badge
                        variant={f.gramsLeft < 150 ? "warning" : "secondary"}
                        className="shrink-0"
                      >
                        quedan {Math.round(f.gramsLeft)}g
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
                  {!f.discarded && !f.finishedAt && (
                    <ActionIconButton
                      icon={PackageX}
                      aria-label="Marcar rollo terminado"
                      onClick={() => finishConfirm.confirm(f)}
                    />
                  )}
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

      <PrintJobDialog
        isOpen={jobDialogOpen}
        onClose={() => setJobDialogOpen(false)}
        onSave={onCreateJob}
        products={products}
        stock={stock}
        isSubmitting={isSubmitting}
      />

      <ConfirmDialog
        open={finishConfirm.open}
        onOpenChange={finishConfirm.onOpenChange}
        title={`¿Se terminó el ${finishConfirm.payload?.brand} ${finishConfirm.payload?.color}?`}
        description="Queda registrado como agotado y sale del stock."
        confirmLabel="Sí, se terminó"
        onConfirm={() => {
          finishConfirm.onConfirm();
          if (finishConfirm.payload) onFinish(finishConfirm.payload.id);
        }}
      />

      <ConfirmDialog
        open={deleteJobConfirm.open}
        onOpenChange={deleteJobConfirm.onOpenChange}
        title={`¿Borrar la impresión "${deleteJobConfirm.payload?.title}"?`}
        description="El filamento que había descontado vuelve al stock."
        destructive
        confirmLabel="Borrar"
        onConfirm={() => {
          deleteJobConfirm.onConfirm();
          if (deleteJobConfirm.payload) onDeleteJob(deleteJobConfirm.payload.id);
        }}
      />

      <ConfirmDialog
        open={learning !== null}
        onOpenChange={(o) => !o && setLearning(null)}
        title={`¿Cuántas unidades salieron de "${learning?.title}"?`}
        description="El consumo por color se divide por las unidades y queda guardado en el producto para el chequeo de stock."
        confirmLabel="Guardar consumo"
        onConfirm={() => {
          if (learning) onLearnJob(learning.id, learnUnits);
          setLearning(null);
        }}
      >
        <input
          type="number"
          min={1}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={learnUnits}
          onChange={(e) => setLearnUnits(Math.max(1, Number(e.target.value)))}
        />
      </ConfirmDialog>

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
