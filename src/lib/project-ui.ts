/**
 * Colores de proyecto. Se guardan como nombre ("blue") y se mapean a clases
 * completas aca: Tailwind solo genera las clases que ve escritas enteras.
 */
export const PROJECT_COLORS = {
  blue: { dot: "bg-blue-500", soft: "bg-blue-500/10 text-blue-700 dark:text-blue-300", bar: "bg-blue-500" },
  green: { dot: "bg-emerald-500", soft: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", bar: "bg-emerald-500" },
  amber: { dot: "bg-amber-500", soft: "bg-amber-500/15 text-amber-700 dark:text-amber-300", bar: "bg-amber-500" },
  red: { dot: "bg-red-500", soft: "bg-red-500/10 text-red-700 dark:text-red-300", bar: "bg-red-500" },
  purple: { dot: "bg-violet-500", soft: "bg-violet-500/10 text-violet-700 dark:text-violet-300", bar: "bg-violet-500" },
  pink: { dot: "bg-pink-500", soft: "bg-pink-500/10 text-pink-700 dark:text-pink-300", bar: "bg-pink-500" },
  teal: { dot: "bg-teal-500", soft: "bg-teal-500/10 text-teal-700 dark:text-teal-300", bar: "bg-teal-500" },
  gray: { dot: "bg-zinc-400", soft: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300", bar: "bg-zinc-400" },
} as const;

export type ProjectColor = keyof typeof PROJECT_COLORS;

export const PROJECT_COLOR_KEYS = Object.keys(PROJECT_COLORS) as ProjectColor[];

export function projectColor(c?: string | null) {
  return PROJECT_COLORS[(c as ProjectColor) ?? "blue"] ?? PROJECT_COLORS.blue;
}

export const PROJECT_STATUS_LABEL = {
  active: "Activo",
  paused: "En pausa",
  archived: "Archivado",
} as const;

/** "2026-10-12" -> "12/10" */
export function shortDate(d?: string | null): string {
  if (!d) return "";
  const [, m, day] = d.split("-");
  return `${day}/${m}`;
}

export const EMOJI_SUGGESTIONS = ["💼", "🏋️", "🎟️", "🐙", "🎹", "🇳🇿", "🖨️", "📚", "🏠", "💰", "🩺", "🚀"];
