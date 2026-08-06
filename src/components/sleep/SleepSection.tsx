"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import { getDateKey } from "@/lib/utils";
import { Moon, Plus, Trash2, Watch } from "lucide-react";

export interface SleepLog {
  id: string;
  date: string;
  minutesAsleep: number;
  bedTime?: string | null;
  wakeTime?: string | null;
  quality?: number | null;
  deepMinutes?: number | null;
  remMinutes?: number | null;
  heartRateAvg?: number | null;
  source: string;
}

interface SleepStats {
  noches: number;
  promedioMinutos: number;
  promedioTexto: string;
  calidadPromedio: number | null;
  mejorNoche: SleepLog | null;
  peorNoche: SleepLog | null;
  logs: SleepLog[];
}

const fmt = (min: number) => {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

/** "2026-08-06" -> "mié 6" */
const dayLabel = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d)
    .toLocaleDateString("es-AR", { weekday: "short", day: "numeric" })
    .replace(".", "");
};

const MOODS = ["😵", "😕", "😐", "🙂", "😄"];
/** Meta de referencia para la barra: 8h. */
const META_MIN = 8 * 60;

export default function SleepSection() {
  const [stats, setStats] = useState<SleepStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<SleepLog | null>(null);

  const reload = useCallback(async () => {
    try {
      const res = await api.sleep.getStats(14);
      setStats(res.data as SleepStats);
    } catch {
      toast.error("Error", "No se pudo cargar el sueño");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleDelete = async (log: SleepLog) => {
    try {
      await api.sleep.remove(log.date);
      toast.success("Borrado", "");
      reload();
    } catch {
      toast.error("Error", "No se pudo borrar");
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  const anoche = stats?.logs.find((l) => l.date === getDateKey(new Date()));

  return (
    <div className="animate-fade-in space-y-4">
      {/* Anoche */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <Moon className="h-4 w-4 text-info" />
            Anoche
          </h3>
          <Button
            size="sm"
            variant={anoche ? "outline" : "default"}
            onClick={() => {
              setEditing(anoche || null);
              setShowDialog(true);
            }}
          >
            {anoche ? "Editar" : <><Plus className="mr-1 h-4 w-4" />Cargar</>}
          </Button>
        </div>

        {anoche ? (
          <>
            <div className="mt-2 font-mono text-4xl font-bold tabular-nums">
              {fmt(anoche.minutesAsleep)}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {anoche.bedTime && anoche.wakeTime && (
                <span>
                  {anoche.bedTime} → {anoche.wakeTime}
                </span>
              )}
              {anoche.quality != null && (
                <span>
                  {MOODS[anoche.quality - 1]} calidad {anoche.quality}/5
                </span>
              )}
              {anoche.heartRateAvg != null && (
                <span>♥ {anoche.heartRateAvg} lpm</span>
              )}
              {anoche.source === "shortcut" && (
                <span className="inline-flex items-center gap-1">
                  <Watch className="h-3 w-3" /> Watch
                </span>
              )}
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Todavía no cargaste el sueño de hoy. Si armaste la automatización
            del Watch, se carga sola al despertarte.
          </p>
        )}
      </Card>

      {/* Promedio + últimas noches */}
      {stats && stats.noches > 0 ? (
        <Card className="p-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold">Últimas {stats.noches} noches</h3>
            <span className="font-mono text-sm font-bold tabular-nums">
              {stats.promedioTexto}
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                promedio
              </span>
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
            {stats.logs.map((l) => {
              const pct = Math.min(100, (l.minutesAsleep / META_MIN) * 100);
              const corto = l.minutesAsleep < 7 * 60;
              return (
                <div key={l.id} className="flex items-center gap-2">
                  <span className="w-14 shrink-0 text-xs text-muted-foreground">
                    {dayLabel(l.date)}
                  </span>
                  <div className="h-5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ${
                        corto ? "bg-warning" : "bg-info"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums">
                    {fmt(l.minutesAsleep)}
                  </span>
                  <button
                    onClick={() => handleDelete(l)}
                    className="text-muted-foreground/50 transition-colors hover:text-destructive"
                    aria-label={`Borrar sueño del ${l.date}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-[11px] text-muted-foreground">
            La barra llena son 8 hs. En ámbar, las noches de menos de 7.
          </p>
        </Card>
      ) : (
        <Card className="p-4">
          <EmptyState
            icon={Moon}
            title="Sin noches registradas"
            description="Cargá tu primera noche o dejá que la automatización del Watch lo haga al despertarte."
          />
        </Card>
      )}

      <SleepDialog
        open={showDialog}
        editing={editing}
        onClose={() => setShowDialog(false)}
        onSaved={reload}
      />
    </div>
  );
}

function SleepDialog({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean;
  editing: SleepLog | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [bedTime, setBedTime] = useState("23:30");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [quality, setQuality] = useState(3);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setBedTime(editing?.bedTime || "23:30");
      setWakeTime(editing?.wakeTime || "07:00");
      setQuality(editing?.quality || 3);
    }
  }, [open, editing]);

  // Minutos entre acostarse y despertarse, cruzando la medianoche.
  const minutos = (() => {
    const [bh, bm] = bedTime.split(":").map(Number);
    const [wh, wm] = wakeTime.split(":").map(Number);
    if ([bh, bm, wh, wm].some((n) => Number.isNaN(n))) return 0;
    let diff = wh * 60 + wm - (bh * 60 + bm);
    if (diff <= 0) diff += 24 * 60;
    return diff;
  })();

  const handleSave = async () => {
    if (minutos < 30) {
      toast.error("Error", "Revisá los horarios: da menos de 30 minutos");
      return;
    }
    setSaving(true);
    try {
      await api.sleep.upsert({
        date: getDateKey(new Date()),
        minutesAsleep: minutos,
        bedTime,
        wakeTime,
        quality,
      });
      toast.success("Sueño registrado", fmt(minutos));
      onClose();
      onSaved();
    } catch {
      toast.error("Error", "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar sueño" : "¿Cómo dormiste?"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sleep-bed">Me acosté</Label>
              <Input
                id="sleep-bed"
                type="time"
                value={bedTime}
                onChange={(e) => setBedTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sleep-wake">Me desperté</Label>
              <Input
                id="sleep-wake"
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <div className="font-mono text-2xl font-bold tabular-nums">
              {fmt(minutos)}
            </div>
            <div className="text-xs text-muted-foreground">dormidas</div>
          </div>

          <div>
            <Label>Calidad</Label>
            <div className="mt-1 flex justify-between gap-1">
              {MOODS.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => setQuality(i + 1)}
                  className={`flex h-12 flex-1 items-center justify-center rounded-lg border text-2xl transition-all active:scale-95 ${
                    quality === i + 1
                      ? "border-primary bg-accent"
                      : "border-border"
                  }`}
                  aria-label={`Calidad ${i + 1} de 5`}
                  aria-pressed={quality === i + 1}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
