"use client";

import { useInitializeStore } from "@/hooks/useInitializeStore";
import MonthlyCalendar from "@/components/calendar/MonthlyCalendar";
import WinStreakWidget from "@/components/calendar/WinStreakWidget";
import GoogleCalendarSync from "@/components/calendar/GoogleCalendarSync";
import { Calendar } from "lucide-react";

export default function CalendarPage() {
  const { isLoading, isInitialized } = useInitializeStore();

  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold">Calendario</h1>
          <p className="text-sm text-muted-foreground">
            Dia ganado / perdido - tu progreso mensual
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <WinStreakWidget />
        <MonthlyCalendar />
        <GoogleCalendarSync />
      </div>
    </div>
  );
}
