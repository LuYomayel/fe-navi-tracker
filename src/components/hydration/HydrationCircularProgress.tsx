"use client";

import { Droplets } from "lucide-react";

interface Props {
  glasses: number;
  goal: number;
  percentage: number;
  mlPerGlass: number;
  isGoalReached: boolean;
}

export default function HydrationCircularProgress({
  glasses,
  goal,
  percentage,
  mlPerGlass,
  isGoalReached,
}: Props) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = isGoalReached ? "#22c55e" : "#3b82f6";

  return (
    <div className="relative h-48 w-48">
      <svg className="h-48 w-48 -rotate-90" viewBox="0 0 180 180">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-muted/30"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Droplets
          className="h-6 w-6 mb-1"
          style={{ color }}
        />
        <span className="text-3xl font-bold">{glasses}</span>
        <span className="text-sm text-muted-foreground">/ {goal} vasos</span>
        <span className="text-xs text-muted-foreground mt-0.5">
          {glasses * mlPerGlass} ml
        </span>
        {isGoalReached && (
          <span className="text-xs font-medium text-green-500 mt-1">
            Meta alcanzada
          </span>
        )}
      </div>
    </div>
  );
}
