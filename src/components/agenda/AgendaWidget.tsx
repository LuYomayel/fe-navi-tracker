"use client";

import { useEffect } from "react";
import { useNaviTrackerStore } from "@/store";
import { CalendarClock } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { getDateKey } from "@/lib/utils";

export default function AgendaWidget() {
  const {
    currentDayScore,
    fetchDayScore,
    fetchCalendarEvents,
    tasks,
    calendarEvents,
  } = useNaviTrackerStore();

  const today = getDateKey(new Date());

  useEffect(() => {
    fetchDayScore(today);
    fetchCalendarEvents(today, today);
  }, [today, fetchDayScore, fetchCalendarEvents]);

  const todayTasks = tasks.filter(
    (t) => t.dueDate === today && !t.completed
  );
  const todayEvents = calendarEvents.filter(
    (e) => e.startTime.split("T")[0] === today
  );

  const upcomingItems = [
    ...todayEvents.map((e) => ({
      type: "event" as const,
      title: e.title,
      time: e.allDay
        ? "Todo el dia"
        : new Date(e.startTime).toLocaleTimeString("es", {
            hour: "2-digit",
            minute: "2-digit",
          }),
    })),
    ...todayTasks.slice(0, 3).map((t) => ({
      type: "task" as const,
      title: t.title,
      time: t.dueTime || "",
    })),
  ].slice(0, 3);

  const score = currentDayScore;

  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Agenda</h3>
        </div>
        <Link
          href="/agenda"
          className="text-xs text-primary hover:underline"
        >
          Ver dia
        </Link>
      </div>

      {score && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progreso del dia</span>
            <span className="font-medium">{score.percentage}%</span>
          </div>
          <Progress value={score.percentage} className="h-2" />
        </div>
      )}

      {upcomingItems.length > 0 ? (
        <div className="space-y-2">
          {upcomingItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  item.type === "event" ? "bg-blue-500" : "bg-orange-500"
                }`}
              />
              <span className="truncate flex-1">{item.title}</span>
              {item.time && (
                <span className="text-muted-foreground">{item.time}</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No hay items pendientes
        </p>
      )}
    </div>
  );
}
