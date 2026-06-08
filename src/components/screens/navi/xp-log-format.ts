import {
  Target,
  Utensils,
  Pencil,
  Trophy,
  Zap,
  Star,
  Dumbbell,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Tone } from "@/components/ui/tone";
import type { XpLog } from "@/types/xp";

export interface FormattedXpLog {
  id: string;
  label: string;
  when: string;
  xp: number;
  icon: LucideIcon;
  tone: Tone;
}

const ACTION_META: Record<string, { label: string; icon: LucideIcon; tone: Tone }> = {
  habit_complete: { label: "Hábito completado", icon: Target, tone: "primary" },
  nutrition_log: { label: "Comida registrada", icon: Utensils, tone: "success" },
  daily_comment: { label: "Reflexión diaria", icon: Pencil, tone: "info" },
  day_complete: { label: "Día ganado", icon: Trophy, tone: "warning" },
  streak_bonus: { label: "Bonus de racha", icon: Zap, tone: "warning" },
  level_up: { label: "¡Subiste de nivel!", icon: Star, tone: "primary" },
  habit_created: { label: "Hábito creado", icon: Sparkles, tone: "primary" },
  habit_created_by_ai: { label: "Hábito creado con IA", icon: Sparkles, tone: "info" },
  physical_activity: { label: "Actividad física", icon: Dumbbell, tone: "warning" },
};

const FALLBACK = { label: "Experiencia ganada", icon: Zap, tone: "primary" as Tone };

/** Formatea la fecha de un log a un texto corto relativo (Hoy / Ayer / dd MMM). */
function formatWhen(dateStr: string, createdAt: Date | string): string {
  const d = new Date(createdAt ?? dateStr);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const startOfDay = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const dayDiff = Math.round(
    (startOfDay(now) - startOfDay(d)) / (1000 * 60 * 60 * 24)
  );

  const time = d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });

  if (dayDiff === 0) return time;
  if (dayDiff === 1) return "Ayer";
  return d.toLocaleDateString("es", { day: "2-digit", month: "short" });
}

/** Mapea un XpLog del backend a la forma que consume la fila de actividad reciente. */
export function formatXpLog(log: XpLog): FormattedXpLog {
  const meta = ACTION_META[log.action] ?? FALLBACK;
  return {
    id: log.id,
    label: log.description?.trim() || meta.label,
    when: formatWhen(log.date, log.createdAt),
    xp: log.xpEarned,
    icon: meta.icon,
    tone: meta.tone,
  };
}
