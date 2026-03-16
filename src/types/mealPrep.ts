import { DetectedFood, Macronutrients } from "./index";

// ─── Day & Meal Slot Keys ─────────────────────────────────────

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type MealSlotKey = "breakfast" | "lunch" | "snack" | "dinner";

export const DAY_KEYS: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const MEAL_SLOT_KEYS: MealSlotKey[] = [
  "breakfast",
  "lunch",
  "snack",
  "dinner",
];

export const DAY_LABELS: Record<DayKey, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export const MEAL_SLOT_LABELS: Record<MealSlotKey, string> = {
  breakfast: "Desayuno",
  lunch: "Almuerzo",
  snack: "Merienda",
  dinner: "Cena",
};

// ─── Meal Prep Slot (cada comida individual) ──────────────────

export interface MealPrepSlot {
  name: string;
  foods: DetectedFood[];
  totalCalories: number;
  macronutrients: Macronutrients;
  notes?: string;
  savedMealId?: string;
  eatenAt?: string; // ISO datetime
  nutritionAnalysisId?: string;
  isFixed?: boolean;
}

// ─── Meal Prep Day & Week ─────────────────────────────────────

export interface MealPrepDay {
  slots: Record<MealSlotKey, MealPrepSlot | null>;
}

export interface MealPrepWeek {
  days: Record<DayKey, MealPrepDay>;
}

// ─── Macro Summary ────────────────────────────────────────────

export interface MacroSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

// ─── Nutritionist Plan ────────────────────────────────────────

export interface NutritionistMealSlot {
  name: string;
  description?: string;
  foods: string[]; // Raw text: ["100g arroz integral", "150g pollo"]
  estimatedCalories?: number;
  notes?: string;
}

export interface NutritionistDayPlan {
  breakfast?: NutritionistMealSlot | null;
  lunch?: NutritionistMealSlot | null;
  snack?: NutritionistMealSlot | null;
  dinner?: NutritionistMealSlot | null;
}

export interface ParsedNutritionistPlan {
  days: Record<DayKey, NutritionistDayPlan>;
  generalNotes?: string;
  restrictions?: string[];
  targetCalories?: number;
  targetMacros?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
}

export interface NutritionistPlan {
  id: string;
  userId: string;
  name: string;
  rawText?: string;
  parsedPlan: ParsedNutritionistPlan;
  weeklyNotes?: string;
  pdfFilename?: string;
  isActive: boolean;
  aiConfidence?: number;
  aiCostUsd?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Meal Prep ────────────────────────────────────────────────

export interface MealPrep {
  id: string;
  userId: string;
  nutritionistPlanId?: string;
  weekStartDate: string; // YYYY-MM-DD (lunes)
  weekEndDate: string; // YYYY-MM-DD (domingo)
  name?: string;
  days: Record<DayKey, MealPrepDay>;
  dailyTotals: Record<DayKey, MacroSummary>;
  weeklyTotals: MacroSummary;
  userContext?: string;
  status: "active" | "archived";
  aiCostUsd?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─── DTOs (for API calls) ─────────────────────────────────────

export interface ImportNutritionistPlanDto {
  images: string[]; // base64 por página del PDF
  name: string;
  pdfFilename?: string;
}

export interface UpdateNutritionistPlanDto {
  name?: string;
  isActive?: boolean;
}

export interface FixedSlot {
  day: DayKey;
  mealType: MealSlotKey;
  savedMealId?: string;
  customSlot?: Partial<MealPrepSlot>;
}

export interface GenerateMealPrepDto {
  nutritionistPlanId?: string;
  userContext?: string;
  weekStartDate: string; // YYYY-MM-DD del lunes
  fixedSlots?: FixedSlot[];
  savedMealPreferences?: string[]; // IDs de SavedMeals
}

export interface CreateMealPrepDto {
  weekStartDate: string;
  nutritionistPlanId?: string;
  name?: string;
  days: MealPrepWeek;
}

export interface UpdateMealPrepDto {
  name?: string;
  days?: MealPrepWeek;
  status?: "active" | "archived";
}

export interface UpdateSlotDto {
  day: DayKey;
  mealType: MealSlotKey;
  slot: Partial<MealPrepSlot>;
}

export interface MarkSlotEatenDto {
  day: DayKey;
  mealType: MealSlotKey;
  date: string; // YYYY-MM-DD
}
