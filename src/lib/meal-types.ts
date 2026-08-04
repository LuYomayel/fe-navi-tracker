import { MealType } from "@/types";

/** Etiqueta en español de cada tipo de comida (fuente unica). */
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  [MealType.BREAKFAST]: "Desayuno",
  [MealType.LUNCH]: "Almuerzo",
  [MealType.MERIENDA]: "Merienda",
  [MealType.DINNER]: "Cena",
  [MealType.SNACK]: "Snack",
  [MealType.OTHER]: "Otro",
};

/** Lista ordenada para selects / chips de tipo de comida. */
export const MEAL_TYPE_OPTIONS: { value: MealType; label: string }[] = (
  Object.keys(MEAL_TYPE_LABELS) as MealType[]
).map((value) => ({ value, label: MEAL_TYPE_LABELS[value] }));

/**
 * Etiqueta de un mealType. Para valores desconocidos (datos viejos) devuelve
 * el valor capitalizado en vez de romper.
 */
export function mealTypeLabel(value: string): string {
  return (
    MEAL_TYPE_LABELS[value as MealType] ??
    value.charAt(0).toUpperCase() + value.slice(1)
  );
}
