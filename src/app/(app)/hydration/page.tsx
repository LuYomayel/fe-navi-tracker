"use client";

import { useEffect, useState } from "react";
import { useNaviTrackerStore } from "@/store";
import HydrationCircularProgress from "@/components/hydration/HydrationCircularProgress";
import HydrationControls from "@/components/hydration/HydrationControls";
import HydrationGoalDialog from "@/components/hydration/HydrationGoalDialog";
import HydrationHistory from "@/components/hydration/HydrationHistory";
import { Settings } from "lucide-react";

export default function HydrationPage() {
  const {
    todayHydration,
    hydrationGoal,
    fetchTodayHydration,
    adjustHydration,
    fetchHydrationGoal,
  } = useNaviTrackerStore();

  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchTodayHydration(today);
    fetchHydrationGoal();
  }, [today, fetchTodayHydration, fetchHydrationGoal]);

  const glasses = todayHydration?.glassesConsumed ?? 0;
  const goal = hydrationGoal.goalGlasses;
  const percentage = Math.min(100, Math.round((glasses / goal) * 100));
  const isGoalReached = glasses >= goal;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Hidratacion
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Meta: {goal} vasos ({goal * hydrationGoal.mlPerGlass} ml)
          </p>
        </div>
        <button
          onClick={() => setShowGoalDialog(true)}
          className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Main Progress */}
      <div className="flex flex-col items-center gap-6 py-4">
        <HydrationCircularProgress
          glasses={glasses}
          goal={goal}
          percentage={percentage}
          mlPerGlass={hydrationGoal.mlPerGlass}
          isGoalReached={isGoalReached}
        />

        <HydrationControls
          glasses={glasses}
          date={today}
          onAdjust={adjustHydration}
        />
      </div>

      {/* History */}
      <HydrationHistory />

      {/* Goal Dialog */}
      <HydrationGoalDialog
        open={showGoalDialog}
        onOpenChange={setShowGoalDialog}
      />
    </div>
  );
}
