"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plane, ChevronRight } from "lucide-react";
import { CircularProgressRing } from "@/components/ui/circular-progress-ring";
import { Card } from "@/components/ui/card";
import { useGoals } from "@/hooks/useGoals";

/** Widget chico del fondo de ahorro para el dashboard (/hoy). Linkea a /objetivo. */
export default function GoalWidget() {
  const { progress, loadProgress } = useGoals();

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  if (!progress?.goal) return null;

  const { goal, percentage, remainingUsd } = progress;
  const pct = Math.round(percentage);

  return (
    <Link href="/objetivo" className="block">
      <Card className="p-4 transition-transform active:scale-[0.99]">
        <div className="flex items-center gap-4">
          <CircularProgressRing
            value={Math.max(0, goal.currentUsd)}
            goal={goal.targetUsd}
            size={72}
            tone="success"
            label={`${pct}%`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Plane className="h-4 w-4 shrink-0 text-success" />
              <span className="truncate text-[15px] font-semibold">
                {goal.name}
              </span>
            </div>
            <p className="mt-0.5 font-mono text-xs tabular-nums text-muted-foreground">
              USD {Math.round(goal.currentUsd).toLocaleString("es-AR")} /{" "}
              {Math.round(goal.targetUsd).toLocaleString("es-AR")} · faltan USD{" "}
              {Math.round(remainingUsd).toLocaleString("es-AR")}
            </p>
          </div>
          <ChevronRight className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
        </div>
      </Card>
    </Link>
  );
}
