"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import type { PlateComponent, SavedMeal } from "@/types";
import { Search, X } from "lucide-react";

/**
 * Plato modular: armás la comida tocando las zonas del plato (proteína,
 * carbo, verdura) + bebida y fruta, eligiendo componentes guardados por
 * separado. Un solo log con todo sumado.
 */

const ZONES: {
  key: PlateComponent;
  label: string;
  emoji: string;
  colorVar: string;
}[] = [
  { key: "protein", label: "Proteína", emoji: "🥩", colorVar: "--chart-1" },
  { key: "carb", label: "Carbos", emoji: "🍚", colorVar: "--chart-4" },
  { key: "veggie", label: "Verduras", emoji: "🥗", colorVar: "--chart-2" },
];

const SIDES: { key: PlateComponent; label: string; emoji: string }[] = [
  { key: "drink", label: "Bebida", emoji: "☕" },
  { key: "fruit", label: "Fruta", emoji: "🍌" },
];

const COMPONENT_LABELS: Record<string, string> = {
  protein: "Proteína",
  carb: "Carbohidrato",
  veggie: "Verdura / Ensalada",
  drink: "Bebida",
  fruit: "Fruta",
  other: "Otro",
};

const MEAL_TYPES = [
  { value: "breakfast", label: "Desayuno" },
  { value: "lunch", label: "Almuerzo" },
  { value: "merienda", label: "Merienda" },
  { value: "dinner", label: "Cena" },
];

