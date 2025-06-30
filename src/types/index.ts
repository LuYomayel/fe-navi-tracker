// import { EachMonthOfIntervalOptions } from "date-fns";

import { User } from "@/modules/auth/types";

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
  completions?: DailyCompletion[];
  userId: string;
  user: User;
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
  date: string;
  mealType: string;
  foods: DetectedFood[];
  totalCalories: number;
  macronutrients: Macronutrients;
  imageUrl?: string;
  aiConfidence: number;
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

export interface FoodAnalysisResponse {
  foods: DetectedFood[];
  totalCalories: number;
  macronutrients: Macronutrients;
  confidence: number;
  mealType: MealType;
  recommendations?: string[];
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
    height?: number;
    weight?: number;
  };
  bodyComposition: BodyComposition;
  recommendations?: NutritionRecommendations;
  progress: {
    strengths: string[];
    areasToImprove: string[];
    generalAdvice: string;
  };
  disclaimer: string;
  confidence: number;
  createdAt?: Date;
  updatedAt?: Date;
  // Agregar toda la información completa de la API
  fullAnalysisData?: {
    measurements: BodyMeasurements;
    bodyComposition: BodyComposition;
    recommendations: NutritionRecommendations;
    progress: {
      strengths: string[];
      areasToImprove: string[];
      generalAdvice: string;
    };
    disclaimer: string;
    insights?: string[];
  };
  insights?: string[];
}

export interface BodyMeasurements {
  estimatedBodyFat?: number;
  bodyFatPercentage?: number;
  muscleDefinition: "low" | "moderate" | "high" | "very_high";
  posture: "needs_attention" | "fair" | "good" | "excellent";
  symmetry: "needs_attention" | "fair" | "good" | "excellent";
  overallFitness: "beginner" | "intermediate" | "advanced" | "athlete";
  age?: number;
  gender?: "male" | "female" | "other";
  activityLevel?: ActivityLevel;
  goals?: string[];
  height?: number;
  weight?: number;
  waist?: number;
  chest?: number;
  hips?: number;
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
  estimatedBMI?: number;
  bodyType: BodyType;
  muscleMass: "low" | "medium" | "high";
  bodyFat: "low" | "medium" | "high";
  metabolism: "slow" | "medium" | "fast";
  boneDensity: "light" | "medium" | "heavy";
  muscleGroups: Array<{
    name: string;
    development:
      | "underdeveloped"
      | "developing"
      | "well_developed"
      | "good"
      | "excellent"
      | "highly_developed";
    recommendations: string[];
  }>;
}

export interface NutritionRecommendations {
  nutrition: string[];
  priority:
    | "cardio"
    | "strength"
    | "flexibility"
    | "balance"
    | "general_fitness";
  dailyCalories?: number;
  macroSplit?: {
    protein: number; // %
    carbs: number; // %
    fat: number; // %
  };
  //mealTiming: MealTiming[];
  supplements?: string[];
  restrictions?: string[];
  goals: string[]; // Cambiar de NutritionGoal[] a string[] para coincidir con la API
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

export interface BodyAnalysisApiResponse {
  bodyType: BodyType;
  bodyComposition: BodyComposition;
  measurements: BodyMeasurements;
  recommendations: NutritionRecommendations;
  progress: {
    strengths: string[];
    areasToImprove: string[];
    generalAdvice: string;
  };
  confidence: number;
  disclaimer: string;
  insights?: string[];
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

// Api Response Types

// Body Analysis Request
export interface BodyAnalysisRequest {
  image: string; // Base64 encoded image
  currentWeight?: number;
  targetWeight?: number;
  height?: number;
  age?: number;
  gender?: "male" | "female" | "other";
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goals?: string[];
  allowGeneric?: boolean;
}

// Body Analysis Response
export interface BodyAnalysisResponse {
  bodyType: BodyType;
  bodyComposition: {
    estimatedBMI?: number;
    bodyType: BodyType;
    muscleMass: "low" | "medium" | "high";
    bodyFat: "low" | "medium" | "high";
    metabolism: "slow" | "medium" | "fast";
    boneDensity: "light" | "medium" | "heavy";
    muscleGroups: Array<{
      name: string;
      development:
        | "underdeveloped"
        | "developing"
        | "well_developed"
        | "good"
        | "excellent"
        | "highly_developed";
      recommendations: string[];
    }>;
  };
  measurements: {
    estimatedBodyFat?: number;
    bodyFatPercentage?: number;
    muscleDefinition: "low" | "moderate" | "high" | "very_high";
    posture: "needs_attention" | "fair" | "good" | "excellent";
    symmetry: "needs_attention" | "fair" | "good" | "excellent";
    overallFitness: "beginner" | "intermediate" | "advanced" | "athlete";
    height?: number;
    weight?: number;
    waist?: number;
    chest?: number;
    hips?: number;
  };

  recommendations: {
    nutrition: string[];
    priority:
      | "cardio"
      | "strength"
      | "flexibility"
      | "balance"
      | "general_fitness";
    dailyCalories?: number;
    macroSplit?: {
      protein: number;
      carbs: number;
      fat: number;
    };
    supplements?: string[];
  };
  progress: {
    strengths: string[];
    areasToImprove: string[];
    generalAdvice: string;
  };
  confidence: number;
  disclaimer: string;
  insights?: string[];
}

// Re-export skinfold types
export * from "./skinFold";

export interface NutritionGoals {
  dailyCalories: number;
  protein: number; // gramos
  carbs: number; // gramos
  fat: number; // gramos
  fiber?: number; // gramos
  sugar?: number; // gramos
  sodium?: number; // miligramos
}

export interface PersonalBodyData {
  height: number; // cm
  currentWeight: number; // kg
  targetWeight?: number; // kg
  age: number;
  gender: "male" | "female" | "other";
  activityLevel: ActivityLevel;
  fitnessGoals: string[];
}

export interface BodyAnalysisWithGoals extends BodyAnalysis {
  personalData?: PersonalBodyData;
  calculatedGoals?: NutritionGoals;
}

export interface SetGoalsRequest {
  // Datos personales del form
  height: number;
  currentWeight: number;
  targetWeight: number;
  age: number;
  gender: "male" | "female" | "other";
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  fitnessGoal: string;

  // Objetivos ajustados por el usuario (los que vienen de adjustableGoals)
  finalGoals: {
    dailyCalories: number;
    protein: number;
    carbs: number;
    fat: number;
  };

  // Opcional: ID del body analysis usado como base
  bodyAnalysisId?: string;
}

export interface CurrentGoals {
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Tipos XP
export * from "./xp";
