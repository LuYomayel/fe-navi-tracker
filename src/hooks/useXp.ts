"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { XpStats, LevelUpResponse } from "@/types/xp";
import { useAuthStore } from "@/modules/auth/store";
import { toast } from "@/hooks/use-toast";

export function useXp() {
  const [xpStats, setXpStats] = useState<XpStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  const { user, updateUser } = useAuthStore();

  // Cargar estadísticas de XP
  const loadXpStats = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.xp.getStats();
      const stats = response.data as XpStats;
      setXpStats(stats);
      // Actualizar usuario en el store con los datos de XP (solo si han cambiado)
      if (
        user.level !== stats.level ||
        user.xp !== stats.xp ||
        user.totalXp !== stats.totalXp
      ) {
        updateUser({
          level: stats.level,
          xp: stats.xp,
          totalXp: stats.totalXp,
          streak: stats.streak,
          lastStreakDate: stats.lastStreakDate,
        });
      }
    } catch (error) {
      console.error("❌ Error cargando estadísticas de XP:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, updateUser]); // Solo depender del ID del usuario, no del objeto completo

  // Agregar XP por completar hábito
  const addHabitXp = useCallback(
    async (
      habitName: string,
      date?: string
    ): Promise<LevelUpResponse | null> => {
      console.log("user", user);
      if (!user) return null;

      try {
        console.log("adding habit xp", habitName, date);
        const response = await api.xp.addHabitXp({ habitName, date });
        const result = response.data as LevelUpResponse;

        // Recargar stats después de agregar XP
        await loadXpStats();

        // Mostrar notificación de XP
        showXpNotification(result, habitName);

        return result;
      } catch (error) {
        console.error("❌ Error agregando XP de hábito:", error);
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
      } catch (error) {
        console.error("❌ Error agregando XP de nutrición:", error);
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
      } catch (error) {
        console.error("❌ Error agregando XP de comentario:", error);
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

  // Mostrar notificación de XP ganada
  const showXpNotification = useCallback(
    (result: LevelUpResponse, actionName: string) => {
      if (result.leveledUp) {
        setIsLevelingUp(true);
        toast({
          title: "🎉 ¡SUBISTE DE NIVEL!",
          description: `¡Alcanzaste el nivel ${result.newLevel}! (+${result.xpEarned} XP)`,
          duration: 5000,
        });

        // Resetear el estado de level up después de unos segundos
        setTimeout(() => setIsLevelingUp(false), 3000);
      } else {
        const streakText =
          result.streakBonus > 0
            ? ` (${result.streakBonus} bonus de racha)`
            : "";
        toast({
          title: "✨ XP Ganada",
          description: `${actionName}: +${result.xpEarned} XP${streakText}`,
          duration: 3000,
        });
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

  // Calcular porcentaje de progreso
  const getProgressPercentage = useCallback((): number => {
    if (!xpStats) return 0;
    return Math.min(100, xpStats.xpProgressPercentage);
  }, [xpStats]);

  // Calcular XP restante para el siguiente nivel
  const getXpToNextLevel = useCallback((): number => {
    if (!xpStats) return 0;
    return Math.max(0, xpStats.xpForNextLevel - xpStats.xp);
  }, [xpStats]);

  // Cargar estadísticas al montar el hook (solo cuando cambia el usuario)
  useEffect(() => {
    if (user?.id) {
      loadXpStats();
    }
  }, [user?.id, loadXpStats]);

  return {
    xpStats,
    isLoading,
    error,
    isLevelingUp,
    loadXpStats,
    addHabitXp,
    addNutritionXp,
    addDailyCommentXp,
    getProgressPercentage,
    getXpToNextLevel,
  };
}
