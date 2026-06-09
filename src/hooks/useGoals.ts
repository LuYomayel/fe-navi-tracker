"use client";

import { useState, useCallback, useRef } from "react";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import type { GoalProgress } from "@/types";

/**
 * Hook autocontenido para el fondo de ahorro (Objetivo NZ). Patrón `useMealPrep`:
 * estado local + cache corta. Lee `/goals/progress` (goal + % + restante + días,
 * con las contribuciones incluidas) y permite sumar aportes/gastos.
 */
export function useGoals() {
  const [progress, setProgress] = useState<GoalProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lastFetch = useRef<number>(0);
  const CACHE_TTL = 30000; // 30s

  const loadProgress = useCallback(async (force = false) => {
    if (!force && Date.now() - lastFetch.current < CACHE_TTL) return;
    try {
      setIsLoading(true);
      const res = await api.goals.getProgress();
      if (res.success) {
        setProgress((res.data as GoalProgress) ?? null);
        lastFetch.current = Date.now();
      }
    } catch (error) {
      console.error("Error loading goal progress:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addContribution = useCallback(
    async (amountUsd: number, description?: string, date?: string) => {
      const goalId = progress?.goal?.id;
      if (!goalId) {
        toast.error("No hay objetivo activo");
        return false;
      }
      try {
        setIsSubmitting(true);
        const res = await api.goals.contribute(goalId, {
          amountUsd,
          description,
          date,
        });
        if (res.success) {
          toast.success(
            amountUsd >= 0 ? "Aporte registrado" : "Gasto registrado",
          );
          await loadProgress(true);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error adding contribution:", error);
        toast.error("Error al registrar el movimiento");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [progress?.goal?.id, loadProgress],
  );

  return { progress, isLoading, isSubmitting, loadProgress, addContribution };
}
