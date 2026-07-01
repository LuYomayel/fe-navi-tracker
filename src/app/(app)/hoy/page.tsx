"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuthStore } from "@/modules/auth/store";
import { useNaviTrackerStore } from "@/store";
import { useInitializeStore } from "@/hooks/useInitializeStore";
import { useXp } from "@/hooks/useXp";
import { api } from "@/lib/api-client";
import { getDateKey } from "@/lib/utils";

import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CircularProgressRing } from "@/components/ui/circular-progress-ring";
import { DayStatusPill, type DayStatus } from "@/components/ui/day-status-pill";
import { StatCard } from "@/components/ui/stat-card";
import { SummaryRow } from "@/components/ui/summary-row";
import { NaviMascot } from "@/components/ui/navi-mascot";
import GoalWidget from "@/components/goal/GoalWidget";

import {
  Sunrise,
  Flame,
  Dumbbell,
  Droplets,
  ListChecks,
  CalendarCheck,
  ChevronRight,
} from "lucide-react";

// Map del status del backend (won/partial/lost/no_data) al de DayStatusPill.
function toPillStatus(status?: string): DayStatus {
  switch (status) {
    case "won":
      return "won";
    case "partial":
      return "partial";
    case "lost":
      return "lost";
    default:
      return "none";
  }
}

function MiniKpi({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md bg-muted/50 py-1.5 text-center">
      <div className="font-mono text-base font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function SecLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-0.5 text-xs font-semibold uppercase tracking-[0.04em] text-muted-foreground">
      {children}
    </div>
  );
}

