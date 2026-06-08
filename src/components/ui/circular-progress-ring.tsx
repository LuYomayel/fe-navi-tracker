import * as React from "react";
import { cn } from "@/lib/utils";
import { type Tone, toneText } from "./tone";

export interface CircularProgressRingProps {
  value: number;
  goal?: number;
  size?: number;
  stroke?: number;
  tone?: Tone;
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Donut SVG tokenizado. Fuente única de los anillos de progreso
 * (mata el duplicado de hidratación/día). Track = muted, progreso = tono.
 */
export function CircularProgressRing({
  value,
  goal = 100,
  size = 96,
  stroke = 8,
  tone = "primary",
  label,
  sublabel,
  children,
  className,
}: CircularProgressRingProps) {
  const pct = goal > 0 ? Math.min(100, Math.max(0, (value / goal) * 100)) : 0;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="text-muted"
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          stroke="currentColor"
          className={cn(
            "transition-[stroke-dashoffset] duration-slow ease-standard",
            toneText[tone],
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children ?? (
          <>
            {label != null && (
              <span
                className="font-mono font-bold leading-none tabular-nums"
                style={{ fontSize: size * 0.22 }}
              >
                {label}
              </span>
            )}
            {sublabel != null && (
              <span
                className="mt-0.5 text-muted-foreground"
                style={{ fontSize: Math.max(10, size * 0.1) }}
              >
                {sublabel}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
