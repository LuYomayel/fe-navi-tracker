"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  ArrowLeft,
  Loader2,
  Save,
  Utensils,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import { MealType, type SavedMeal, type Macronutrients } from "@/types";
import { MEAL_TYPE_OPTIONS, mealTypeLabel } from "@/lib/meal-types";

interface FormState {
  name: string;
  description: string;
  mealType: string;
  component: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
  sodium: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  mealType: MealType.BREAKFAST,
  component: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  fiber: "",
  sugar: "",
  sodium: "",
};

// Segmentos del plato modular
const COMPONENT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Comida completa" },
  { value: "protein", label: "🥩 Proteína" },
  { value: "carb", label: "🍚 Carbohidrato" },
  { value: "veggie", label: "🥗 Verdura / Ensalada" },
  { value: "drink", label: "☕ Bebida" },
  { value: "fruit", label: "🍌 Fruta" },
  { value: "other", label: "🍽️ Otro" },
];

const num = (s: string) => {
  const n = parseFloat(s.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

function fromMeal(m: SavedMeal): FormState {
  const mn = m.macronutrients;
  return {
    name: m.name ?? "",
    description: m.description ?? "",
    mealType: m.mealType ?? MealType.BREAKFAST,
    component: m.component ?? "",
    calories: String(m.totalCalories ?? ""),
    protein: String(mn?.protein ?? ""),
    carbs: String(mn?.carbs ?? ""),
    fat: String(mn?.fat ?? ""),
    fiber: String(mn?.fiber ?? ""),
    sugar: String(mn?.sugar ?? ""),
    sodium: String(mn?.sodium ?? ""),
  };
}

export function SavedMealsManager({
  isOpen,
  onClose,
  onChanged,
}: {
  isOpen: boolean;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const [meals, setMeals] = useState<SavedMeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const confirmDelete = useConfirm<SavedMeal>();

  const handleClassify = async () => {
    setClassifying(true);
    try {
      const res = await api.savedMeals.classifyComponents();
      const data = res.data as {
        total: number;
        classified: number;
        results: { name: string; component: string }[];
      };
      toast.success(
        `${data.classified} de ${data.total} clasificadas`,
        data.results
          .slice(0, 4)
          .map((r) => r.name)
          .join(", ") + (data.results.length > 4 ? "…" : "")
      );
      await load();
    } catch {
      toast.error("No se pudieron clasificar las comidas");
    } finally {
      setClassifying(false);
    }
  };
  const [mode, setMode] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.savedMeals.getAll();
      if (res?.data) setMeals(res.data as SavedMeal[]);
    } catch {
      toast.error("No se pudieron cargar las comidas guardadas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setMode("list");
      setEditingId(null);
      load();
    }
  }, [isOpen]);

  // Orden alfabético para gestionar (fácil de ubicar la que querés editar).
  const sorted = useMemo(
    () =>
      [...meals].sort((a, b) =>
        a.name.localeCompare(b.name, "es", { sensitivity: "base" })
      ),
    [meals]
  );

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMode("form");
  };

  const openEdit = (m: SavedMeal) => {
    setEditingId(m.id);
    setForm(fromMeal(m));
    setMode("form");
  };

  const set = (k: keyof FormState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    const name = form.name.trim();
    if (!name) {
      toast.error("Ponele un nombre a la plantilla");
      return;
    }
    const macronutrients: Macronutrients = {
      protein: num(form.protein),
      carbs: num(form.carbs),
      fat: num(form.fat),
      fiber: num(form.fiber),
      sugar: num(form.sugar),
      sodium: num(form.sodium),
    };
    const totalCalories = Math.round(num(form.calories));

    try {
      setSaving(true);
      if (editingId) {
        // Preservamos los `foods` existentes; sólo editamos macros/kcal/tipo/nombre.
        const existing = meals.find((m) => m.id === editingId);
        await api.savedMeals.update(editingId, {
          name,
          description: form.description.trim(),
          mealType: form.mealType,
          component: (form.component || null) as SavedMeal["component"],
          totalCalories,
          macronutrients,
          foods: existing?.foods ?? [],
        });
        toast.success("Plantilla actualizada");
      } else {
        await api.savedMeals.create({
          name,
          description: form.description.trim() || undefined,
          mealType: form.mealType,
          component: (form.component || null) as SavedMeal["component"],
          foods: [],
          totalCalories,
          macronutrients,
        });
        toast.success("Plantilla creada");
      }
      await load();
      onChanged?.();
      setMode("list");
      setEditingId(null);
    } catch {
      toast.error("No se pudo guardar la plantilla");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m: SavedMeal) => {
    if (!(await confirmDelete.confirm(m))) return;
    try {
      await api.savedMeals.delete(m.id);
      setMeals((prev) => prev.filter((x) => x.id !== m.id));
      onChanged?.();
      toast.success("Plantilla borrada");
    } catch {
      toast.error("No se pudo borrar");
    }
  };

  // Estimación de kcal desde macros (4/4/9) para el botón de ayuda.
  const kcalFromMacros = Math.round(
    num(form.protein) * 4 + num(form.carbs) * 4 + num(form.fat) * 9
  );

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "form" && (
              <button
                onClick={() => {
                  setMode("list");
                  setEditingId(null);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Volver"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <Star className="h-5 w-5 text-amber-500" />
            {mode === "form"
              ? editingId
                ? "Editar plantilla"
                : "Nueva plantilla"
              : "Comidas guardadas"}
          </DialogTitle>
        </DialogHeader>

        {mode === "list" ? (
          <div className="space-y-3">
            <Button onClick={openNew} className="w-full" variant="tonal">
              <Plus className="mr-1.5 h-4 w-4" /> Nueva plantilla
            </Button>

            {meals.some((m) => !m.component) && (
              <Button
                onClick={handleClassify}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={classifying}
              >
                {classifying ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <span className="mr-1.5">✨</span>
                )}
                Clasificar {meals.filter((m) => !m.component).length} sin
                componente con IA
              </Button>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : sorted.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                <Utensils className="mx-auto mb-2 h-6 w-6 opacity-60" />
                Todavía no tenés comidas guardadas. Creá una con “Nueva
                plantilla”.
              </div>
            ) : (
              <div className="max-h-[52vh] space-y-2 overflow-y-auto">
                {sorted.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 rounded-xl border bg-card p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold">
                          {m.name}
                        </span>
                        <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {mealTypeLabel(m.mealType)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {m.totalCalories} kcal · P:
                        {m.macronutrients.protein.toFixed(0)}g C:
                        {m.macronutrients.carbs.toFixed(0)}g G:
                        {m.macronutrients.fat.toFixed(0)}g · {m.timesUsed}x
                      </div>
                    </div>
                    <ActionIconButton
                      icon={Pencil}
                      className="shrink-0"
                      onClick={() => openEdit(m)}
                      aria-label="Editar"
                    />
                    <ActionIconButton
                      icon={Trash2}
                      variant="destructive"
                      className="shrink-0"
                      onClick={() => handleDelete(m)}
                      aria-label="Borrar"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-h-[68vh] space-y-4 overflow-y-auto pr-0.5">
            <div className="space-y-1.5">
              <Label htmlFor="sm-name">Nombre</Label>
              <Input
                id="sm-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ej: Café con leche"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sm-type">Tipo de comida</Label>
              <select
                id="sm-type"
                value={form.mealType}
                onChange={(e) => set("mealType", e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                {MEAL_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sm-component">Componente del plato</Label>
              <select
                id="sm-component"
                value={form.component}
                onChange={(e) => set("component", e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
              >
                {COMPONENT_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                Clasificala para poder elegirla al armar un plato (proteína,
                carbo, verdura…).
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="sm-kcal">Calorías (kcal)</Label>
                {kcalFromMacros > 0 && (
                  <button
                    type="button"
                    onClick={() => set("calories", String(kcalFromMacros))}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Usar {kcalFromMacros} (desde macros)
                  </button>
                )}
              </div>
              <Input
                id="sm-kcal"
                inputMode="numeric"
                value={form.calories}
                onChange={(e) => set("calories", e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <Label className="mb-1.5 block">Macros (g)</Label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ["protein", "Proteína"],
                    ["carbs", "Carbohid."],
                    ["fat", "Grasas"],
                    ["fiber", "Fibra"],
                    ["sugar", "Azúcares"],
                    ["sodium", "Sodio (mg)"],
                  ] as [keyof FormState, string][]
                ).map(([key, label]) => (
                  <div key={key} className="space-y-1">
                    <span className="text-[11px] text-muted-foreground">
                      {label}
                    </span>
                    <Input
                      inputMode="decimal"
                      value={form[key]}
                      onChange={(e) => set(key, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sm-desc">Descripción (opcional)</Label>
              <Input
                id="sm-desc"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Ej: con 2 de azúcar"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setMode("list");
                  setEditingId(null);
                }}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-4 w-4" />
                )}
                {editingId ? "Guardar" : "Crear"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={confirmDelete.onOpenChange}
        onConfirm={confirmDelete.onConfirm}
        title={
          confirmDelete.payload
            ? `¿Borrar la plantilla "${confirmDelete.payload.name}"?`
            : "¿Borrar la plantilla?"
        }
        confirmLabel="Borrar"
        destructive
      />
    </Dialog>
  );
}
