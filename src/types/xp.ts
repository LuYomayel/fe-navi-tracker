export enum XpAction {
  HABIT_COMPLETE = "habit_complete",
  NUTRITION_LOG = "nutrition_log",
  DAILY_COMMENT = "daily_comment",
  DAY_COMPLETE = "day_complete",
  STREAK_BONUS = "streak_bonus",
  LEVEL_UP = "level_up",
  HABIT_CREATED = "habit_created",
  HABIT_CREATED_BY_AI = "habit_created_by_ai",
  PHYSICAL_ACTIVITY = "physical_activity",
}

export interface XpStats {
  level: number;
  xp: number;
  totalXp: number;
  xpForNextLevel: number;
  xpProgressPercentage: number;
  streak: number;
  lastStreakDate?: string;
  recentLogs: XpLog[];
}

export interface XpLog {
  id: string;
  action: string;
  xpEarned: number;
  description: string;
  date: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface LevelUpResponse {
  newLevel: number;
  xpEarned: number;
  totalXpEarned: number;
  leveledUp: boolean;
  nextLevelXp: number;
  streak: number;
  streakBonus: number;
}

export interface AddXpRequest {
  action: XpAction;
  xpAmount: number;
  description: string;
  metadata?: Record<string, any>;
}

// Configuraciones de XP por acción
export const XP_VALUES = {
  HABIT_COMPLETE: 10,
  NUTRITION_LOG: 5,
  DAILY_COMMENT: 15,
} as const;

// Mensajes de acciones
export const XP_ACTION_MESSAGES = {
  [XpAction.HABIT_COMPLETE]: "Hábito completado",
  [XpAction.NUTRITION_LOG]: "Comida registrada",
  [XpAction.DAILY_COMMENT]: "Reflexión diaria",
  [XpAction.STREAK_BONUS]: "Bonus de racha",
  [XpAction.LEVEL_UP]: "¡Subiste de nivel!",
} as const;
