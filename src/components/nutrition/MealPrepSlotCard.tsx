"use client";

import { Check, UtensilsCrossed, Clock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MealPrepSlot, MEAL_SLOT_LABELS, MealSlotKey } from "@/types";

interface MealPrepSlotCardProps {
  slot: MealPrepSlot | null;
  mealType: MealSlotKey;
  onEat?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}

export function MealPrepSlotCard({
  slot,
  mealType,
  onEat,
  onEdit,
  compact = false,
}: MealPrepSlotCardProps) {
  if (!slot) {
    return (
      <div className="p-2 sm:p-3 rounded-lg border border-dashed border-border/50 text-center">
        <p className="text-xs text-muted-foreground">Sin planificar</p>
      </div>
    );
  }

  const isEaten = !!slot.eatenAt;
  const macros = slot.macronutrients;

  if (compact) {
    return (
      <div
        className={`p-2 rounded-lg border text-xs transition-colors ${
          isEaten
            ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
            : "bg-card border-border/50 hover:border-primary/30"
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{slot.name}</p>
            <p className="text-muted-foreground">{slot.totalCalories} kcal</p>
          </div>
          {isEaten ? (
            <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
          ) : onEat ? (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onEat();
              }}
            >
              <UtensilsCrossed className="h-3 w-3" />
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-3 sm:p-4 rounded-xl border transition-colors ${
        isEaten
          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
          : "bg-card border-border hover:border-primary/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              {MEAL_SLOT_LABELS[mealType]}
            </span>
            {slot.isFixed && (
              <Badge variant="secondary" className="text-[10px] px-1 py-0">
                Fijo
              </Badge>
            )}
            {slot.savedMealId && (
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                Guardada
              </Badge>
            )}
          </div>
          <p className="font-medium text-sm sm:text-base">{slot.name}</p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {onEdit && !isEaten && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={onEdit}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Foods list */}
      {slot.foods && slot.foods.length > 0 && (
        <div className="mb-2">
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {slot.foods.slice(0, 4).map((food, i) => (
              <li key={i} className="truncate">
                {food.name} {food.quantity && `(${food.quantity})`}
              </li>
            ))}
            {slot.foods.length > 4 && (
              <li className="text-primary">+{slot.foods.length - 4} mas...</li>
            )}
          </ul>
        </div>
      )}

      {/* Macros */}
      <div className="flex items-center gap-2 text-xs mb-2">
        <span className="font-semibold text-sm">{slot.totalCalories} kcal</span>
        {macros && (
          <div className="flex gap-1.5 text-muted-foreground">
            <span>P:{macros.protein}g</span>
            <span>C:{macros.carbs}g</span>
            <span>G:{macros.fat}g</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {slot.notes && (
        <p className="text-xs text-muted-foreground italic mb-2 line-clamp-2">
          {slot.notes}
        </p>
      )}

      {/* Actions */}
      {isEaten ? (
        <div className="flex items-center gap-1.5 text-xs text-green-600">
          <Check className="h-3.5 w-3.5" />
          <span>Comida registrada</span>
          {slot.eatenAt && (
            <span className="text-muted-foreground flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {new Date(slot.eatenAt).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      ) : onEat ? (
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs h-8"
          onClick={onEat}
        >
          <UtensilsCrossed className="h-3.5 w-3.5 mr-1.5" />
          Marcar como comida
        </Button>
      ) : null}
    </div>
  );
}
