import * as React from "react";
import { cn } from "@/lib/utils";

export type NaviState =
  | "default"
  | "happy"
  | "celebrating"
  | "sad"
  | "sleepy"
  | "sick";

// PNGs reales en public/. Mapeo estado -> momento:
//  celebrating = nivel / día ganado · happy = buen progreso ·
//  sad = día perdido / racha rota · sleepy = inactividad ·
//  sick = muy lejos del objetivo · default = neutral.
const NAVI_FILE: Record<NaviState, string> = {
  default: "/Navi.png",
  happy: "/Navi_happy.png",
  celebrating: "/Navi_celebrating.png",
  sad: "/Navi_sad.png",
  sleepy: "/Navi_sleepy.png",
  sick: "/Navi_sick.png",
};

export interface NaviMascotProps {
  state?: NaviState;
  size?: number;
  /** animación de flotación suave (hero del companion) */
  float?: boolean;
  className?: string;
  alt?: string;
}

/** Wrapper de la mascota Navi por estado emocional. */
export function NaviMascot({
  state = "default",
  size = 96,
  float,
  className,
  alt = "Navi",
}: NaviMascotProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={NAVI_FILE[state] ?? NAVI_FILE.default}
      alt={alt}
      width={size}
      height={size}
      className={cn("block object-contain", float && "animate-navi-float", className)}
      style={{ width: size, height: size }}
    />
  );
}
