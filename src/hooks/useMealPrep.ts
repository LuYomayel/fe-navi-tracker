"use client";

import { useState, useCallback, useRef } from "react";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import {
  MealPrep,
  NutritionistPlan,
  GenerateMealPrepDto,
  ImportNutritionistPlanDto,
  UpdateSlotDto,
  DayKey,
  MealSlotKey,
} from "@/types";

export function useMealPrep() {
  const [activeMealPrep, setActiveMealPrep] = useState<MealPrep | null>(null);
  const [allPreps, setAllPreps] = useState<MealPrep[]>([]);
  const [activePlan, setActivePlan] = useState<NutritionistPlan | null>(null);
  const [allPlans, setAllPlans] = useState<NutritionistPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const lastFetch = useRef<number>(0);
  const CACHE_TTL = 30000; // 30s

  // ─── Load Methods ──────────────────────────────────────────

  const loadActiveMealPrep = useCallback(async (force = false) => {
    if (!force && Date.now() - lastFetch.current < CACHE_TTL) return;

    try {
      setIsLoading(true);
      const res = await api.mealPrep.getActive();
      if (res.success) {
        setActiveMealPrep(res.data);
        lastFetch.current = Date.now();
      }
    } catch (error) {
      console.error("Error loading active meal prep:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAllMealPreps = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.mealPrep.getAll();
      if (res.success) {
        setAllPreps(res.data || []);
      }
    } catch (error) {
      console.error("Error loading meal preps:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadActivePlan = useCallback(async () => {
    try {
      const res = await api.mealPrep.getActivePlan();
      if (res.success) {
        setActivePlan(res.data);
      }
    } catch (error) {
      console.error("Error loading active plan:", error);
    }
  }, []);

  const loadAllPlans = useCallback(async () => {
    try {
      const res = await api.mealPrep.getAllPlans();
      if (res.success) {
        setAllPlans(res.data || []);
      }
    } catch (error) {
      console.error("Error loading plans:", error);
    }
  }, []);

  // ─── Nutritionist Plan Methods ─────────────────────────────

  const importPlan = useCallback(async (data: ImportNutritionistPlanDto) => {
    try {
      setIsImporting(true);
      const res = await api.mealPrep.importPlan(data);
      if (res.success) {
        setActivePlan(res.data);
        toast.success("Plan importado", "El plan del nutricionista se importo correctamente");
        return res.data;
      }
    } catch (error) {
      console.error("Error importing plan:", error);
      toast.error("Error", "No se pudo importar el plan del nutricionista");
      throw error;
    } finally {
      setIsImporting(false);
    }
  }, []);

  const deletePlan = useCallback(async (id: string) => {
    try {
      const res = await api.mealPrep.deletePlan(id);
      if (res.success) {
        setAllPlans((prev) => prev.filter((p) => p.id !== id));
        if (activePlan?.id === id) setActivePlan(null);
        toast.success("Plan eliminado", "El plan fue eliminado correctamente");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Error", "No se pudo eliminar el plan");
    }
  }, [activePlan]);

  // ─── Meal Prep Methods ─────────────────────────────────────

  const generatePrep = useCallback(async (data: GenerateMealPrepDto) => {
    try {
      setIsGenerating(true);
      const res = await api.mealPrep.generate(data);
      if (res.success) {
        setActiveMealPrep(res.data);
        toast.success("Meal prep generado", "Tu plan semanal fue creado con IA");
        return res.data;
      }
    } catch (error) {
      console.error("Error generating meal prep:", error);
      toast.error("Error", "No se pudo generar el meal prep. Intenta de nuevo.");
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const updateSlot = useCallback(async (prepId: string, data: UpdateSlotDto) => {
    try {
      const res = await api.mealPrep.updateSlot(prepId, data);
      if (res.success) {
        setActiveMealPrep(res.data);
      }
    } catch (error) {
      console.error("Error updating slot:", error);
      toast.error("Error", "No se pudo actualizar la comida");
    }
  }, []);

  const eatSlot = useCallback(async (
    prepId: string,
    day: DayKey,
    mealType: MealSlotKey,
    date: string,
  ) => {
    try {
      const res = await api.mealPrep.eatSlot(prepId, { day, mealType, date });
      if (res.success) {
        // Update the local state with the returned mealPrep
        const data = res.data as any;
        if (data.mealPrep) {
          setActiveMealPrep(data.mealPrep);
        }

        // Add XP for nutrition log
        try {
          await api.xp.addNutritionXp({ mealType, date });
        } catch {
          // XP is best-effort
        }

        toast.success("+15 XP", "Comida registrada en tu balance diario");
        return data;
      }
    } catch (error: any) {
      console.error("Error marking slot eaten:", error);
      toast.error("Error", error?.message || "No se pudo registrar la comida");
    }
  }, []);

  const archivePrep = useCallback(async (id: string) => {
    try {
      const res = await api.mealPrep.update(id, { status: "archived" });
      if (res.success) {
        if (activeMealPrep?.id === id) setActiveMealPrep(null);
        setAllPreps((prev) => prev.map((p) => (p.id === id ? { ...p, status: "archived" as const } : p)));
        toast.success("Archivado", "El meal prep fue archivado");
      }
    } catch (error) {
      console.error("Error archiving prep:", error);
      toast.error("Error", "No se pudo archivar el meal prep");
    }
  }, [activeMealPrep]);

  const deletePrep = useCallback(async (id: string) => {
    try {
      const res = await api.mealPrep.delete(id);
      if (res.success) {
        if (activeMealPrep?.id === id) setActiveMealPrep(null);
        setAllPreps((prev) => prev.filter((p) => p.id !== id));
        toast.success("Eliminado", "El meal prep fue eliminado");
      }
    } catch (error) {
      console.error("Error deleting prep:", error);
      toast.error("Error", "No se pudo eliminar el meal prep");
    }
  }, [activeMealPrep]);

  return {
    // State
    activeMealPrep,
    allPreps,
    activePlan,
    allPlans,
    isLoading,
    isGenerating,
    isImporting,

    // Load methods
    loadActiveMealPrep,
    loadAllMealPreps,
    loadActivePlan,
    loadAllPlans,

    // Plan methods
    importPlan,
    deletePlan,

    // Prep methods
    generatePrep,
    updateSlot,
    eatSlot,
    archivePrep,
    deletePrep,
  };
}
