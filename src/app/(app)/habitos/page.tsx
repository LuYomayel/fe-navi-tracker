"use client";

import { useMemo, useState } from "react";
import { Target, BookOpen, Pencil, Plus, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { NaviMascot } from "@/components/ui/navi-mascot";

import { useNaviTrackerStore } from "@/store";
import { useInitializeStore } from "@/hooks/useInitializeStore";
import { useXp } from "@/hooks/useXp";
import { getDateKey } from "@/lib/utils";

import { HabitsWeekGrid } from "@/components/screens/habitos/HabitsWeekGrid";
import { DailyReflection } from "@/components/calendar/DailyReflection";
import { AddActivityModal } from "@/components/calendar/AddActivityModal";
import { AIAssistant } from "@/components/ai/AIAssistant";

const MOOD_EMOJIS = ["😣", "😟", "😐", "😊", "😄"];
const MOOD_LABELS = ["Muy mal", "Mal", "Regular", "Bien", "Excelente"];

export default function HabitosPage() {
  const { isLoading } = useInitializeStore();
  const { streaks } = useXp();

  const {
    activities,
    dailyNotes,
    getCompletion,
    showDailyReflection,
    selectedModalDate,
    setShowDailyReflection,
    setShowAddActivityModal,
    showAIAssistant,
    setShowAIAssistant,
  } = useNaviTrackerStore();

  const [reflectionOpen, setReflectionOpen] = useState(false);

  const today = useMemo(() => new Date(), []);
  const todayKey = getDateKey(today);
  const todayDayIndex = (today.getDay() + 6) % 7; // L=0..D=6

  // Hábitos programados para hoy (no archivados) y cuántos van completados.
  const todaysHabits = activities.filter(
    (a) => !a.archived && a.days[todayDayIndex]
  );
  const doneToday = todaysHabits.filter((a) => getCompletion(a.id, today)).length;
  const totalToday = todaysHabits.length;

  // Reflexión de hoy.
  const todayReflection = dailyNotes.find((n) => n.date === todayKey);
  const habitsStreak = streaks?.habits?.streak ?? 0;

  const moodFor = (mood?: number) => {
    if (!mood || mood < 1 || mood > 5)
      return { emoji: "😐", label: "Sin ánimo" };
    return { emoji: MOOD_EMOJIS[mood - 1], label: MOOD_LABELS[mood - 1] };
  };

  // Mensaje y estado de Navi según el progreso del día.
  const allDone = totalToday > 0 && doneToday === totalToday;
  const naviState: "celebrating" | "happy" | "default" = allDone
    ? "celebrating"
    : doneToday > 0
      ? "happy"
      : "default";
  const naviMessage = allDone
    ? "¡Completaste todos tus hábitos de hoy! Ganaste el día."
    : doneToday > 0
      ? `Completá ${totalToday - doneToday} hábito${
          totalToday - doneToday === 1 ? "" : "s"
        } más para ganar el día.`
      : totalToday > 0
        ? "Arrancá tu día completando el primer hábito."
        : "No tenés hábitos programados para hoy.";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Target}
        title="Hábitos"
        subtitle="Tu semana de un vistazo"
        metric={
          <span className="font-mono tabular-nums">
            {doneToday}/{totalToday}
          </span>
        }
        metricLabel="hoy"
        action={
          <Button
            size="icon"
            variant="tonal"
            aria-label="Agregar hábito"
            onClick={() => setShowAddActivityModal(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        }
      />

      {/* Grid semanal de hábitos */}
      <HabitsWeekGrid
        activities={activities}
        onAdd={() => setShowAddActivityModal(true)}
      />

      {/* Reflexión diaria */}
      <Card className="p-4">
        <div className="mb-2.5 flex items-center gap-2">
          <BookOpen className="h-[18px] w-[18px] text-chart-4" />
          <span className="text-[15px] font-semibold text-foreground">
            Reflexión de hoy
          </span>
          {todayReflection && (
            <Badge variant="secondary" className="ml-auto">
              Ánimo: {moodFor(todayReflection.mood).label}
            </Badge>
          )}
        </div>

        {todayReflection?.customComment ? (
          <p className="mb-3 text-[13.5px] italic leading-5 text-muted-foreground">
            “{todayReflection.customComment}”
          </p>
        ) : (
          <p className="mb-3 text-[13.5px] leading-5 text-muted-foreground">
            Todavía no escribiste tu reflexión de hoy. Tomate un momento para
            registrar cómo te fue.
          </p>
        )}

        <Button
          variant="tonal"
          size="sm"
          onClick={() => {
            setReflectionOpen(true);
            setShowDailyReflection(true, today);
          }}
        >
          <Pencil className="mr-1.5 h-4 w-4" />
          {todayReflection ? "Editar reflexión" : "Escribir reflexión"}
        </Button>
      </Card>

      {/* Banner de Navi */}
      <div className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/8 px-3.5 py-3">
        <NaviMascot state={naviState} size={44} />
        <p className="text-[13.5px] leading-[19px] text-foreground">
          <span className="font-semibold">
            {allDone ? "¡Excelente! " : "¡Vas bien! "}
          </span>
          {naviMessage}
          {habitsStreak > 0 && (
            <>
              {" "}
              Racha de{" "}
              <span className="font-mono font-semibold tabular-nums">
                {habitsStreak}
              </span>{" "}
              {habitsStreak === 1 ? "día" : "días"} 🔥
            </>
          )}
        </p>
      </div>

      {/* Asistente IA de hábitos (migrado de /habits) */}
      <Button
        variant="tonal"
        size="sm"
        className="w-full"
        onClick={() => setShowAIAssistant(true)}
      >
        <Sparkles className="mr-1.5 h-4 w-4" />
        Asistente IA de hábitos
      </Button>

      {/* Modales (montados localmente para que los botones funcionen) */}
      <DailyReflection
        isOpen={showDailyReflection || reflectionOpen}
        onClose={() => {
          setReflectionOpen(false);
          setShowDailyReflection(false);
        }}
        selectedDate={selectedModalDate || today}
      />

      <AddActivityModal />

      <AIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />
    </div>
  );
}
