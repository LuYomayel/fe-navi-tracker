/**
 * Tonos semánticos del design system. Tailwind necesita strings de clase
 * literales (no interpola), por eso mapeamos tone -> clases acá.
 *
 * Mapeo producto -> token: día ganado/hábito=success · parcial/racha=warning ·
 * agua=info · perdido/borrar=destructive · XP/nivel/calorías=primary.
 */
export type Tone =
  | "primary"
  | "success"
  | "warning"
  | "info"
  | "destructive"
  | "muted";

/** Fondo tintado (icon-wells, chips). ~12-16% del color. */
export const toneBgSoft: Record<Tone, string> = {
  primary: "bg-primary/12",
  success: "bg-success/12",
  warning: "bg-warning/16",
  info: "bg-info/12",
  destructive: "bg-destructive/12",
  muted: "bg-muted",
};

/** Color de texto/icono pleno del tono. */
export const toneText: Record<Tone, string> = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning-foreground dark:text-warning",
  info: "text-info",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
};
