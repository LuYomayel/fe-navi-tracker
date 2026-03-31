"use client";

import { useEffect, useState } from "react";
import { useNaviTrackerStore } from "@/store";
import HydrationCircularProgress from "@/components/hydration/HydrationCircularProgress";
import HydrationControls from "@/components/hydration/HydrationControls";
import HydrationGoalDialog from "@/components/hydration/HydrationGoalDialog";
import HydrationHistory from "@/components/hydration/HydrationHistory";
import { Settings, ChevronLeft, ChevronRight } from "lucide-react";
import { getDateKey } from "@/lib/utils";

export default function HydrationPage() {
  const {
    todayHydration,
    hydrationGoal,
    fetchTodayHydration,
    adjustHydration,
    fetchHydrationGoal,
  } = useNaviTrackerStore();

  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getDateKey(new Date()));

  const todayStr = getDateKey(new Date());
  const isToday = selectedDate === todayStr;

  useEffect(() => {
    fetchTodayHydration(selectedDate);
    fetchHydrationGoal();
  }, [selectedDate, fetchTodayHydration, fetchHydrationGoal]);

  const glasses = todayHydration?.glassesConsumed ?? 0;
  const goal = hydrationGoal.goalGlasses;
  const percentage = Math.min(100, Math.round((glasses / goal) * 100));
  const isGoalReached = glasses >= goal;

  const navigateDay = (delta: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + delta);
    const next = getDateKey(d);
    // No navegar a fechas futuras
    if (next <= todayStr) {
      setSelectedDate(next);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    if (dateStr === todayStr) return "Hoy";
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  };

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

      {/* Selector de fecha */}
      <div className="flex items-center justify-between bg-muted/40 rounded-xl px-3 py-2">
        <button
          onClick={() => navigateDay(-1)}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-sm font-semibold capitalize">
            {formatDisplayDate(selectedDate)}
          </span>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="text-[10px] text-primary underline"
            >
              Ir a hoy
            </button>
          )}
        </div>
        <button
          onClick={() => navigateDay(1)}
          disabled={isToday}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight className="h-4 w-4" />
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
          date={selectedDate}
          onAdjust={adjustHydration}
        />
      </div>

      {/* History — barras clickeables para cambiar de día */}
      <HydrationHistory
        selectedDate={selectedDate}
        onSelectDate={(date) => setSelectedDate(date)}
      />

      {/* Goal Dialog */}
      <HydrationGoalDialog
        open={showGoalDialog}
        onOpenChange={setShowGoalDialog}
      />
    </div>
  );
}
