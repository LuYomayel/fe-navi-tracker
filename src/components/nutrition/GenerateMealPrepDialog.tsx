"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import { useMealPrep } from "@/hooks/useMealPrep";
import { api } from "@/lib/api-client";
import { getDateKey } from "@/lib/utils";
import {
  DayKey,
  MealSlotKey,
  DAY_KEYS,
  DAY_LABELS,
  MEAL_SLOT_LABELS,
  FixedSlot,
  SavedMeal,
} from "@/types";

interface GenerateMealPrepDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function getNextMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 0 : 8 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + daysUntilMonday);
  return getDateKey(monday);
}

export function GenerateMealPrepDialog({
  isOpen,
  onClose,
}: GenerateMealPrepDialogProps) {
  const { generatePrep, isGenerating, activePlan, loadActivePlan } =
    useMealPrep();

  const [weekStartDate, setWeekStartDate] = useState(getNextMonday());
  const [userContext, setUserContext] = useState("");
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>([]);
  const [selectedMealIds, setSelectedMealIds] = useState<string[]>([]);
  const [fixedSlots, setFixedSlots] = useState<FixedSlot[]>([]);

  // Fixed slot builder state
  const [fixedDay, setFixedDay] = useState<DayKey>("monday");
  const [fixedMealType, setFixedMealType] = useState<MealSlotKey>("breakfast");
  const [fixedMealId, setFixedMealId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      loadActivePlan();
      loadSavedMeals();
    }
  }, [isOpen, loadActivePlan]);

  const loadSavedMeals = async () => {
    try {
      const res = await api.savedMeals.getAll();
      if (res.success && res.data) {
        setSavedMeals(res.data);
      }
    } catch (e) {
      console.error("Error loading saved meals:", e);
    }
  };

  const toggleMealSelection = (id: string) => {
    setSelectedMealIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const addFixedSlot = () => {
    if (!fixedMealId) return;
    const meal = savedMeals.find((m) => m.id === fixedMealId);
    if (!meal) return;

    setFixedSlots((prev) => [
      ...prev.filter(
        (s) => !(s.day === fixedDay && s.mealType === fixedMealType)
      ),
      { day: fixedDay, mealType: fixedMealType, savedMealId: fixedMealId },
    ]);
    setFixedMealId("");
  };

  const removeFixedSlot = (index: number) => {
    setFixedSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    try {
      await generatePrep({
        weekStartDate,
        userContext: userContext || undefined,
        fixedSlots: fixedSlots.length > 0 ? fixedSlots : undefined,
        savedMealPreferences:
          selectedMealIds.length > 0 ? selectedMealIds : undefined,
      });
      onClose();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Generar Meal Prep con IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Active Plan info */}
          {activePlan && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs font-medium text-primary">
                Plan activo: {activePlan.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Se usara como base para la generacion
              </p>
            </div>
          )}

          {/* Week Start Date */}
          <div className="space-y-1.5">
            <Label>Semana del (lunes)</Label>
            <Input
              type="date"
              value={weekStartDate}
              onChange={(e) => setWeekStartDate(e.target.value)}
            />
          </div>

          {/* User Context */}
          <div className="space-y-1.5">
            <Label>Contexto (opcional)</Label>
            <Textarea
              rows={3}
              placeholder="Ej: Tengo pollo y arroz, quiero algo rapido para cocinar, evitar lacteos esta semana..."
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Contale a la IA que tenes disponible o preferencias especiales
            </p>
          </div>

          {/* Saved Meals Selection */}
          {savedMeals.length > 0 && (
            <div className="space-y-1.5">
              <Label>Comidas guardadas a incluir</Label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {savedMeals.map((meal) => (
                  <Badge
                    key={meal.id}
                    variant={
                      selectedMealIds.includes(meal.id)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer text-xs"
                    onClick={() => toggleMealSelection(meal.id)}
                  >
                    {selectedMealIds.includes(meal.id) && (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    {meal.name}
                    <span className="ml-1 opacity-60">
                      {meal.totalCalories}kcal
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Fixed Slots */}
          <div className="space-y-2">
            <Label>Slots fijos (opcional)</Label>
            <p className="text-xs text-muted-foreground">
              Fija comidas que repetis siempre (ej: desayuno L-V siempre igual)
            </p>

            {/* Existing fixed slots */}
            {fixedSlots.length > 0 && (
              <div className="space-y-1">
                {fixedSlots.map((slot, i) => {
                  const meal = savedMeals.find(
                    (m) => m.id === slot.savedMealId
                  );
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs bg-muted/50 rounded-lg px-2 py-1.5"
                    >
                      <span>
                        {DAY_LABELS[slot.day]} · {MEAL_SLOT_LABELS[slot.mealType]} ·{" "}
                        <span className="font-medium">
                          {meal?.name || "?"}
                        </span>
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => removeFixedSlot(i)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add fixed slot */}
            {savedMeals.length > 0 && (
              <div className="flex gap-1.5 items-end flex-wrap">
                <select
                  value={fixedDay}
                  onChange={(e) => setFixedDay(e.target.value as DayKey)}
                  className="h-8 rounded-md border bg-background px-2 text-xs"
                >
                  {DAY_KEYS.map((d) => (
                    <option key={d} value={d}>
                      {DAY_LABELS[d]}
                    </option>
                  ))}
                </select>
                <select
                  value={fixedMealType}
                  onChange={(e) =>
                    setFixedMealType(e.target.value as MealSlotKey)
                  }
                  className="h-8 rounded-md border bg-background px-2 text-xs"
                >
                  {(
                    ["breakfast", "lunch", "snack", "dinner"] as MealSlotKey[]
                  ).map((m) => (
                    <option key={m} value={m}>
                      {MEAL_SLOT_LABELS[m]}
                    </option>
                  ))}
                </select>
                <select
                  value={fixedMealId}
                  onChange={(e) => setFixedMealId(e.target.value)}
                  className="h-8 rounded-md border bg-background px-2 text-xs flex-1 min-w-[120px]"
                >
                  <option value="">Elegir comida...</option>
                  {savedMeals.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={addFixedSlot}
                  disabled={!fixedMealId}
                >
                  Agregar
                </Button>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !weekStartDate}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando plan...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generar Meal Prep
              </>
            )}
          </Button>

          {isGenerating && (
            <p className="text-xs text-muted-foreground text-center">
              Esto puede tardar 15-30 segundos...
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
