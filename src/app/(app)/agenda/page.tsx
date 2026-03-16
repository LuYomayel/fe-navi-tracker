"use client";

import { useInitializeStore } from "@/hooks/useInitializeStore";
import DailyAgenda from "@/components/agenda/DailyAgenda";
import { CalendarClock } from "lucide-react";

export default function AgendaPage() {
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
        <CalendarClock className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold">Agenda</h1>
          <p className="text-sm text-muted-foreground">
            Vista diaria de todo lo que tenes que hacer
          </p>
        </div>
      </div>

      <DailyAgenda />
    </div>
  );
}
