import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Tone, toneBgSoft, toneText } from "./tone";

export interface IconWellProps {
  icon: LucideIcon;
  tone?: Tone;
  /** lado del cuadrado contenedor (px) */
  size?: number;
  /** tamaño del ícono (px) */
  iconSize?: number;
  className?: string;
}

/** Círculo tintado con un ícono lucide adentro. Base visual de filas/cards. */
export function IconWell({
  icon: Icon,
  tone = "primary",
  size = 34,
  iconSize = 17,
  className,
}: IconWellProps) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        toneBgSoft[tone],
        toneText[tone],
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Icon size={iconSize} strokeWidth={2} />
    </span>
  );
}
