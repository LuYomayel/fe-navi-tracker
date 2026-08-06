"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import { getDateKey } from "@/lib/utils";
import type { MealType, PlateComponent, SavedMeal } from "@/types";
import { Loader2, Search, Sparkles, X } from "lucide-react";

/**
 * EL flujo de registrar comida: el plato redondo. Tocás cada zona (proteína,
 * carbo, verdura) + bebida/fruta, elegís componentes guardados, todo se suma
 * en vivo y se registra como UNA comida. Las "rápidas" de arriba agregan una
 * comida completa al plato de un toque.
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

// Sectores del plato: 3 porciones de 120° (arranca arriba)
const sectorPath = (index: number, cx = 100, cy = 100, r = 92) => {
  const start = ((index * 120 - 90) * Math.PI) / 180;
  const end = (((index + 1) * 120 - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
};

const sectorCenter = (index: number, cx = 100, cy = 100, r = 55) => {
  const mid = ((index * 120 + 60 - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(mid), y: cy + r * Math.sin(mid) };
};

export function PlateComposer({
  selectedDate,
  onLogged,
  composeMode = false,
  onCompose,
  initialMealType,
}: {
  selectedDate?: Date;
  onLogged?: () => void;
  /** true = armar el plato SIN registrar: devuelve los componentes por onCompose (ej: meal prep) */
  composeMode?: boolean;
  onCompose?: (
    meals: SavedMeal[],
    totals: { kcal: number; protein: number; carbs: number; fat: number }
  ) => void;
  initialMealType?: string;
}) {
  const [meals, setMeals] = useState<SavedMeal[]>([]);
  const [selected, setSelected] = useState<Record<string, SavedMeal[]>>({});
  const [pickerZone, setPickerZone] = useState<PlateComponent | null>(null);
  const [search, setSearch] = useState("");
  const [mealType, setMealType] = useState("lunch");
  const [logging, setLogging] = useState(false);
  const [newText, setNewText] = useState("");
  // Componentes nuevos analizándose con IA: una request por componente, en
  // paralelo (podés seguir cargando otras zonas mientras tanto). Al resolver,
  // cada uno se guarda como comida individual y entra al plato.
  const [pending, setPending] = useState<
    { tempId: string; name: string; zone: PlateComponent }[]
  >([]);

  const analyzeNewComponent = (text: string, zone: PlateComponent) => {
    const name = text.trim();
    if (!name) return;
    const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setPending((prev) => [...prev, { tempId, name, zone }]);
    setNewText("");
    setPickerZone(null);

    // Fire-and-track: la request corre sola; mientras, se pueden cargar más zonas
    (async () => {
      try {
        const res = await api.analyzeFood.analyzeManualFood({
          ingredients: name,
          servings: 1,
          mealType: mealType as MealType,
        });
        const data = res.data as {
          foods: SavedMeal["foods"];
          totalCalories: number;
          macronutrients: SavedMeal["macronutrients"];
        };
        const created = await api.savedMeals.create({
          name,
          mealType,
          component: zone,
          foods: data.foods || [],
          totalCalories: Math.round(data.totalCalories || 0),
          macronutrients: data.macronutrients || {
            protein: 0,
            carbs: 0,
            fat: 0,
          },
        } as Omit<SavedMeal, "id" | "userId" | "timesUsed" | "lastUsedAt" | "createdAt" | "updatedAt">);
        const meal = created.data as SavedMeal;
        setMeals((prev) => [meal, ...prev]);
        setSelected((prev) => ({
          ...prev,
          [zone]: [...(prev[zone] || []), meal],
        }));
        toast.success(
          `"${name}" analizada: ${meal.totalCalories} kcal`,
          `Guardada como ${COMPONENT_LABELS[zone].toLowerCase()} — ya está en el plato`
        );
      } catch (error) {
        console.error("Error analizando componente nuevo:", error);
        toast.error("Error", `No se pudo analizar "${name}". Probá de nuevo.`);
      } finally {
        setPending((prev) => prev.filter((p) => p.tempId !== tempId));
      }
    })();
  };

  useEffect(() => {
    if (initialMealType) {
      setMealType(initialMealType);
    } else {
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
    }
    api.savedMeals
      .getAll()
      .then((res) => setMeals((res.data as SavedMeal[]) || []))
      .catch(() => toast.error("Error", "No se pudieron cargar tus comidas"));
  }, []);

  const allSelected = useMemo(() => Object.values(selected).flat(), [selected]);

  const totals = useMemo(
    () =>
      allSelected.reduce(
        (acc, m) => ({
          kcal: acc.kcal + (m.totalCalories || 0),
          protein: acc.protein + (m.macronutrients?.protein || 0),
          carbs: acc.carbs + (m.macronutrients?.carbs || 0),
          fat: acc.fat + (m.macronutrients?.fat || 0),
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [allSelected]
  );

  // Rápidas: las completas/mixtas más usadas → un toque las pone en el plato
  const quickMeals = useMemo(() => {
    const chosen = new Set(allSelected.map((m) => m.id));
    return meals
      .filter((m) => (m.component === "other" || !m.component) && !chosen.has(m.id))
      .sort((a, b) => (b.timesUsed || 0) - (a.timesUsed || 0))
      .slice(0, 4);
  }, [meals, allSelected]);

  const pickerMeals = useMemo(() => {
    if (!pickerZone) return { matching: [], unclassified: [], others: [] };
    const q = search.trim().toLowerCase();
    const bySearch = (m: SavedMeal) => !q || m.name.toLowerCase().includes(q);
    const chosen = new Set(allSelected.map((m) => m.id));
    const avail = meals.filter((m) => !chosen.has(m.id) && bySearch(m));
    return {
      matching: avail.filter((m) => m.component === pickerZone),
      unclassified: avail.filter((m) => !m.component),
      others:
        pickerZone === "other"
          ? []
          : avail.filter((m) => m.component === "other"),
    };
  }, [pickerZone, meals, search, allSelected]);

  const addToZone = async (meal: SavedMeal, zone: PlateComponent) => {
    setSelected((prev) => ({ ...prev, [zone]: [...(prev[zone] || []), meal] }));
    setPickerZone(null);
    setSearch("");
    // Auto-clasificación de las que no tenían segmento
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
        // no crítico
      }
    }
  };

  const addQuick = (meal: SavedMeal) => {
    const zone = (meal.component || "other") as PlateComponent;
    setSelected((prev) => ({ ...prev, [zone]: [...(prev[zone] || []), meal] }));
  };

  const removeFromZone = (mealId: string, zone: string) => {
    setSelected((prev) => ({
      ...prev,
      [zone]: (prev[zone] || []).filter((m) => m.id !== mealId),
    }));
  };

  const handleLog = async () => {
    if (allSelected.length === 0) return;
    // Modo componer: no registra nada, entrega los componentes al padre
    if (composeMode && onCompose) {
      onCompose(allSelected, totals);
      setSelected({});
      return;
    }
    setLogging(true);
    try {
      const res = await api.savedMeals.logPlate({
        componentIds: allSelected.map((m) => m.id),
        mealType,
        date: getDateKey(selectedDate || new Date()),
      });
      if (!res.success) throw new Error("No se pudo registrar");
      // El +15 XP lo otorga el backend al crear la comida.
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("nutrition-log"));
        // El XP ya lo otorgo el backend: pedimos refrescar el contador.
        window.dispatchEvent(new Event("xp-updated"));
      }
      toast.success(
        `¡Plato registrado! ${Math.round(totals.kcal)} kcal · +15 XP`,
        allSelected.map((m) => m.name).join(" + ")
      );
      setSelected({});
      onLogged?.();
    } catch (error) {
      console.error("Error registrando plato:", error);
      toast.error("Error", "No se pudo registrar el plato");
    } finally {
      setLogging(false);
    }
  };

  const zoneItems = (zone: string) => selected[zone] || [];

  return (
    <div className="space-y-4 text-left">
      {/* Rápidas: comidas completas de siempre, 1 toque al plato */}
      {quickMeals.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-muted-foreground">
            ⭐ Rápidas (van directo al plato)
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {quickMeals.map((m) => (
              <button
                key={m.id}
                onClick={() => addQuick(m)}
                className="shrink-0 rounded-full bg-secondary/70 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
              >
                {m.name}
                <span className="ml-1 text-muted-foreground">
                  {m.totalCalories} kcal
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* El plato */}
      <div className="flex items-center justify-center gap-3">
        <svg viewBox="0 0 200 200" className="h-52 w-52 drop-shadow-sm">
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
                className="cursor-pointer outline-none transition-opacity hover:opacity-80 focus-visible:opacity-80"
                role="button"
                tabIndex={0}
                aria-label={`Elegir ${z.label}`}
                onClick={() => {
                  setPickerZone(z.key);
                  setSearch("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setPickerZone(z.key);
                    setSearch("");
                  }
                }}
              />
            );
          })}
          {ZONES.map((z, i) => {
            const items = zoneItems(z.key);
            const c = sectorCenter(i);
            return (
              <g key={`l-${z.key}`} className="pointer-events-none select-none">
                <text x={c.x} y={c.y - 8} textAnchor="middle" fontSize="20">
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

      {/* Componentes en el plato */}
      {allSelected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(selected).flatMap(([zone, items]) =>
            items.map((m) => (
              <span
                key={m.id}
                className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1.5 text-xs font-medium"
              >
                {ZONES.find((z) => z.key === zone)?.emoji ||
                  SIDES.find((s) => s.key === zone)?.emoji ||
                  "🍽️"}
                {m.name}
                <span className="text-muted-foreground">
                  {m.totalCalories} kcal
                </span>
                <button
                  onClick={() => removeFromZone(m.id, zone)}
                  className="ml-0.5 flex h-5 w-5 items-center justify-center text-muted-foreground hover:text-destructive"
                  aria-label={`Quitar ${m.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
      )}

      {/* Picker de la zona tocada */}
      {pickerZone && (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              Elegí {COMPONENT_LABELS[pickerZone].toLowerCase()}
            </span>
            <button
              onClick={() => setPickerZone(null)}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
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
          <div className="max-h-44 space-y-1 overflow-y-auto">
            {pickerMeals.matching.map((m) => (
              <PickerRow key={m.id} meal={m} onPick={() => addToZone(m, pickerZone)} />
            ))}
            {pickerMeals.unclassified.length > 0 && (
              <>
                <div className="pt-1 text-[11px] font-semibold uppercase text-muted-foreground">
                  Sin clasificar (quedan como{" "}
                  {COMPONENT_LABELS[pickerZone].toLowerCase()})
                </div>
                {pickerMeals.unclassified.map((m) => (
                  <PickerRow key={m.id} meal={m} onPick={() => addToZone(m, pickerZone)} />
                ))}
              </>
            )}
            {pickerMeals.others.length > 0 && (
              <>
                <div className="pt-1 text-[11px] font-semibold uppercase text-muted-foreground">
                  Completas / mixtas
                </div>
                {pickerMeals.others.map((m) => (
                  <PickerRow key={m.id} meal={m} onPick={() => addToZone(m, pickerZone)} />
                ))}
              </>
            )}
            {pickerMeals.matching.length === 0 &&
              pickerMeals.unclassified.length === 0 &&
              pickerMeals.others.length === 0 && (
                <p className="py-2 text-center text-sm text-muted-foreground">
                  Nada guardado para esta zona todavía — escribila abajo y la
                  IA la analiza.
                </p>
              )}
          </div>

          {/* Componente nuevo: la IA saca los macros y lo guarda para siempre */}
          <div className="space-y-1.5 border-t pt-2">
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">
              ¿No está? Cargala nueva
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ej: 120g de fideos caseros"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") analyzeNewComponent(newText, pickerZone);
                }}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={() => analyzeNewComponent(newText, pickerZone)}
                disabled={!newText.trim()}
                className="shrink-0"
              >
                <Sparkles className="mr-1 h-4 w-4" />
                Analizar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Componentes nuevos analizándose (requests en paralelo) */}
      {pending.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {pending.map((p) => (
            <span
              key={p.tempId}
              className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary"
            >
              <Loader2 className="h-3 w-3 animate-spin" />
              Analizando “{p.name}”…
            </span>
          ))}
        </div>
      )}

      {/* Totales + tipo + CTA */}
      <div className="space-y-3 border-t pt-3">
        <div className={composeMode ? "hidden" : "flex gap-1.5 overflow-x-auto"}>
          {MEAL_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setMealType(t.value)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                mealType === t.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="font-mono text-sm tabular-nums text-muted-foreground">
            P {Math.round(totals.protein)}g · HC {Math.round(totals.carbs)}g · G{" "}
            {Math.round(totals.fat)}g
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
          disabled={allSelected.length === 0 || logging || pending.length > 0}
          onClick={handleLog}
        >
          {pending.length > 0
            ? `Analizando ${pending.length} componente${pending.length > 1 ? "s" : ""}…`
            : logging
            ? "Registrando…"
            : allSelected.length > 0
            ? composeMode
              ? `Poner en la comida (${allSelected.length} componente${allSelected.length > 1 ? "s" : ""})`
              : `¡A comer! (${allSelected.length} componente${allSelected.length > 1 ? "s" : ""})`
            : "Armá tu plato tocando las zonas"}
        </Button>
      </div>
    </div>
  );
}

function PickerRow({ meal, onPick }: { meal: SavedMeal; onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className="flex w-full items-center justify-between rounded-md bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent"
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
