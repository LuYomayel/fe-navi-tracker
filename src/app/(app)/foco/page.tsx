"use client";

// /foco — checklist de lo básico del día. La abre el hook de Claude Code
// mientras Claude responde: Luciano ve qué le falta y elige a dónde ir.
// La lógica (qué está hecho / pendiente) vive en lib/day-checklist.ts.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuthStore } from "@/modules/auth/store";
import { useNaviTrackerStore } from "@/store";
import { useInitializeStore } from "@/hooks/useInitializeStore";
import { getDateKey } from "@/lib/utils";
import {
  buildDayChecklist,
  type ChecklistItem,
  type ChecklistItemId,
} from "@/lib/day-checklist";

import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Utensils,
  Droplets,
  Repeat,
  ListChecks,
  GraduationCap,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Circle,
  PartyPopper,
} from "lucide-react";

const ICONS: Record<ChecklistItemId, typeof Utensils> = {
  comida: Utensils,
  agua: Droplets,
  habitos: Repeat,
  tareas: ListChecks,
  curso: GraduationCap,
};

const COURSE_HABIT = /clase de ventas/i;

export default function FocoPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { isLoading } = useInitializeStore();

  const {
    activities,
    tasks,
    nutritionAnalyses,
    currentDayScore,
    fetchDayScore,
    todayHydration,
    hydrationGoal,
    fetchTodayHydration,
    fetchHydrationGoal,
    adjustHydration,
    getAllFoodAnalysis,
    toggleCompletion,
  } = useNaviTrackerStore();

  const today = getDateKey(new Date());
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (isAuthenticated && !user) router.push("/auth/login");
  }, [user, isAuthenticated, router]);

  const refresh = useCallback(() => {
    setNow(new Date());
    fetchDayScore(today);
    fetchTodayHydration(today);
    getAllFoodAnalysis();
  }, [today, fetchDayScore, fetchTodayHydration, getAllFoodAnalysis]);

  // Al abrir y cada vez que volvés a la pestaña (cargaste algo en otra) se
  // recalcula, así lo que ya hiciste aparece tildado.
  useEffect(() => {
    refresh();
    fetchHydrationGoal();
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh, fetchHydrationGoal]);

  if (!isAuthenticated || !user || isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-2/3" />
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  // Hábitos que tocan hoy (days = [L..D])
  const dayIndex = (now.getDay() + 6) % 7;
  const todaysHabits = activities
    .filter((a) => !a.archived && a.days?.[dayIndex])
    .map((a) => ({
      id: a.id,
      name: a.name,
      done: (a.completions || []).some((c) => c.date === today && c.completed),
    }));
  const courseHabit = activities.find(
    (a) => !a.archived && COURSE_HABIT.test(a.name)
  );
  const course = courseHabit
    ? {
        id: courseHabit.id,
        scheduledToday: !!courseHabit.days?.[dayIndex],
        done: (courseHabit.completions || []).some(
          (c) => c.date === today && c.completed
        ),
      }
    : null;
  const habits = todaysHabits.filter((h) => h.id !== course?.id);

  // Tareas de hoy: mismo criterio que /hoy (day-score, con fallback al store)
  const score = currentDayScore?.date === today ? currentDayScore : null;
  const todayTasks = tasks.filter(
    (t) => t.dueDate === today || (!t.dueDate && !t.completed)
  );
  const tasksTotal =
    score && score.tasksTotal > 0 ? score.tasksTotal : todayTasks.length;
  const tasksDone =
    score && score.tasksTotal > 0
      ? score.tasksCompleted
      : todayTasks.filter((t) => t.completed).length;

  const items = buildDayChecklist({
    now,
    mealsToday: nutritionAnalyses.filter((n) => n.date === today).length,
    glasses: todayHydration?.glassesConsumed ?? 0,
    waterGoal: hydrationGoal.goalGlasses,
    habits,
    tasksPending: Math.max(0, tasksTotal - tasksDone),
    tasksTotal,
    course,
  });
  const pending = items.filter((i) => !i.done).length;

  const go = (item: ChecklistItem) => {
    if (item.external) window.open(item.href, "_blank", "noopener");
    else router.push(item.href);
  };

  const toggleHabit = async (id: string) => {
    await toggleCompletion(id, new Date());
    fetchDayScore(today);
  };

  return (
    <div className="space-y-3">
      <PageHeader
        title="Mientras Claude labura"
        subtitle={
          pending === 0
            ? "Tenés todo lo básico al día"
            : `Te ${pending === 1 ? "falta 1 cosa" : `faltan ${pending} cosas`}. Elegí una.`
        }
      />

      {pending === 0 && (
        <Card className="flex items-center gap-3 border-primary/20 bg-primary/[0.06] p-4">
          <PartyPopper size={22} className="text-primary" />
          <div className="flex-1 text-sm">
            Todo al día. Si te sobra un rato, sumale al objetivo NZ.
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/objetivo">Objetivo</Link>
          </Button>
        </Card>
      )}

      {items.map((item) => {
        const Icon = ICONS[item.id];
        return (
          <Card
            key={item.id}
            className={`p-3 ${item.done ? "opacity-60" : "border-primary/30"}`}
          >
            <button
              type="button"
              onClick={() => go(item)}
              className="flex w-full items-center gap-3 text-left"
            >
              <Icon
                size={20}
                className={item.done ? "text-muted-foreground" : "text-primary"}
              />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.detail}</div>
              </div>
              {item.done ? (
                <CheckCircle2 size={20} className="text-green-500" />
              ) : item.external ? (
                <ExternalLink size={18} className="text-muted-foreground" />
              ) : (
                <ChevronRight size={18} className="text-muted-foreground" />
              )}
            </button>

            {/* Acciones rápidas sin salir de la pantalla */}
            {item.id === "agua" && !item.done && (
              <div className="mt-2 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => adjustHydration(today, 1)}>
                  +1 vaso
                </Button>
              </div>
            )}

            {item.id === "curso" && course && (
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  variant={item.done ? "ghost" : "outline"}
                  onClick={() => toggleHabit(course.id)}
                >
                  {item.done ? "Desmarcar" : "Ya hice la clase"}
                </Button>
              </div>
            )}

            {item.id === "habitos" && (
              <div className="mt-2 space-y-1 border-t pt-2">
                {habits.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => toggleHabit(h.id)}
                    className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-sm hover:bg-muted/50"
                  >
                    {h.done ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <Circle size={16} className="text-muted-foreground" />
                    )}
                    <span className={h.done ? "text-muted-foreground line-through" : ""}>
                      {h.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
