import type { CSSProperties } from "react";

/**
 * Paleta fija de colores de filamento (espejo de backend
 * `printing/colors.ts`): un nombre canonico por color, igual en rollos,
 * desgloses e impresiones. El back rechaza lo que no esta aca.
 */
export const FILAMENT_COLORS = [
  "negro",
  "blanco",
  "gris",
  "rojo",
  "naranja",
  "amarillo",
  "amarillo girasol",
  "verde",
  "cian",
  "azul",
  "beige",
  "marrón",
  "rosa",
  "verde militar",
] as const;

/** "FF6910FF" / "#ff6910" -> "#ff6910" (para pintar el color que reporto Bambu). */
export function cssHex(hex?: string | null): string | null {
  const clean = hex?.trim().replace(/^#/, "").toLowerCase() ?? "";
  if (/^[0-9a-f]{8}$/.test(clean)) return `#${clean.slice(0, 6)}`;
  if (/^[0-9a-f]{6}$/.test(clean)) return `#${clean}`;
  return null;
}

// Tono aproximado de cada color de la paleta, para cuando ningun rollo trae
// el hex real (el real sale del stock de filamento y tiene prioridad).
export const PALETTE_HEX: Record<string, string> = {
  negro: "#000000",
  blanco: "#ffffff",
  gris: "#999d9d",
  rojo: "#e02020",
  naranja: "#ff671f",
  amarillo: "#efe255",
  "amarillo girasol": "#ffb549",
  verde: "#00bb31",
  cian: "#4dafda",
  azul: "#2850e0",
  beige: "#ecc3b2",
  marrón: "#a86338",
  rosa: "#ff00ff",
  "verde militar": "#5b6b3a",
};

export const isPaletteColor = (c: string) =>
  (FILAMENT_COLORS as readonly string[]).includes(c);

/** Fondo del circulo: un color, o mitades si es combinacion ("rojo+blanco"). */
export function swatchStyle(
  color: string,
  hexOf: (c: string) => string | undefined,
): CSSProperties | undefined {
  const parts = color.split("+").map((c) => hexOf(c.trim()));
  if (parts.some((h) => !h)) return undefined;
  if (parts.length === 1) return { backgroundColor: parts[0] };
  const step = 100 / parts.length;
  const stops = parts
    .map((h, i) => `${h} ${i * step}% ${(i + 1) * step}%`)
    .join(", ");
  return { background: `linear-gradient(90deg, ${stops})` };
}
