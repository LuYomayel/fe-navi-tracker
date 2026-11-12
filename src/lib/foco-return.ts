// Volver a /foco después de haber ido a otra pantalla desde el checklist.
// /foco marca la sesión (sessionStorage) y el layout muestra el botón.

export const FOCO_FLAG = "navi:from-foco";

export function showBackToFoco(pathname: string, cameFromFoco: boolean): boolean {
  return cameFromFoco && !pathname.startsWith("/foco");
}
