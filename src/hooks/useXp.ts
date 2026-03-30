"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { LevelUpResponse, StreakInfo } from "@/types/xp";
import { useAuthStore } from "@/modules/auth/store";
import { toast } from "@/hooks/use-toast";
import { useNaviTrackerStore } from "@/store";

export interface Streaks {
  habits: StreakInfo;
  nutrition: StreakInfo;
  activity: StreakInfo;
}

export function useXp() {
  // XP stats now come from the shared store (deduplicates 9 concurrent fetches)
  const { xpStats, fetchXpStats, invalidateXpStats } = useNaviTrackerStore();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStreaks, setIsLoadingStreaks] = useState(false);
  const [streaks, setStreaks] = useState<Streaks | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  const { user, updateUser } = useAuthStore();

  // Force-refresh XP stats (invalidates cache then fetches)
  const loadXpStats = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      invalidateXpStats();
      await fetchXpStats();
    } catch (err) {
      console.error("Error cargando estadísticas de XP:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, fetchXpStats, invalidateXpStats]);

  // Sync auth store user object when xpStats change
  useEffect(() => {
    if (!xpStats || !user) return;
    if (xpStats.streaks) {
      setStreaks(xpStats.streaks);
    }
    if (
      user.level !== xpStats.level ||
      user.xp !== xpStats.xp ||
      user.totalXp !== xpStats.totalXp
    ) {
      updateUser({
        level: xpStats.level,
        xp: xpStats.xp,
        totalXp: xpStats.totalXp,
        streak: xpStats.streak,
        lastStreakDate: xpStats.lastStreakDate,
      });
    }
  }, [xpStats, user?.id, updateUser]);

  // Initial load (uses TTL cache — all 9 hook instances share the same fetch)
  useEffect(() => {
    if (user?.id) {
      fetchXpStats();
    }
  }, [user?.id, fetchXpStats]);

  // Reload streaks separately when needed
  const loadStreaks = useCallback(async () => {
    if (!user) return;

    setIsLoadingStreaks(true);

    try {
      const response = await api.xp.getStreaks();
      if (!response.success) {
        throw new Error("Error al cargar rachas");
      }
      setStreaks(response.data);
    } catch (err) {
      console.error("Error cargando rachas:", err);
    } finally {
      setIsLoadingStreaks(false);
    }
  }, [user?.id]);

  // Listen for XP update events and force-refresh
  useEffect(() => {
    const handleXpUpdate = () => {
      loadXpStats();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("xp-updated", handleXpUpdate);
      window.addEventListener("habit-completed", handleXpUpdate);
      window.addEventListener("day-completed", handleXpUpdate);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("xp-updated", handleXpUpdate);
        window.removeEventListener("habit-completed", handleXpUpdate);
        window.removeEventListener("day-completed", handleXpUpdate);
      }
    };
  }, [loadXpStats]);

  // Agregar XP por completar hábito
  const addHabitXp = useCallback(
    async (
      habitName: string,
      date?: string
    ): Promise<LevelUpResponse | null> => {
      if (!user) return null;

      try {
        const response = await api.xp.addHabitXp({ habitName, date });
        const result = response.data as LevelUpResponse;

        await loadXpStats();
        showXpNotification(result, habitName);

        return result;
      } catch (err) {
        console.error("Error agregando XP de hábito:", err);
        toast({
          title: "Error",
          description: "No se pudo registrar la experiencia",
          variant: "destructive",
        });
        return null;
      }
    },
    [user, loadXpStats]
  );

  // Agregar XP por registro nutricional
  const addNutritionXp = useCallback(
    async (
      mealType: string,
      date?: string
    ): Promise<LevelUpResponse | null> => {
      if (!user) return null;

      try {
        const response = await api.xp.addNutritionXp({ mealType, date });
        const result = response.data as LevelUpResponse;

        await loadXpStats();
        showXpNotification(result, `Registro de ${mealType}`);

        return result;
      } catch (err) {
        console.error("Error agregando XP de nutrición:", err);
        toast({
          title: "Error",
          description: "No se pudo registrar la experiencia",
          variant: "destructive",
        });
        return null;
      }
    },
    [user, loadXpStats]
  );

  // Agregar XP por comentario diario
  const addDailyCommentXp = useCallback(
    async (date?: string): Promise<LevelUpResponse | null> => {
      if (!user) return null;

      try {
        const response = await api.xp.addDailyCommentXp({ date });
        const result = response.data as LevelUpResponse;

        await loadXpStats();
        showXpNotification(result, "Reflexión diaria");

        return result;
      } catch (err) {
        console.error("Error agregando XP de comentario:", err);
        toast({
          title: "Error",
          description: "No se pudo registrar la experiencia",
          variant: "destructive",
        });
        return null;
      }
    },
    [user, loadXpStats]
  );

  // Mostrar notificación de XP ganada y disparar eventos de milestone
  const showXpNotification = useCallback(
    (result: LevelUpResponse, actionName: string) => {
      if (result.leveledUp) {
        setIsLevelingUp(true);
        toast({
          title: "🎉 ¡SUBISTE DE NIVEL!",
          description: `¡Alcanzaste el nivel ${result.newLevel}! (+${result.xpEarned} XP)`,
          duration: 5000,
        });

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("level-up"));
        }

        setTimeout(() => setIsLevelingUp(false), 3000);
      } else {
        const streakText =
          result.streakBonus > 0
            ? ` (+${result.streakBonus} bonus de racha)`
            : "";
        toast({
          title: "✨ XP Ganada",
          description: `${actionName}: +${result.xpEarned} XP${streakText}`,
          duration: 3000,
        });
      }

      if (typeof window !== "undefined") {
        if (result.streakBonus > 0) {
          window.dispatchEvent(new Event("streak-bonus"));
        }
        if (result.streak === 3) {
          window.dispatchEvent(new Event("streak-3-days"));
        }
        if (result.streak === 7) {
          window.dispatchEvent(new Event("streak-7-days"));
        }
      }

      if (result.streak > 1) {
        toast({
          title: "🔥 ¡Racha activa!",
          description: `${result.streak} días consecutivos`,
          duration: 2000,
        });
      }
    },
    []
  );

  const getProgressPercentage = useCallback((): number => {
    if (!xpStats) return 0;
    return Math.min(100, xpStats.xpProgressPercentage);
  }, [xpStats]);

  const getXpToNextLevel = useCallback((): number => {
    if (!xpStats) return 0;
    return Math.max(0, xpStats.xpForNextLevel - xpStats.xp);
  }, [xpStats]);

  return {
    xpStats,
    streaks,
    isLoading,
    isLoadingStreaks,
    error,
    isLevelingUp,
    loadXpStats,
    loadStreaks,
    addHabitXp,
    addNutritionXp,
    addDailyCommentXp,
    getProgressPercentage,
    getXpToNextLevel,
  };
}
