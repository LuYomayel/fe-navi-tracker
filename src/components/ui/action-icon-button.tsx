"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  default: "hover:bg-muted hover:text-foreground",
  destructive: "hover:bg-destructive/10 hover:text-destructive",
} as const;

const SIZES = {
  // 36px: target tactil minimo acordado para las acciones de lista.
  default: { box: "h-9 w-9", icon: "h-[15px] w-[15px]" },
  sm: { box: "h-8 w-8", icon: "h-[14px] w-[14px]" },
} as const;

export interface ActionIconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icono de lucide-react a renderizar (se le aplica el tamaño del size). */
  icon: LucideIcon;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  /** Obligatorio: el boton no tiene texto visible. */
  "aria-label": string;
}

/**
 * Boton de accion solo-icono para filas de listas (editar / borrar / etc).
 * Unifica el patron que estaba repetido ~16 veces en plan, salud, gastos,
 * comidas guardadas y meal prep.
 */
export const ActionIconButton = React.forwardRef<
  HTMLButtonElement,
  ActionIconButtonProps
>(function ActionIconButton(
  { icon: Icon, variant = "default", size = "default", className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex items-center justify-center rounded-md text-muted-foreground transition-colors",
        SIZES[size].box,
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      <Icon className={SIZES[size].icon} />
    </button>
  );
});
