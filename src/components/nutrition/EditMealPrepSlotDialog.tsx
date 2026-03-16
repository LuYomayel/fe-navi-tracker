"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  BookmarkCheck,
  Camera,
  Loader2,
  Plus,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import {
  MealPrepSlot,
  MealSlotKey,
  DayKey,
  DAY_KEYS,
  DAY_LABELS,
  MEAL_SLOT_LABELS,
  UpdateSlotDto,
} from "@/types";
import type { SavedMeal, DetectedFood, Macronutrients, MealType } from "@/types";

type EditMode = "manual" | "saved" | "analyze";

interface EditMealPrepSlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  prepId: string;
  day: DayKey;
  mealType: MealSlotKey;
  currentSlot: MealPrepSlot | null;
  onSlotUpdated: () => void;
}

const emptyMacros: Macronutrients = {
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
};

export function EditMealPrepSlotDialog({
  isOpen,
  onClose,
  prepId,
  day,
  mealType,
  currentSlot,
  onSlotUpdated,
}: EditMealPrepSlotDialogProps) {
  const [mode, setMode] = useState<EditMode>("manual");
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // ─── Manual edit state ───────────────────────────────
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [foods, setFoods] = useState<DetectedFood[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [macros, setMacros] = useState<Macronutrients>({ ...emptyMacros });

  // ─── Saved meals state ──────────────────────────────
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [loadingSavedMeals, setLoadingSavedMeals] = useState(false);
  const [selectedSavedMeal, setSelectedSavedMeal] = useState<SavedMeal | null>(null);

  // ─── Analyze state ──────────────────────────────────
  const [analyzeText, setAnalyzeText] = useState("");
  const [analyzeImage, setAnalyzeImage] = useState<string | null>(null);
  const [analyzedResult, setAnalyzedResult] = useState<{
    foods: DetectedFood[];
    totalCalories: number;
    macronutrients: Macronutrients;
  } | null>(null);

  // ─── Bulk edit state ────────────────────────────────
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedDays, setSelectedDays] = useState<DayKey[]>([]);

  // ─── Initialize from current slot ───────────────────
  useEffect(() => {
    if (isOpen && currentSlot) {
      setName(currentSlot.name || "");
      setNotes(currentSlot.notes || "");
      setFoods(currentSlot.foods || []);
      setTotalCalories(currentSlot.totalCalories || 0);
      setMacros(currentSlot.macronutrients || { ...emptyMacros });
      setMode("manual");
      setBulkMode(false);
      setSelectedDays([]);
      setSelectedSavedMeal(null);
      setAnalyzedResult(null);
      setAnalyzeText("");
      setAnalyzeImage(null);
    } else if (isOpen && !currentSlot) {
      setName("");
      setNotes("");
      setFoods([]);
      setTotalCalories(0);
      setMacros({ ...emptyMacros });
      setMode("manual");
      setBulkMode(false);
      setSelectedDays([]);
    }
  }, [isOpen, currentSlot]);

  // ─── Load saved meals ──────────────────────────────
  const loadSavedMeals = useCallback(async () => {
    setLoadingSavedMeals(true);
    try {
      const res = await api.savedMeals.getAll();
      setSavedMeals((res.data as SavedMeal[]) || []);
    } catch {
      console.error("Error loading saved meals");
    } finally {
      setLoadingSavedMeals(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && mode === "saved" && savedMeals.length === 0) {
      loadSavedMeals();
    }
  }, [isOpen, mode, loadSavedMeals, savedMeals.length]);

  // ─── Recalc totals from foods ──────────────────────
  const recalcFromFoods = (updatedFoods: DetectedFood[]) => {
    const totCal = updatedFoods.reduce((s, f) => s + (f.calories || 0), 0);
    const totMacros: Macronutrients = {
      protein: updatedFoods.reduce((s, f) => s + (f.macronutrients?.protein || 0), 0),
      carbs: updatedFoods.reduce((s, f) => s + (f.macronutrients?.carbs || 0), 0),
      fat: updatedFoods.reduce((s, f) => s + (f.macronutrients?.fat || 0), 0),
      fiber: updatedFoods.reduce((s, f) => s + (f.macronutrients?.fiber || 0), 0),
      sugar: updatedFoods.reduce((s, f) => s + (f.macronutrients?.sugar || 0), 0),
      sodium: updatedFoods.reduce((s, f) => s + (f.macronutrients?.sodium || 0), 0),
    };
    setTotalCalories(totCal);
    setMacros(totMacros);
  };

  // ─── Food CRUD ─────────────────────────────────────
  const addFood = () => {
    const newFood: DetectedFood = {
      name: "",
      quantity: "",
      calories: 0,
      confidence: 1,
      macronutrients: { ...emptyMacros },
      category: "other",
    };
    setFoods([...foods, newFood]);
  };

  const updateFood = (index: number, field: string, value: string | number) => {
    const updated = [...foods];
    if (field.startsWith("macro.")) {
      const macroField = field.replace("macro.", "") as keyof Macronutrients;
      updated[index] = {
        ...updated[index],
        macronutrients: {
          ...updated[index].macronutrients,
          [macroField]: Number(value),
        },
      };
    } else if (field === "calories") {
      updated[index] = { ...updated[index], calories: Number(value) };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setFoods(updated);
    recalcFromFoods(updated);
  };

  const removeFood = (index: number) => {
    const updated = foods.filter((_, i) => i !== index);
    setFoods(updated);
    recalcFromFoods(updated);
  };

  // ─── Select saved meal ─────────────────────────────
  const applySavedMeal = (meal: SavedMeal) => {
    setSelectedSavedMeal(meal);
    setName(meal.name);
    setFoods(meal.foods || []);
    setTotalCalories(meal.totalCalories || 0);
    setMacros(meal.macronutrients || { ...emptyMacros });
    setNotes("");
  };

  // ─── Analyze food ──────────────────────────────────
  const handleAnalyze = async () => {
    if (!analyzeText && !analyzeImage) {
      toast.error("Error", "Escribe qué vas a comer o sube una foto");
      return;
    }

    setIsAnalyzing(true);
    try {
      let result;
      if (analyzeImage) {
        result = await api.analyzeFood.analyzeImage({
          image: analyzeImage,
          mealType: mealType as MealType,
          context: analyzeText || undefined,
        });
      } else {
        result = await api.analyzeFood.analyzeManualFood({
          ingredients: analyzeText,
          servings: 1,
          mealType: mealType as MealType,
        });
      }

      if (result.data) {
        const data = result.data;
        setAnalyzedResult({
          foods: data.foods,
          totalCalories: data.totalCalories,
          macronutrients: data.macronutrients,
        });
        // Auto-apply
        setName(
          data.foods.length === 1
            ? data.foods[0].name
            : data.foods.map((f) => f.name).join(" + ")
        );
        setFoods(data.foods);
        setTotalCalories(data.totalCalories);
        setMacros(data.macronutrients);
        toast.success("Analisis listo", "Se analizaron los alimentos correctamente");
      }
    } catch (error) {
      console.error("Error analyzing food:", error);
      toast.error("Error", "No se pudo analizar la comida");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setAnalyzeImage(base64);
    };
    reader.readAsDataURL(file);
  };

  // ─── Toggle day for bulk edit ──────────────────────
  const toggleDay = (d: DayKey) => {
    setSelectedDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const selectAllDays = () => {
    setSelectedDays([...DAY_KEYS]);
  };

  // ─── Save ──────────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Error", "El nombre de la comida es obligatorio");
      return;
    }

    setIsSaving(true);
    try {
      const slotData: Partial<MealPrepSlot> = {
        name: name.trim(),
        foods,
        totalCalories,
        macronutrients: macros,
        notes: notes.trim() || undefined,
        savedMealId: selectedSavedMeal?.id || undefined,
      };

      const daysToUpdate = bulkMode && selectedDays.length > 0
        ? selectedDays
        : [day];

      for (const d of daysToUpdate) {
        const updateData: UpdateSlotDto = {
          day: d,
          mealType,
          slot: slotData,
        };
        await api.mealPrep.updateSlot(prepId, updateData);
      }

      // Mark saved meal as used
      if (selectedSavedMeal) {
        try {
          await api.savedMeals.use(selectedSavedMeal.id);
        } catch {
          // best effort
        }
      }

      const count = daysToUpdate.length;
      toast.success(
        "Comida actualizada",
        count > 1
          ? `Se actualizó ${MEAL_SLOT_LABELS[mealType]} en ${count} días`
          : `Se actualizó ${MEAL_SLOT_LABELS[mealType]} del ${DAY_LABELS[day]}`
      );

      onSlotUpdated();
      onClose();
    } catch (error) {
      console.error("Error saving slot:", error);
      toast.error("Error", "No se pudo guardar la comida");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Editar {MEAL_SLOT_LABELS[mealType]} - {DAY_LABELS[day]}
          </DialogTitle>
          <DialogDescription>
            Modifica esta comida manualmente, elegí una comida guardada o analizá una nueva.
          </DialogDescription>
        </DialogHeader>

        {/* Mode tabs */}
        <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5">
          {[
            { id: "manual" as EditMode, label: "Manual", icon: Pencil },
            { id: "saved" as EditMode, label: "Guardadas", icon: BookmarkCheck },
            { id: "analyze" as EditMode, label: "Analizar", icon: Camera },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  mode === tab.id
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── MANUAL MODE ──────────────────────────── */}
        {mode === "manual" && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            <div>
              <Label>Nombre de la comida</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Pollo con arroz y ensalada"
              />
            </div>

            {/* Foods list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Alimentos</Label>
                <Button size="sm" variant="outline" onClick={addFood} className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Agregar
                </Button>
              </div>

              {foods.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Sin alimentos. Agregá uno o editá directamente los macros totales abajo.
                </p>
              )}

              <div className="space-y-3">
                {foods.map((food, i) => (
                  <div key={i} className="rounded-lg border bg-muted/30 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={food.name}
                        onChange={(e) => updateFood(i, "name", e.target.value)}
                        placeholder="Nombre"
                        className="flex-1 h-8 text-sm"
                      />
                      <Input
                        value={food.quantity}
                        onChange={(e) => updateFood(i, "quantity", e.target.value)}
                        placeholder="Cantidad"
                        className="w-24 h-8 text-sm"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeFood(i)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">Kcal</label>
                        <Input
                          type="number"
                          value={food.calories || ""}
                          onChange={(e) => updateFood(i, "calories", e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Prot (g)</label>
                        <Input
                          type="number"
                          value={food.macronutrients?.protein || ""}
                          onChange={(e) => updateFood(i, "macro.protein", e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Carbs (g)</label>
                        <Input
                          type="number"
                          value={food.macronutrients?.carbs || ""}
                          onChange={(e) => updateFood(i, "macro.carbs", e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Grasa (g)</label>
                        <Input
                          type="number"
                          value={food.macronutrients?.fat || ""}
                          onChange={(e) => updateFood(i, "macro.fat", e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total macros override */}
            <div className="rounded-lg border p-3 space-y-2">
              <Label className="text-xs font-medium">Totales</Label>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">Kcal</label>
                  <Input
                    type="number"
                    value={totalCalories || ""}
                    onChange={(e) => setTotalCalories(Number(e.target.value))}
                    className="h-8 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Prot (g)</label>
                  <Input
                    type="number"
                    value={macros.protein || ""}
                    onChange={(e) => setMacros({ ...macros, protein: Number(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Carbs (g)</label>
                  <Input
                    type="number"
                    value={macros.carbs || ""}
                    onChange={(e) => setMacros({ ...macros, carbs: Number(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Grasa (g)</label>
                  <Input
                    type="number"
                    value={macros.fat || ""}
                    onChange={(e) => setMacros({ ...macros, fat: Number(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Notas (opcional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Sin sal, doble porción..."
                rows={2}
                className="text-sm"
              />
            </div>
          </div>
        )}

        {/* ─── SAVED MEALS MODE ─────────────────────── */}
        {mode === "saved" && (
          <div className="max-h-[55vh] overflow-y-auto pr-1">
            {loadingSavedMeals ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : savedMeals.length === 0 ? (
              <div className="text-center py-8">
                <BookmarkCheck className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No tenés comidas guardadas todavía
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Podés guardar comidas desde la sección de Comidas cuando analizás un alimento
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedMeals.map((meal) => (
                  <button
                    key={meal.id}
                    onClick={() => applySavedMeal(meal)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      selectedSavedMeal?.id === meal.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{meal.name}</p>
                        {meal.description && (
                          <p className="text-xs text-muted-foreground truncate">{meal.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {meal.totalCalories} kcal
                          </span>
                          <span>
                            P:{meal.macronutrients?.protein}g C:{meal.macronutrients?.carbs}g G:{meal.macronutrients?.fat}g
                          </span>
                        </div>
                      </div>
                      {selectedSavedMeal?.id === meal.id && (
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── ANALYZE MODE ─────────────────────────── */}
        {mode === "analyze" && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            <div>
              <Label>Describí qué vas a comer</Label>
              <Textarea
                value={analyzeText}
                onChange={(e) => setAnalyzeText(e.target.value)}
                placeholder="Ej: 200g de pechuga de pollo a la plancha con 150g de arroz integral y ensalada de tomate y lechuga"
                rows={3}
                className="text-sm"
              />
            </div>

            <div>
              <Label>O subí una foto</Label>
              <div className="mt-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-sm"
                />
              </div>
              {analyzeImage && (
                <p className="text-xs text-green-600 mt-1">Foto cargada</p>
              )}
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!analyzeText && !analyzeImage)}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Analizar comida
                </>
              )}
            </Button>

            {analyzedResult && (
              <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-3 space-y-2">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Análisis completado
                </p>
                <div className="space-y-1">
                  {analyzedResult.foods.map((food, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-medium">{food.name}</span>
                      <span className="text-muted-foreground"> — {food.quantity} · {food.calories} kcal</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 text-xs font-medium pt-1 border-t border-green-200 dark:border-green-800">
                  <span>{analyzedResult.totalCalories} kcal</span>
                  <span className="text-muted-foreground">
                    P:{analyzedResult.macronutrients.protein}g
                    C:{analyzedResult.macronutrients.carbs}g
                    G:{analyzedResult.macronutrients.fat}g
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── BULK EDIT TOGGLE ─────────────────────── */}
        <div className="border-t border-border/50 pt-3">
          <button
            onClick={() => setBulkMode(!bulkMode)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
            {bulkMode
              ? "Aplicar solo a este día"
              : "Aplicar a varios días"}
          </button>

          {bulkMode && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Seleccioná los días donde aplicar esta {MEAL_SLOT_LABELS[mealType].toLowerCase()}:
                </span>
                <button
                  onClick={selectAllDays}
                  className="text-xs text-primary hover:underline"
                >
                  Todos
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DAY_KEYS.map((d) => (
                  <button
                    key={d}
                    onClick={() => toggleDay(d)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedDays.includes(d)
                        ? "bg-primary text-primary-foreground"
                        : d === day
                        ? "bg-muted text-muted-foreground border border-primary/30"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {DAY_LABELS[d].slice(0, 3)}
                    {d === day && (
                      <Badge variant="secondary" className="ml-1 text-[8px] px-1 py-0">
                        actual
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
              {selectedDays.length > 0 && (
                <p className="text-xs text-primary">
                  Se aplicará a {selectedDays.length} día{selectedDays.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ─── ACTION BUTTONS ───────────────────────── */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={isSaving || !name.trim()}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : bulkMode && selectedDays.length > 1 ? (
              `Guardar en ${selectedDays.length} días`
            ) : (
              "Guardar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
