"use client";

import { useEffect } from "react";
import { useNaviTrackerStore } from "@/store";
import Link from "next/link";
import { Droplets, Plus } from "lucide-react";

export default function HydrationWidget() {
  const {
    todayHydration,
    hydrationGoal,
    fetchTodayHydration,
    adjustHydration,
    fetchHydrationGoal,
  } = useNaviTrackerStore();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchTodayHydration(today);
    fetchHydrationGoal();
  }, [today, fetchTodayHydration, fetchHydrationGoal]);

  const glasses = todayHydration?.glassesConsumed ?? 0;
  const goal = hydrationGoal.goalGlasses;
  const percentage = Math.min(100, Math.round((glasses / goal) * 100));
  const isGoalReached = glasses >= goal;
  const color = isGoalReached ? "#22c55e" : "#3b82f6";

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <Link
          href="/hydration"
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          <Droplets className="h-4 w-4" style={{ color }} />
          <span className="text-sm font-semibold">Agua</span>
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            adjustHydration(today, 1);
          }}
          className="h-7 w-7 rounded-full bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-blue-500" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 70 70">
            <circle
              cx="35"
              cy="35"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              className="text-muted/30"
            />
            <circle
              cx="35"
              cy="35"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold">{percentage}%</span>
          </div>
        </div>
        <div>
          <p className="text-lg font-bold">
            {glasses}/{goal}
          </p>
          <p className="text-xs text-muted-foreground">
            vasos ({glasses * hydrationGoal.mlPerGlass} ml)
          </p>
          {isGoalReached && (
            <p className="text-xs font-medium text-green-500">Meta alcanzada</p>
          )}
        </div>
      </div>
    </div>
  );
}
