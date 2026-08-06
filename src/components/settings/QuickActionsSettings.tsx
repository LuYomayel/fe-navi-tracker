"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import type { ExpenseCategory } from "@/types/expenses";
import { Zap, ChevronDown, ChevronUp } from "lucide-react";

interface QuickActionsConfig {
  aguaVasosPorTap: number;
  notaMoodDefault: number;
  gastoCategoriaDefault: string | null;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-navi-tracker.luciano-yomayel.com";

const ENDPOINTS = [
  { label: "💧 Agua", path: "/api/quick/agua", body: "— (usa la config)" },
  { label: "🍽️ Comida del plan", path: "/api/quick/comida-plan", body: "—" },
  {
    label: "💸 Gasto",
    path: "/api/quick/gasto",
    body: '{"monto": n, "descripcion": "..."}',
  },
  { label: "📝 Reflexión", path: "/api/quick/nota", body: '{"texto": "..."}' },
];

const MOOD_LABELS = ["😖 1", "😕 2", "😐 3", "🙂 4", "😄 5"];

/**
 * Config de las quick actions (tags NFC / Atajos de iOS / Apple Watch):
 * cuántos vasos suma cada tap de agua, mood default de la reflexión dictada
 * y categoría default del gasto rápido.
 */
export function QuickActionsSettings() {
  const [config, setConfig] = useState<QuickActionsConfig | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [showEndpoints, setShowEndpoints] = useState(false);

  useEffect(() => {
    Promise.all([
      api.quickActions.getConfig(),
      api.expenses.categories.list(),
    ])
      .then(([cfgRes, catRes]) => {
        setConfig(cfgRes.data as QuickActionsConfig);
        setCategories((catRes.data as ExpenseCategory[]) || []);
      })
      .catch(() => {
        toast.error("Error", "No se pudo cargar la config de automatizaciones");
      });
  }, []);

  const save = async (partial: Partial<QuickActionsConfig>) => {
    if (!config) return;
    const next = { ...config, ...partial };
    setConfig(next); // optimistic
    setSaving(true);
    try {
      await api.quickActions.setConfig(partial);
      toast.success("Guardado", "");
    } catch {
      setConfig(config); // rollback
      toast.error("Error", "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  if (!config) return null;

  const mlPorTap = config.aguaVasosPorTap * 250;

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-md bg-warning/15 text-warning">
          <Zap className="h-[19px] w-[19px]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Tags NFC y Atajos</div>
          <div className="text-xs text-muted-foreground">
            Qué hace cada tap (iPhone, Watch o Siri)
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="qa-vasos">Agua por tap</Label>
        <div className="mt-1 flex items-center gap-2">
          <select
            id="qa-vasos"
            value={config.aguaVasosPorTap}
            disabled={saving}
            onChange={(e) => save({ aguaVasosPorTap: Number(e.target.value) })}
            className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} vaso{n > 1 ? "s" : ""} ({n * 250}ml)
                {n === 3 ? " — botella 750ml" : ""}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Cada tap del tag suma esto ({mlPorTap}ml por tap)
        </p>
      </div>

      <div>
        <Label htmlFor="qa-mood">Mood default de la reflexión dictada</Label>
        <select
          id="qa-mood"
          value={config.notaMoodDefault}
          disabled={saving}
          onChange={(e) => save({ notaMoodDefault: Number(e.target.value) })}
          className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          {MOOD_LABELS.map((label, i) => (
            <option key={i} value={i + 1}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="qa-cat">Categoría default del gasto rápido</Label>
        <select
          id="qa-cat"
          value={config.gastoCategoriaDefault || ""}
          disabled={saving}
          onChange={(e) =>
            save({ gastoCategoriaDefault: e.target.value || null })
          }
          className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"
        >
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.icon ? `${c.icon} ` : ""}
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <Button
        variant="tonal"
        size="sm"
        className="w-full"
        onClick={() => setShowEndpoints((v) => !v)}
      >
        {showEndpoints ? (
          <ChevronUp className="mr-1.5 h-4 w-4" />
        ) : (
          <ChevronDown className="mr-1.5 h-4 w-4" />
        )}
        {showEndpoints ? "Ocultar URLs para Atajos" : "Ver URLs para Atajos"}
      </Button>
      {showEndpoints && (
        <div className="space-y-2">
          {ENDPOINTS.map((e) => (
            <div key={e.path} className="rounded-lg bg-muted/50 p-2.5">
              <div className="text-xs font-semibold">{e.label}</div>
              <code className="block truncate font-mono text-[11px] text-muted-foreground">
                POST {API_BASE_URL}
                {e.path}
              </code>
              <div className="text-[11px] text-muted-foreground">
                Body: {e.body} · Header: x-quick-token
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
