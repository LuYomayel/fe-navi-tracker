"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useNaviTrackerStore } from "@/store";
import type { HydrationLog } from "@/types";

export default function HydrationHistory() {
  const { hydrationGoal } = useNaviTrackerStore();
  const [history, setHistory] = useState<HydrationLog[]>([]);

  useEffect(() => {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    const fromStr = from.toISOString().split("T")[0];
    const toStr = today.toISOString().split("T")[0];

    api.hydration.getRange(fromStr, toStr).then((res) => {
      if (res.data) setHistory(res.data as HydrationLog[]);
    });
  }, []);

  const goal = hydrationGoal.goalGlasses;
  const maxGlasses = Math.max(goal, ...history.map((h) => h.glassesConsumed), 1);

  // Generate last 7 days
  const days: { date: string; label: string; glasses: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const log = history.find((h) => h.date === dateStr);
    const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    days.push({
      date: dateStr,
      label: dayNames[d.getDay()],
      glasses: log?.glassesConsumed ?? 0,
    });
  }

  return (
    <div className="bg-card rounded-lg border p-4">
      <h3 className="text-sm font-semibold mb-4">Ultimos 7 dias</h3>
      <div className="flex items-end gap-2 h-32">
        {days.map((day) => {
          const height = maxGlasses > 0 ? (day.glasses / maxGlasses) * 100 : 0;
          const reachedGoal = day.glasses >= goal;
          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-[10px] font-medium text-muted-foreground">
                {day.glasses}
              </span>
              <div className="w-full relative" style={{ height: "80px" }}>
                {/* Goal line */}
                <div
                  className="absolute w-full border-t border-dashed border-blue-400/40"
                  style={{ bottom: `${(goal / maxGlasses) * 100}%` }}
                />
                <div
                  className={`absolute bottom-0 w-full rounded-t-sm transition-all ${
                    reachedGoal ? "bg-green-500" : "bg-blue-500/60"
                  }`}
                  style={{ height: `${height}%`, minHeight: day.glasses > 0 ? "4px" : "0" }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
