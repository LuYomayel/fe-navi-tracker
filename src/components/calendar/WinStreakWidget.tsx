"use client";

import { useEffect } from "react";
import { useNaviTrackerStore } from "@/store";
import { Flame, Calendar } from "lucide-react";
import Link from "next/link";

export default function WinStreakWidget() {
  const { winStreak, fetchWinStreak } = useNaviTrackerStore();

  useEffect(() => {
    fetchWinStreak();
  }, [fetchWinStreak]);

  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Racha Ganadora</h3>
        </div>
        <Link
          href="/calendar"
          className="text-xs text-primary hover:underline"
        >
          Ver calendario
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="flex items-center gap-1">
            {(winStreak?.currentStreak ?? 0) >= 3 && (
              <Flame className="h-5 w-5 text-orange-500" />
            )}
            <span className="text-3xl font-bold">
              {winStreak?.currentStreak ?? 0}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">Racha actual</p>
        </div>

        <div className="h-8 w-px bg-border" />

        <div className="text-center">
          <span className="text-lg font-bold text-muted-foreground">
            {winStreak?.bestStreak ?? 0}
          </span>
          <p className="text-[10px] text-muted-foreground">Mejor racha</p>
        </div>
      </div>
    </div>
  );
}