export default function HoyPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { isLoading } = useInitializeStore();
  const { xpStats } = useXp();

  const {
    nutritionAnalyses,
    physicalActivities = [],
    tasks,
    currentDayScore,
    fetchDayScore,
    todayHydration,
    hydrationGoal,
    fetchTodayHydration,
    fetchHydrationGoal,
  } = useNaviTrackerStore();

  const today = getDateKey(new Date());

  // Briefing narrativo (hero IA)
  const [narrative, setNarrative] = useState<string | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && !user) {
      router.push("/auth/login");
    }
  }, [user, isAuthenticated, router]);

  useEffect(() => {
    fetchDayScore(today);
    fetchTodayHydration(today);
    fetchHydrationGoal();
  }, [today, fetchDayScore, fetchTodayHydration, fetchHydrationGoal]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.briefing.getByDate(today);
        const text: string | null =
          res?.data?.content?.narrative ?? res?.data?.text ?? null;
        if (active) setNarrative(text);
      } catch {
        if (active) setNarrative(null);
      } finally {
        if (active) setBriefingLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [today]);

  if (!isAuthenticated || !user || isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-28 w-full" />
        <div className="grid grid-cols-2 gap-2.5">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  // Fecha legible para el subtítulo
  const dateLabel = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Day score
  const score = currentDayScore?.date === today ? currentDayScore : null;
  const dayPct = score?.percentage ?? 0;
  const pillStatus = toPillStatus(score?.status);
  const habitsDone = score?.habitsCompleted ?? 0;
  const habitsTotal = score?.habitsTotal ?? 0;
  const tasksDone = score?.tasksCompleted ?? 0;
  const tasksTotal = score?.tasksTotal ?? 0;

  // Hidratación
  const glasses = todayHydration?.glassesConsumed ?? 0;
  const waterGoal = hydrationGoal.goalGlasses;
  const mlPerGlass = hydrationGoal.mlPerGlass;
  const waterRemaining = Math.max(0, waterGoal - glasses);

  // Tareas de hoy (fallback al store si el day-score aún no cargó)
  const todayTasks = tasks.filter(
    (t) => t.dueDate === today || (!t.dueDate && !t.completed)
  );
  const storeTasksDone = todayTasks.filter((t) => t.completed).length;
  const tasksDoneShown = tasksTotal > 0 ? tasksDone : storeTasksDone;
  const tasksTotalShown = tasksTotal > 0 ? tasksTotal : todayTasks.length;
  const tasksPending = Math.max(0, tasksTotalShown - tasksDoneShown);

  // Calorías consumidas hoy
  const consumedKcal = nutritionAnalyses
    .filter((n) => n.date === today)
    .reduce((sum, n) => sum + (n.totalCalories || 0), 0);

  // Calorías quemadas hoy (actividad física)
  const burnedKcal = physicalActivities
    .filter((a) => a.date === today)
    .reduce((sum, a) => sum + (a.activeEnergyKcal || 0), 0);

  // Gamificación
  const level = xpStats?.level ?? user.level ?? 1;
  const totalXp = xpStats?.totalXp ?? user.totalXp ?? 0;
  const xpInLevel = xpStats?.xp ?? user.xp ?? 0;
  const xpForNext = xpStats?.xpForNextLevel ?? 100;
  const xpToNext = Math.max(0, xpForNext - xpInLevel);
  const xpPct =
    xpStats?.xpProgressPercentage != null
      ? Math.min(100, Math.max(0, xpStats.xpProgressPercentage))
      : xpForNext > 0
        ? Math.min(100, Math.round((xpInLevel / xpForNext) * 100))
        : 0;
  const streak = xpStats?.streak ?? user.streak ?? 0;

  return (
    <div className="space-y-4">
      {/* (1) Header */}
      <PageHeader title={`Hola, ${user.name}`} subtitle={dateLabel} />

      {/* (2) Briefing hero — el valor IA, promovido */}
      <Card className="border-primary/20 bg-primary/[0.06] p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sunrise size={18} className="text-primary" />
          <span className="text-xs font-bold uppercase tracking-[0.04em] text-primary">
            Briefing del día
          </span>
          <Badge variant="info" className="ml-auto">
            IA
          </Badge>
        </div>

        {briefingLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <p className="text-[14.5px] leading-[22px] text-foreground">
            {narrative ??
              `Buenos días, ${user.name}. Todavía no generamos tu briefing de hoy. Abrilo para verlo completo y arrancar el día con foco.`}
          </p>
        )}

        <Link
          href="/briefing"
          className="mt-2.5 inline-flex h-8 items-center gap-1 text-[13px] font-medium text-primary"
        >
          Ver briefing completo
          <ChevronRight size={15} />
        </Link>
      </Card>

      {/* (3) Day score ring + 3 KPIs */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <CircularProgressRing
            value={dayPct}
            goal={100}
            size={92}
            tone="success"
            label={`${dayPct}%`}
            sublabel="del día"
          />
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-semibold">Tu día</span>
              <DayStatusPill status={pillStatus} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <MiniKpi value={`${habitsDone}/${habitsTotal}`} label="hábitos" />
              <MiniKpi
                value={`${tasksDoneShown}/${tasksTotalShown}`}
                label="tareas"
              />
              <MiniKpi value={`${glasses}/${waterGoal}`} label="agua" />
            </div>
          </div>
        </div>
      </Card>

      {/* (4a) StatCards consumidas / quemadas */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard
          icon={Flame}
          value={consumedKcal.toLocaleString("es-AR")}
          unit="kcal"
          label="Consumidas hoy"
          tone="primary"
        />
        <StatCard
          icon={Dumbbell}
          value={burnedKcal.toLocaleString("es-AR")}
          unit="kcal"
          label="Quemadas"
          tone="warning"
        />
      </div>

      {/* (4a-bis) Fondo de ahorro (Objetivo NZ) — null si no hay objetivo */}
      <GoalWidget />

      {/* (4b) Gamificación unificada — tappable → /navi */}
      <Card
        onClick={() => router.push("/navi")}
        className="cursor-pointer p-3.5 transition-transform active:scale-[0.99]"
      >
        <div className="mb-2.5 flex items-center gap-2.5">
          <NaviMascot state="happy" size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold">Nivel {level}</span>
              {streak > 0 && (
                <Badge variant="warning" className="gap-1">
                  <Flame size={12} />
                  {streak} días
                </Badge>
              )}
            </div>
            <div className="font-mono text-xs tabular-nums text-muted-foreground">
              {totalXp.toLocaleString("es-AR")} XP · faltan {xpToNext} para subir
            </div>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-slow ease-standard"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </Card>

      {/* (4c) Summary rows — link, no duplicar */}
      <div className="space-y-2">
        <SecLabel>Tu jornada</SecLabel>
        <SummaryRow
          icon={Droplets}
          tone="info"
          label="Hidratación"
          sub={`${glasses * mlPerGlass} ml · faltan ${waterRemaining} ${
            waterRemaining === 1 ? "vaso" : "vasos"
          }`}
          value={`${glasses}/${waterGoal}`}
          onClick={() => router.push("/salud?tab=agua")}
        />
        <SummaryRow
          icon={ListChecks}
          tone="primary"
          label="Tareas de hoy"
          sub={`${tasksDoneShown} completadas · ${tasksPending} pendientes`}
          value={`${tasksDoneShown}/${tasksTotalShown}`}
          onClick={() => router.push("/tasks")}
        />
        <SummaryRow
          icon={CalendarCheck}
          tone="success"
          label="Agenda"
          sub="Ver eventos y reflexión del día"
          onClick={() => router.push("/agenda")}
        />
      </div>

      <div className="h-1" />
    </div>
  );
}