// Sectores del plato en SVG: 3 porciones de 120° (arranca arriba)
const sectorPath = (index: number, cx = 100, cy = 100, r = 92) => {
  const start = ((index * 120 - 90) * Math.PI) / 180;
  const end = (((index + 1) * 120 - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
};

// Centroide aproximado de cada sector para ubicar el contenido
const sectorCenter = (index: number, cx = 100, cy = 100, r = 55) => {
  const mid = ((index * 120 + 60 - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(mid), y: cy + r * Math.sin(mid) };
};

export function PlateBuilder({
  isOpen,
  onClose,
  onLogged,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLogged?: () => void;
}) {
  const [meals, setMeals] = useState<SavedMeal[]>([]);
  const [selected, setSelected] = useState<Record<string, SavedMeal[]>>({});
  const [pickerZone, setPickerZone] = useState<PlateComponent | null>(null);
  const [search, setSearch] = useState("");
  const [mealType, setMealType] = useState("lunch");
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelected({});
      setPickerZone(null);
      setSearch("");
      const hour = new Date().getHours();
      setMealType(
        hour < 11
          ? "breakfast"
          : hour < 15
          ? "lunch"
          : hour < 19
          ? "merienda"
          : "dinner"
      );
      api.savedMeals
        .getAll()
        .then((res) => setMeals((res.data as SavedMeal[]) || []))
        .catch(() => toast.error("Error", "No se pudieron cargar tus comidas"));
    }
  }, [isOpen]);

  const allSelected = useMemo(
    () => Object.values(selected).flat(),
    [selected]
  );

  const totals = useMemo(() => {
    return allSelected.reduce(
      (acc, m) => ({
        kcal: acc.kcal + (m.totalCalories || 0),
        protein: acc.protein + (m.macronutrients?.protein || 0),
        carbs: acc.carbs + (m.macronutrients?.carbs || 0),
        fat: acc.fat + (m.macronutrients?.fat || 0),
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [allSelected]);

  const pickerMeals = useMemo(() => {
    if (!pickerZone) return { matching: [], unclassified: [] };
    const q = search.trim().toLowerCase();
    const bySearch = (m: SavedMeal) =>
      !q || m.name.toLowerCase().includes(q);
    const chosen = new Set(allSelected.map((m) => m.id));
    const avail = meals.filter((m) => !chosen.has(m.id) && bySearch(m));
    return {
      matching: avail.filter((m) => m.component === pickerZone),
      unclassified: avail.filter((m) => !m.component),
    };
  }, [pickerZone, meals, search, allSelected]);

  const addToZone = async (meal: SavedMeal, zone: PlateComponent) => {
    setSelected((prev) => ({
      ...prev,
      [zone]: [...(prev[zone] || []), meal],
    }));
    setPickerZone(null);
    setSearch("");
    // Auto-clasificación: si el componente no tenía segmento, se lo guardamos
    // para que la próxima vez aparezca directo en esa zona.
    if (!meal.component) {
      try {
        await api.savedMeals.update(meal.id, { component: zone });
        setMeals((prev) =>
          prev.map((m) => (m.id === meal.id ? { ...m, component: zone } : m))
        );
        toast.success(
          "Componente clasificado",
          `"${meal.name}" quedó como ${COMPONENT_LABELS[zone]}`
        );
      } catch {
        // No es crítico: el plato funciona igual
      }
    }
  };

  const removeFromZone = (mealId: string, zone: string) => {
    setSelected((prev) => ({
      ...prev,
      [zone]: (prev[zone] || []).filter((m) => m.id !== mealId),
    }));
  };

  const handleLog = async () => {
    if (allSelected.length === 0) return;
    setLogging(true);
    try {
      const res = await api.savedMeals.logPlate({
        componentIds: allSelected.map((m) => m.id),
        mealType,
      });
      if (res.success) {
        toast.success(
          "¡Plato registrado! +15 XP",
          `${Math.round(totals.kcal)} kcal — ${allSelected
            .map((m) => m.name)
            .join(" + ")}`
        );
        onClose();
        onLogged?.();
      } else {
        toast.error("Error", "No se pudo registrar el plato");
      }
    } catch {
      toast.error("Error", "No se pudo registrar el plato");
    } finally {
      setLogging(false);
    }
  };

  const zoneItems = (zone: string) => selected[zone] || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg sm:max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Armá tu plato</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tocá cada zona del plato y elegí el componente. Todo se registra
            junto como una sola comida.
          </p>

          {/* El plato */}
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <svg viewBox="0 0 200 200" className="h-56 w-56 drop-shadow-sm">
                {/* borde del plato */}
                <circle
                  cx="100"
                  cy="100"
                  r="98"
                  fill="hsl(var(--card))"
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                />
                {ZONES.map((z, i) => {
                  const has = zoneItems(z.key).length > 0;
                  return (
                    <path
                      key={z.key}
                      d={sectorPath(i)}
                      fill={`hsl(var(${z.colorVar}) / ${has ? 0.28 : 0.1})`}
                      stroke="hsl(var(--background))"
                      strokeWidth="3"
                      className="cursor-pointer transition-opacity hover:opacity-80"
                      onClick={() => {
                        setPickerZone(z.key);
                        setSearch("");
                      }}
                    />
                  );
                })}
                {ZONES.map((z, i) => {
                  const items = zoneItems(z.key);
                  const c = sectorCenter(i);
                  return (
                    <g
                      key={`label-${z.key}`}
                      className="pointer-events-none select-none"
                    >
                      <text
                        x={c.x}
                        y={c.y - 8}
                        textAnchor="middle"
                        fontSize="20"
                      >
                        {items.length > 0 ? "✅" : z.emoji}
                      </text>
                      <text
                        x={c.x}
                        y={c.y + 10}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="600"
                        fill="hsl(var(--foreground))"
                      >
                        {items.length > 0
                          ? `${items.length} ítem${items.length > 1 ? "s" : ""}`
                          : z.label}
                      </text>
                      {items.length === 0 && (
                        <text
                          x={c.x}
                          y={c.y + 24}
                          textAnchor="middle"
                          fontSize="11"
                          fill="hsl(var(--muted-foreground))"
                        >
                          + agregar
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bebida y fruta al costado */}
            <div className="flex flex-col gap-2">
              {SIDES.map((s) => {
                const has = zoneItems(s.key).length > 0;
                return (
                  <button
                    key={s.key}
                    onClick={() => {
                      setPickerZone(s.key);
                      setSearch("");
                    }}
                    className={`flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 text-xl transition-colors ${
                      has
                        ? "border-success bg-success/15"
                        : "border-dashed border-border bg-muted/40 hover:bg-muted"
                    }`}
                    aria-label={`Elegir ${s.label}`}
                  >
                    <span>{has ? "✅" : s.emoji}</span>
                    <span className="text-[9px] font-semibold text-muted-foreground">
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Componentes elegidos */}
          {allSelected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(selected).flatMap(([zone, items]) =>
                items.map((m) => (
                  <span
                    key={m.id}
                    className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
                  >
                    {ZONES.find((z) => z.key === zone)?.emoji ||
                      SIDES.find((s) => s.key === zone)?.emoji}
                    {m.name}
                    <span className="text-muted-foreground">
                      {m.totalCalories} kcal
                    </span>
                    <button
                      onClick={() => removeFromZone(m.id, zone)}
                      className="ml-0.5 text-muted-foreground hover:text-destructive"
                      aria-label={`Quitar ${m.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          )}

          {/* Picker de componentes de una zona */}
          {pickerZone && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  Elegí{" "}
                  {COMPONENT_LABELS[pickerZone].toLowerCase()}
                </span>
                <button
                  onClick={() => setPickerZone(null)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Cerrar selector"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {pickerMeals.matching.map((m) => (
                  <PickerRow
                    key={m.id}
                    meal={m}
                    onPick={() => addToZone(m, pickerZone)}
                  />
                ))}
                {pickerMeals.unclassified.length > 0 && (
                  <>
                    <div className="pt-1 text-[11px] font-semibold uppercase text-muted-foreground">
                      Sin clasificar (se guardan como{" "}
                      {COMPONENT_LABELS[pickerZone].toLowerCase()})
                    </div>
                    {pickerMeals.unclassified.map((m) => (
                      <PickerRow
                        key={m.id}
                        meal={m}
                        onPick={() => addToZone(m, pickerZone)}
                      />
                    ))}
                  </>
                )}
                {pickerMeals.matching.length === 0 &&
                  pickerMeals.unclassified.length === 0 && (
                    <p className="py-2 text-center text-sm text-muted-foreground">
                      No hay comidas guardadas para esta zona. Creá una desde
                      &quot;Gestionar comidas guardadas&quot;.
                    </p>
                  )}
              </div>
            </div>
          )}

          {/* Totales + tipo de comida + CTA */}
          <div className="space-y-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {MEAL_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setMealType(t.value)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      mealType === t.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-mono text-sm tabular-nums text-muted-foreground">
                P {Math.round(totals.protein)}g · HC {Math.round(totals.carbs)}
                g · G {Math.round(totals.fat)}g
              </div>
              <div className="font-mono text-xl font-bold tabular-nums">
                {Math.round(totals.kcal)}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  kcal
                </span>
              </div>
            </div>
            <Button
              size="xl"
              className="w-full"
              disabled={allSelected.length === 0 || logging}
              onClick={handleLog}
            >
              {logging
                ? "Registrando…"
                : `¡A comer! ${allSelected.length > 0 ? `(${allSelected.length} componentes)` : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PickerRow({
  meal,
  onPick,
}: {
  meal: SavedMeal;
  onPick: () => void;
}) {
  return (
    <button
      onClick={onPick}
      className="flex w-full items-center justify-between rounded-md bg-card px-3 py-2 text-left transition-colors hover:bg-accent"
    >
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {meal.name}
      </span>
      <span className="ml-2 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
        {meal.totalCalories} kcal
      </span>
    </button>
  );
}
