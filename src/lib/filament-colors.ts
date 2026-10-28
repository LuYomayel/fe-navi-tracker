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
