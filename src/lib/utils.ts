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
  bodyAnalysis: Record<string, unknown>
): {
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  // Implementación temporal - esto debería ser reemplazado con lógica real
  // Por ahora ignoramos el parámetro bodyAnalysis y devolvemos valores por defecto
  console.log("Body analysis received:", bodyAnalysis);

  return {
    dailyCalories: 2000,
    protein: 150, // gramos
    carbs: 250, // gramos
    fat: 67, // gramos
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
