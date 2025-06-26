import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Función helper para obtener la clave de fecha en formato YYYY-MM-DD
export function getDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Función para calcular objetivos nutricionales basados en análisis corporal
export function calculateNutritionGoalsFromBodyAnalysis(
  bodyAnalysis: Record<string, unknown>,
  personalData?: {
    height: number;
    currentWeight: number;
    targetWeight?: number;
    age: number;
    gender: "male" | "female" | "other";
    activityLevel:
      | "sedentary"
      | "light"
      | "moderate"
      | "active"
      | "very_active";
    fitnessGoal?: string;
  }
): {
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  console.log("Body analysis received:", bodyAnalysis);
  console.log("Personal data received:", personalData);

  // Si no hay datos personales, usar valores por defecto
  if (!personalData) {
    return {
      dailyCalories: 2000,
      protein: 150, // gramos
      carbs: 250, // gramos
      fat: 67, // gramos
    };
  }

  // Calcular BMR (Metabolismo Basal) usando la fórmula de Mifflin-St Jeor
  let bmr: number;
  if (personalData.gender === "male") {
    bmr =
      10 * personalData.currentWeight +
      6.25 * personalData.height -
      5 * personalData.age +
      5;
  } else {
    bmr =
      10 * personalData.currentWeight +
      6.25 * personalData.height -
      5 * personalData.age -
      161;
  }

  // Factores de actividad
  const activityFactors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  // Calcular TDEE (Total Daily Energy Expenditure)
  const tdee = bmr * activityFactors[personalData.activityLevel];

  // Ajustar calorías según el objetivo
  let dailyCalories = tdee;
  let proteinRatio = 0.3; // 30% proteína por defecto
  let carbsRatio = 0.4; // 40% carbohidratos por defecto
  let fatRatio = 0.3; // 30% grasas por defecto

  switch (personalData.fitnessGoal) {
    case "lose_weight":
      dailyCalories = tdee * 0.8; // Déficit de 20%
      proteinRatio = 0.35; // Más proteína para preservar músculo
      carbsRatio = 0.35;
      fatRatio = 0.3;
      break;
    case "gain_muscle":
      dailyCalories = tdee * 1.1; // Superávit de 10%
      proteinRatio = 0.3;
      carbsRatio = 0.45; // Más carbohidratos para energía
      fatRatio = 0.25;
      break;
    case "define":
      dailyCalories = tdee * 0.9; // Déficit ligero
      proteinRatio = 0.4; // Alta proteína
      carbsRatio = 0.3;
      fatRatio = 0.3;
      break;
    case "maintain":
      dailyCalories = tdee;
      // Mantener ratios por defecto
      break;
    case "bulk":
      dailyCalories = tdee * 1.2; // Superávit de 20%
      proteinRatio = 0.25;
      carbsRatio = 0.5;
      fatRatio = 0.25;
      break;
    case "recomp":
      dailyCalories = tdee * 0.95; // Déficit muy ligero
      proteinRatio = 0.35;
      carbsRatio = 0.4;
      fatRatio = 0.25;
      break;
  }

  // Calcular macronutrientes en gramos
  const protein = Math.round((dailyCalories * proteinRatio) / 4); // 4 cal/g
  const carbs = Math.round((dailyCalories * carbsRatio) / 4); // 4 cal/g
  const fat = Math.round((dailyCalories * fatRatio) / 9); // 9 cal/g

  return {
    dailyCalories: Math.round(dailyCalories),
    protein,
    carbs,
    fat,
  };
}

// Funciones temporales para el calendario
export function getWeekDates(date: Date): Date[] {
  const week = [];
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    week.push(day);
  }
  return week;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function getDayNames(): string[] {
  return ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
}

export function getFullDayNames(): string[] {
  return [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
}

export function formatTime(time: string): string {
  return time || "00:00";
}

// Funciones para colores de actividades
export function getActivityColors(): string[] {
  return [
    "#3B82F6", // blue
    "#EF4444", // red
    "#10B981", // emerald
    "#F59E0B", // amber
    "#8B5CF6", // violet
    "#EC4899", // pink
    "#06B6D4", // cyan
    "#84CC16", // lime
  ];
}

export function getRandomColor(): string {
  const colors = getActivityColors();
  return colors[Math.floor(Math.random() * colors.length)];
}

// Funciones para comentarios (implementación temporal)
export function getCommentsGroupedByCategory(): Record<string, unknown> {
  return {};
}

export const PREDEFINED_COMMENTS: unknown[] = [];
export const CATEGORY_EMOJIS: Record<string, string> = {};
export const CATEGORY_NAMES: Record<string, string> = {};

// Función para generar IDs únicos
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
