"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  UtensilsCrossed,
  Dumbbell,
  DollarSign,
  Droplet,
  NotebookPen,
  Moon,
  CheckSquare,
  type LucideIcon,
} from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  /** clase de color del icono */
  tone: string;
}

/**
 * Acciones del "+". El orden importa: sale en abanico desde el botón, así que
 * lo más frecuente queda más cerca del pulgar (abajo).
 */
const ACTIONS: QuickAction[] = [
  {
    id: "comida",
    label: "Comida",
    icon: UtensilsCrossed,
    href: "/salud?tab=comidas&log=1",
    tone: "text-success",
  },
  {
    id: "agua",
    label: "Agua",
    icon: Droplet,
    href: "/salud?tab=agua",
    tone: "text-info",
  },
  {
    id: "entreno",
    label: "Entreno",
    icon: Dumbbell,
    href: "/salud?tab=ejercicio&log=1",
    tone: "text-warning-foreground dark:text-warning",
  },
  {
    id: "gasto",
    label: "Gasto",
    icon: DollarSign,
    href: "/plan?tab=gastos&nuevo=1",
    tone: "text-success",
  },
  {
    id: "tarea",
    label: "Tarea",
    icon: CheckSquare,
    href: "/plan?tab=tareas&nueva=1",
    tone: "text-primary",
  },
  {
    id: "sueno",
    label: "Sueño",
    icon: Moon,
    href: "/salud?tab=sueno",
    tone: "text-info",
  },
  {
    id: "nota",
    label: "Reflexión",
    icon: NotebookPen,
    href: "/habitos?reflexion=1",
    tone: "text-primary",
  },
];

/**
 * FAB que se abre en un menú de registro rápido. Antes el "+" iba siempre a
 * registrar comida y no había forma de saberlo ni de cargar otra cosa.
 */
export function QuickAddFab() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape (y al navegar el componente se desmonta igual)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div ref={containerRef} className="md:hidden">
      {/* Telón: tapa el contenido y cierra al tocar afuera */}
      <button
        aria-hidden={!open}
        tabIndex={-1}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Acciones: se despliegan hacia arriba desde el botón */}
      <div className="fixed bottom-[136px] right-4 z-50 flex flex-col-reverse items-end gap-2">
        {ACTIONS.map((a, i) => {
          const Icon = a.icon;
          return (
            <button
              key={a.id}
              onClick={() => go(a.href)}
              tabIndex={open ? 0 : -1}
              aria-hidden={!open}
              style={{
                transitionDelay: `${open ? i * 28 : (ACTIONS.length - i) * 12}ms`,
              }}
              className={`flex items-center gap-2.5 rounded-full border border-border/60 bg-card py-2 pl-3.5 pr-2 shadow-lg transition-all duration-200 active:scale-95 ${
                open
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-3 opacity-0"
              }`}
            >
              <span className="text-[13px] font-semibold">{a.label}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                <Icon className={`h-[18px] w-[18px] ${a.tone}`} strokeWidth={2.2} />
              </span>
            </button>
          );
        })}
      </div>

      {/* El botón + */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Cerrar registro rápido" : "Registro rápido"}
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-fab transition-transform duration-200 active:scale-95"
      >
        <Plus
          className={`h-6 w-6 transition-transform duration-200 ${
            open ? "rotate-45" : ""
          }`}
          strokeWidth={2.5}
        />
      </button>
    </div>
  );
}
