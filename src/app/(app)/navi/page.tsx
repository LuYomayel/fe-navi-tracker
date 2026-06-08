"use client";

import { useEffect, useMemo } from "react";
import {
  Flame,
  Target,
  Utensils,
  Dumbbell,
  Zap,
  Sparkles,
} from "lucide-react";

import { useNaviState } from "@/hooks/useNaviState";
import { useXp } from "@/hooks/useXp";

import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { IconWell } from "@/components/ui/icon-well";
import {
  NaviMascot,
  type NaviState as MascotState,
} from "@/components/ui/navi-mascot";
import type { Tone } from "@/components/ui/tone";

import { formatXpLog } from "@/components/screens/navi/xp-log-format";

// La mascota solo soporta 6 estados; mapeamos los del hook (excited/proud) a esos.
const MASCOT_STATE: Record<string, MascotState> = {
  celebrating: "celebrating",
  excited: "celebrating",
  happy: "happy",
  proud: "happy",
  sad: "sad",
  sleepy: "sleepy",
  sick: "sick",
  default: "default",
};

interface StreakCell {
  label: string;
  sub: string;
  value: number;
  icon: typeof Target;
  tone: Tone;
}

export default function NaviPage() {
  const { currentState, getNaviInfo } = useNaviState();
  const { xpStats, isLoading, loadStreaks } = useXp();

  // Las rachas vienen en xpStats.streaks, pero refrescamos por las dudas.
  useEffect(() => {
    loadStreaks();
  }, [loadStreaks]);

  const naviInfo = getNaviInfo();
  const mascotState = MASCOT_STATE[currentState] ?? "default";

  // --- Nivel + XP (datos reales) ---
  const level = xpStats?.level ?? 1;
  const xp = xpStats?.xp ?? 0;
  const xpForNextLevel = xpStats?.xpForNextLevel ?? 100;
  const totalXp = xpStats?.totalXp ?? 0;
  const xpPct = Math.min(100, Math.round(xpStats?.xpProgressPercentage ?? 0));
  const xpRemaining = Math.max(0, xpForNextLevel - xp);

  // --- Rachas (3 categorías reales + racha global) ---
  const streaks = xpStats?.streaks;
  const habitsStreak = streaks?.habits.streak ?? 0;
  const nutritionStreak = streaks?.nutrition.streak ?? 0;
  const activityStreak = streaks?.activity.streak ?? 0;
  const bestStreak = Math.max(
    habitsStreak,
    nutritionStreak,
    activityStreak,
    xpStats?.streak ?? 0
  );

  const streakCells: StreakCell[] = [
    {
      label: "Hábitos",
      sub: "Todos los del día",
      value: habitsStreak,
      icon: Target,
      tone: "primary",
    },
    {
      label: "Nutrición",
      sub: "3+ comidas",
      value: nutritionStreak,
      icon: Utensils,
      tone: "success",
    },
    {
      label: "Actividad",
      sub: "1+ registro",
      value: activityStreak,
      icon: Dumbbell,
      tone: "warning",
    },
  ];

  // --- Actividad reciente (XP log real) ---
  const recentLogs = useMemo(
    () => (xpStats?.recentLogs ?? []).map(formatXpLog),
    [xpStats?.recentLogs]
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Navi"
        subtitle="Tu compañero de progreso"
        icon={Sparkles}
        metric={<span>{totalXp.toLocaleString("es")}</span>}
        metricLabel="XP total"
      />

      {/* Hero: mascota + mensaje */}
      <Card className="flex flex-col items-center gap-2 bg-gradient-to-b from-primary/[0.08] to-card px-5 py-6 text-center">
        <NaviMascot state={mascotState} size={132} float alt="Navi" />
        <div className="mt-1 text-lg font-bold">Navi</div>
        <p className="max-w-[280px] text-[13.5px] text-muted-foreground">
          {naviInfo.message}
        </p>
      </Card>

      {/* Nivel + XP unificado */}
      {isLoading && !xpStats ? (
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-3">
            <Skeleton className="h-[52px] w-[52px] rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="h-2.5 w-full rounded-full" />
        </Card>
      ) : (
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-[52px] w-[52px] shrink-0 flex-col items-center justify-center rounded-md bg-primary text-primary-foreground">
              <span className="text-[9px] font-semibold uppercase tracking-wide opacity-80">
                Nivel
              </span>
              <span className="font-mono text-xl font-bold leading-none tabular-nums">
                {level}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-[22px] font-bold tabular-nums">
                  {totalXp.toLocaleString("es")}
                </span>
                <span className="text-[13px] text-muted-foreground">
                  XP total
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Faltan{" "}
                <span className="font-mono tabular-nums">{xpRemaining}</span> XP
                para el nivel {level + 1}
              </div>
            </div>
          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-info transition-[width] duration-500"
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
            <span>
              {xp} / {xpForNextLevel} XP
            </span>
            <span>{xpPct}%</span>
          </div>
        </Card>
      )}

      {/* Rachas */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Rachas
          </h2>
          {bestStreak > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-warning-foreground dark:text-warning">
              <Flame size={14} />
              <span className="font-mono tabular-nums">{bestStreak}</span>
              {bestStreak === 1 ? " día" : " días"}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {streakCells.map((s) => (
            <Card
              key={s.label}
              className="flex flex-col items-center gap-1 p-3 text-center"
            >
              <IconWell icon={s.icon} tone={s.tone} size={32} iconSize={16} />
              <span className="font-mono text-xl font-bold tabular-nums">
                {s.value}
              </span>
              <span className="text-[11.5px] font-semibold">{s.label}</span>
              <span className="text-[10.5px] text-muted-foreground">
                {s.sub}
              </span>
            </Card>
          ))}
        </div>
      </div>

      {/* Actividad reciente (XP log) */}
      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Zap size={17} className="text-warning-foreground dark:text-warning" />
          <span className="text-[15px] font-semibold">Actividad reciente</span>
        </div>

        {recentLogs.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Sin actividad todavía"
            description="Completá un hábito, registrá una comida o sumá ejercicio para empezar a ganar XP."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {recentLogs.map((e) => (
              <div key={e.id} className="flex items-center gap-3">
                <IconWell icon={e.icon} tone={e.tone} size={30} iconSize={15} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium">
                    {e.label}
                  </div>
                  {e.when && (
                    <div className="font-mono text-[11px] tabular-nums text-muted-foreground">
                      {e.when}
                    </div>
                  )}
                </div>
                <Badge variant="warning">+{e.xp} XP</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
