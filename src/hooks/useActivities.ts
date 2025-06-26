"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/modules/auth/store";
import type { Activity } from "@/types";

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const { user } = useAuthStore();

  // Cache de 30 segundos para evitar requests innecesarios
  const CACHE_DURATION = 30000;

  // Cargar actividades con cache
  const loadActivities = useCallback(
    async (force = false) => {
      if (!user) return;

      // Verificar cache si no es forzado
      const now = Date.now();
      if (!force && lastFetch && now - lastFetch < CACHE_DURATION) {
        console.log("📦 Usando actividades desde cache");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("🔄 Cargando actividades desde backend...");
        const response = await api.activities.getAll();
        setActivities(response.data as Activity[]);
        setLastFetch(now);
        console.log(
          "✅ Actividades cargadas:",
          (response.data as Activity[]).length
        );
      } catch (error) {
        console.error("❌ Error cargando actividades:", error);
        setError(error instanceof Error ? error.message : "Error desconocido");
      } finally {
        setIsLoading(false);
      }
    },
    [user, lastFetch, CACHE_DURATION]
  );

  // Crear actividad
  const createActivity = async (
    activityData: Omit<Activity, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!user) throw new Error("No hay sesión activa");

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.activities.create(activityData);
      const newActivity = response.data as Activity;

      setActivities((prev) => [...prev, newActivity]);
      console.log("✅ Actividad creada:", newActivity.name);

      return newActivity;
    } catch (error) {
      console.error("❌ Error creando actividad:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Actualizar actividad
  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    if (!user) throw new Error("No hay sesión activa");

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.activities.update(id, updates);
      const updatedActivity = response.data as Activity;

      setActivities((prev) =>
        prev.map((activity) =>
          activity.id === id ? updatedActivity : activity
        )
      );

      console.log("✅ Actividad actualizada:", updatedActivity.name);
      return updatedActivity;
    } catch (error) {
      console.error("❌ Error actualizando actividad:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar actividad
  const deleteActivity = async (id: string) => {
    if (!user) throw new Error("No hay sesión activa");

    setIsLoading(true);
    setError(null);

    try {
      await api.activities.delete(id);

      setActivities((prev) => prev.filter((activity) => activity.id !== id));
      console.log("✅ Actividad eliminada");
    } catch (error) {
      console.error("❌ Error eliminando actividad:", error);
      setError(error instanceof Error ? error.message : "Error desconocido");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar actividades cuando hay sesión
  useEffect(() => {
    if (user) {
      loadActivities();
    } else {
      setActivities([]);
    }
  }, [user, loadActivities]);

  return {
    activities,
    isLoading,
    error,
    loadActivities,
    createActivity,
    updateActivity,
    deleteActivity,
  };
}
