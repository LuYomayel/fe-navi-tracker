export interface Activity {
  id: string;
  name: string;
  description?: string;
  time?: string;
  days: boolean[]; // [L, M, X, J, V, S, D]
  color: string;
  category?: string;
  archived?: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyCompletion {
  id: string;
  activityId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  notes?: string;
  createdAt: Date;
}

export interface WeeklyProgress {
  weekStart: string; // YYYY-MM-DD
  activities: Activity[];
  completions: DailyCompletion[];
  stats: {
    totalActivities: number;
    completedActivities: number;
    completionRate: number;
    bestActivity: {
      activity: Activity;
      rate: number;
    } | null;
    streak: number;
  };
}

export interface DailyNote {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  mood?: number; // 1-5
  predefinedComments?: string[]; // IDs de comentarios predefinidos seleccionados
  customComment?: string; // Comentario personalizado del usuario
  aiAnalysis?: {
    patterns: string[];
    suggestions: string[];
    analyzedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PredefinedComment {
  id: string;
  text: string;
  category: CommentCategory;
  keywords: string[]; // Para análisis de IA
  triggers?: string[]; // Patrones que pueden activar sugerencias
}

export enum CommentCategory {
  SLEEP = "sleep",
  MENTAL = "mental",
  ENERGY = "energy",
  HABITS = "habits",
  READING = "reading",
  NUTRITION = "nutrition",
  CUSTOM = "custom",
}

export interface CommentAnalysis {
  date: string;
  selectedComments: PredefinedComment[];
  customComment?: string;
  detectedPatterns: string[];
  suggestions: AISuggestion[];
  moodTrend?: {
    current: number;
    trend: "up" | "down" | "stable";
    weekAverage: number;
  };
}

export interface AISuggestion {
  id: string;
  type: "habit" | "routine" | "reminder" | "goal";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  basedOn: string[]; // IDs de comentarios que generaron esta sugerencia
  actions?: {
    label: string;
    type: "add_activity" | "modify_routine" | "set_reminder";
    data?: Record<string, unknown>;
  }[];
  createdAt: Date;
  dismissedAt?: Date;
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  activities?: ParsedActivity[];
  extractedActivities?: Array<{
    name: string;
    frequency?: string;
    time?: string;
    category?: string;
    days: boolean[];
  }>;
  activitiesDetected?: boolean;
  needsValidation?: boolean;
  validationQuestions?: string[];
}

export interface UserPreferences {
  darkMode: boolean;
  weekStartsOnMonday: boolean;
  notifications: boolean;
  language: "es" | "en";

  // Objetivos nutricionales
  dailyCalorieGoal?: number;
  proteinGoal?: number; // gramos
  carbsGoal?: number; // gramos
  fatGoal?: number; // gramos

  // Objetivos corporales
  bodyFatGoal?: number; // porcentaje
  muscleMassGoal?: number; // kg
  targetWeight?: number; // kg

  // Datos personales para cálculos
  height?: number; // cm
  currentWeight?: number; // kg
  age?: number;
  gender?: "male" | "female" | "other";
  activityLevel?: ActivityLevel;
  fitnessGoals?: string[]; // ["lose_weight", "gain_muscle", etc.]
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Domingo, 6 = Sábado

export interface CalendarData {
  weekStart: Date;
  activities: Activity[];
  completions: Map<string, boolean>; // "activityId-YYYY-MM-DD" -> completed
}

// Tipos para análisis nutricional
export interface NutritionAnalysis {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  foods: DetectedFood[];
  totalCalories: number;
  macronutrients: Macronutrients;
  imageUrl: string;
  aiConfidence: number; // 0-1
  userAdjustments?: UserNutritionAdjustments;
  createdAt: Date;
  updatedAt: Date;
}

export enum MealType {
  BREAKFAST = "breakfast",
  LUNCH = "lunch",
  DINNER = "dinner",
  SNACK = "snack",
  OTHER = "other",
}

export interface DetectedFood {
  name: string;
  quantity: string; // "1 taza", "150g", etc.
  calories: number;
  confidence: number; // 0-1
  macronutrients: Macronutrients;
  category: FoodCategory;
}

export interface Macronutrients {
  protein: number; // gramos
  carbs: number; // gramos
  fat: number; // gramos
  fiber: number; // gramos
  sugar: number; // gramos
  sodium: number; // miligramos
}

export enum FoodCategory {
  PROTEIN = "protein",
  CARBS = "carbs",
  VEGETABLES = "vegetables",
  FRUITS = "fruits",
  DAIRY = "dairy",
  FATS = "fats",
  BEVERAGES = "beverages",
  PROCESSED = "processed",
  OTHER = "other",
}

export interface UserNutritionAdjustments {
  adjustedCalories?: number;
  adjustedFoods?: DetectedFood[];
  notes?: string;
  correctedMealType?: MealType;
}

// Tipos para análisis de tipo corporal
export interface BodyAnalysis {
  id?: string;
  bodyType: BodyType;
  measurements?: {
    bodyFat?: number;
    muscleMass?: number;
    bmi?: number;
  };
  recommendations?: string[];
  confidence: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BodyMeasurements {
  height: number; // cm
  weight: number; // kg
  age: number;
  gender?: "male" | "female" | "other";
  activityLevel: ActivityLevel;
  // Medidas detectadas por IA (opcionales)
  waist?: number; // cm
  chest?: number; // cm
  hips?: number; // cm
  bodyFatPercentage?: number; // %
}

export enum ActivityLevel {
  SEDENTARY = "sedentary", // Poco o ningún ejercicio
  LIGHT = "light", // Ejercicio ligero 1-3 días/semana
  MODERATE = "moderate", // Ejercicio moderado 3-5 días/semana
  ACTIVE = "active", // Ejercicio intenso 6-7 días/semana
  VERY_ACTIVE = "very_active", // Ejercicio muy intenso o trabajo físico
}

export enum BodyType {
  ECTOMORPH = "ectomorph", // Delgado, dificultad para ganar peso
  MESOMORPH = "mesomorph", // Atlético, gana músculo fácilmente
  ENDOMORPH = "endomorph", // Tendencia a acumular grasa, metabolismo lento
}

export interface BodyComposition {
  bodyType: BodyType;
  muscleMass: "low" | "medium" | "high";
  bodyFat: "low" | "medium" | "high";
  metabolism: "slow" | "medium" | "fast";
  boneDensity: "light" | "medium" | "heavy";
}

export interface NutritionRecommendations {
  dailyCalories: number;
  macroSplit: {
    protein: number; // %
    carbs: number; // %
    fat: number; // %
  };
  mealTiming: MealTiming[];
  supplements?: string[];
  restrictions?: string[];
  goals: NutritionGoal[];
}

export interface MealTiming {
  mealType: MealType;
  timeWindow: string; // "7:00-9:00", "12:00-14:00"
  caloriePercentage: number; // % del total diario
  macroFocus: "protein" | "carbs" | "balanced";
}

export enum NutritionGoal {
  LOSE_FAT = "lose_fat",
  GAIN_MUSCLE = "gain_muscle",
  MAINTAIN_WEIGHT = "maintain_weight",
  IMPROVE_HEALTH = "improve_health",
  INCREASE_ENERGY = "increase_energy",
  BETTER_SLEEP = "better_sleep",
}

// Tipos para seguimiento nutricional diario
export interface DailyNutritionLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  meals: NutritionAnalysis[];
  dailyTotals: Macronutrients & { calories: number };
  waterIntake: number; // litros
  goals: NutritionGoal[];
  adherenceScore: number; // 0-100
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NutritionInsight {
  id: string;
  type: "deficiency" | "excess" | "trend" | "achievement";
  title: string;
  description: string;
  metric: string; // "protein", "calories", "water", etc.
  value: number;
  target: number;
  timeframe: "daily" | "weekly" | "monthly";
  severity: "low" | "medium" | "high";
  recommendations: string[];
  createdAt: Date;
}

export interface ParsedActivity {
  name: string;
  days: boolean[];
  category?: string;
  time?: string;
  description?: string;
}

export interface Analysis {
  id: string;
  date: string; // YYYY-MM-DD
  detectedPatterns: string[];
  mood: number; // 1-5 scale
  notes?: string;
  createdAt: Date;
}

// Re-export skinfold types
export * from "./skinFold";
