import type {
  NutritionAnalysis,
  BodyAnalysis,
  SkinFoldRecord,
  PhysicalActivity,
  WeightEntry,
  CreateWeightEntryDto,
} from "@/types";
import { toast } from "@/lib/toast-helper";
import { api } from "@/lib/api-client";
import { XpAction } from "@/types/xp";
import type { StoreSet, StoreGet } from "../types";

export interface NutritionSlice {
  nutritionAnalyses: NutritionAnalysis[];
  bodyAnalyses: BodyAnalysis[];
  skinFoldRecords: SkinFoldRecord[];
  physicalActivities: PhysicalActivity[];
  weightEntries: WeightEntry[];
  addNutritionAnalysis: (
    analysis: Omit<NutritionAnalysis, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  deleteNutritionAnalysis: (id: string) => Promise<void>;
  updateNutritionAnalysis: (
    id: string,
    updates: Partial<NutritionAnalysis>
  ) => Promise<void>;
  addBodyAnalysis: (
    analysis: Omit<BodyAnalysis, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  deleteBodyAnalysis: (id: string) => Promise<void>;
  addSkinFoldRecord: (
    record: Omit<SkinFoldRecord, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateSkinFoldRecord: (
    id: string,
    updates: Partial<SkinFoldRecord>
  ) => Promise<void>;
  deleteSkinFoldRecord: (id: string) => Promise<void>;
  getAllFoodAnalysis: () => Promise<void>;
  getAllBodyAnalysis: () => Promise<void>;
  getAllSkinFoldRecords: () => Promise<void>;
  getAllPhysicalActivities: () => Promise<void>;
  getDailyCalorieBalance: (date: Date) => {
    caloriesConsumed: number;
    caloriesBurned: number;
    netCalories: number;
    isDeficit: boolean;
    isSurplus: boolean;
    mealsCount: number;
    activitiesCount: number;
  };
  addWeightEntry: (entry: CreateWeightEntryDto) => Promise<void>;
  deleteWeightEntry: (id: string) => Promise<void>;
  getAllWeightEntries: () => Promise<void>;
  refreshNutritionData: () => Promise<void>;
  refreshPhysicalActivities: () => Promise<void>;
  refreshWeightEntries: () => Promise<void>;
  loadNutritionGoals: () => Promise<void>;
}

export const createNutritionSlice = (set: StoreSet, get: StoreGet): NutritionSlice => ({
  nutritionAnalyses: [],
  bodyAnalyses: [],
  skinFoldRecords: [],
  physicalActivities: [],
  weightEntries: [],

  addNutritionAnalysis: async (analysis) => {
    try {
      set({ isLoading: true });

      const response = await api.nutrition.createAnalysis(analysis);
      if (!response.success) {
        toast.error("Error", response.message);
        return;
      }
      const responseEXP = await api.xp.addXp({
        action: XpAction.NUTRITION_LOG,
        xpAmount: 15,
        description: "Análisis nutricional guardado",
      });
      if (!responseEXP.success) {
        toast.error("Error", responseEXP.message);
        return;
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("nutrition-log"));
      }
      const newAnalysis = response.data as NutritionAnalysis;

      set((state) => ({
        nutritionAnalyses: [...state.nutritionAnalyses, newAnalysis],
        isLoading: false,
      }));

      setTimeout(() => {
        get().refreshNutritionData();
      }, 500);

      toast.success(
        "Análisis nutricional guardado",
        "Se ha registrado tu comida exitosamente"
      );
    } catch (error) {
      console.error("Error guardando análisis nutricional:", error);
      set({ isLoading: false });
      toast.error(
        "Error",
        "No se pudo guardar el análisis nutricional. Inténtalo de nuevo."
      );
    }
  },

  deleteNutritionAnalysis: async (id) => {
    try {
      await api.nutrition.deleteAnalysis(id);

      set((state) => ({
        nutritionAnalyses: state.nutritionAnalyses.filter(
          (analysis) => analysis.id !== id
        ),
      }));

      toast.success(
        "Análisis eliminado",
        "El registro nutricional se ha eliminado"
      );
    } catch (error) {
      console.error("Error eliminando análisis nutricional:", error);
      toast.error(
        "Error",
        "No se pudo eliminar el análisis. Inténtalo de nuevo."
      );
    }
  },

  updateNutritionAnalysis: async (id, updates) => {
    try {
      const response = await api.nutrition.updateAnalysis(id, updates);
      const updatedAnalysis = response.data;

      set((state) => ({
        nutritionAnalyses: state.nutritionAnalyses.map((analysis) =>
          analysis.id === id
            ? { ...analysis, ...(updatedAnalysis as object) }
            : analysis
        ),
      }));

      toast.success("Análisis actualizado", "Los cambios se han guardado");
    } catch (error) {
      console.error("Error actualizando análisis nutricional:", error);
      toast.error(
        "Error",
        "No se pudo actualizar el análisis. Inténtalo de nuevo."
      );
    }
  },

  addBodyAnalysis: async (analysis) => {
    try {
      set({ isLoading: true });

      const response = await api.bodyAnalysis.saveAnalysis(analysis);
      const savedAnalysis = response.data as BodyAnalysis;

      set((state) => ({
        bodyAnalyses: [...state.bodyAnalyses, savedAnalysis],
        isLoading: false,
      }));

      toast.success(
        "Análisis corporal guardado",
        "Se ha registrado tu análisis exitosamente"
      );
    } catch (error) {
      console.error("Error guardando análisis corporal:", error);
      set({ isLoading: false });
      toast.error(
        "Error",
        "No se pudo guardar el análisis corporal. Inténtalo de nuevo."
      );
    }
  },

  deleteBodyAnalysis: async (id) => {
    try {
      await api.bodyAnalysis.delete(id);
      set((state) => ({
        bodyAnalyses: state.bodyAnalyses.filter(
          (analysis) => analysis.id !== id
        ),
      }));

      toast.success(
        "Análisis eliminado",
        "El análisis corporal se ha eliminado"
      );
    } catch (error) {
      console.error("Error eliminando análisis corporal:", error);
      toast.error(
        "Error",
        "No se pudo eliminar el análisis. Inténtalo de nuevo."
      );
    }
  },

  addSkinFoldRecord: async (record) => {
    try {
      const response = await api.skinFold.createRecord(record as SkinFoldRecord);
      const savedRecord = response.data as SkinFoldRecord;

      set((state) => ({
        skinFoldRecords: [...state.skinFoldRecords, savedRecord],
      }));

      toast.success(
        "Pliegues guardados",
        "Se han registrado tus mediciones"
      );
    } catch (error) {
      console.error("Error guardando pliegues cutáneos:", error);
      toast.error(
        "Error",
        "No se pudieron guardar los pliegues. Inténtalo de nuevo."
      );
    }
  },

  updateSkinFoldRecord: async (id, updates) => {
    try {
      const response = await api.skinFold.updateRecord(id, updates as SkinFoldRecord);
      const updatedRecord = response.data as SkinFoldRecord;

      set((state) => ({
        skinFoldRecords: state.skinFoldRecords.map((record) =>
          record.id === id ? updatedRecord : record
        ),
      }));

      toast.success("Pliegues actualizados", "Los cambios se han guardado");
    } catch (error) {
      console.error("Error actualizando pliegues cutáneos:", error);
      toast.error(
        "Error",
        "No se pudieron actualizar los pliegues. Inténtalo de nuevo."
      );
    }
  },

  deleteSkinFoldRecord: async (id) => {
    try {
      await api.skinFold.deleteRecord(id);

      set((state) => ({
        skinFoldRecords: state.skinFoldRecords.filter(
          (record) => record.id !== id
        ),
      }));

      toast.success(
        "Registro eliminado",
        "El registro de pliegues se ha eliminado"
      );
    } catch (error) {
      console.error("Error eliminando pliegues cutáneos:", error);
      toast.error(
        "Error",
        "No se pudo eliminar el registro. Inténtalo de nuevo."
      );
    }
  },

  getAllFoodAnalysis: async () => {
    try {
      const response = await api.nutrition.getAnalyses();
      const analysis = response.data as NutritionAnalysis[];
      set({ nutritionAnalyses: analysis });
    } catch (error) {
      console.error("Error cargando análisis nutricionales:", error);
    }
  },

  getAllBodyAnalysis: async () => {
    try {
      const response = await api.bodyAnalysis.getAll();
      const analysis = response.data as BodyAnalysis[];
      set({ bodyAnalyses: analysis });
    } catch (error) {
      console.error("Error cargando análisis corporales:", error);
    }
  },

  getAllSkinFoldRecords: async () => {
    try {
      const response = await api.skinFold.getRecords();
      const records = response.data as SkinFoldRecord[];
      set({ skinFoldRecords: records });
    } catch (error) {
      console.error("Error cargando registros de pliegues:", error);
    }
  },

  getAllPhysicalActivities: async () => {
    try {
      const response = await api.physicalActivity.getAll();
      const activities = response.data as PhysicalActivity[];
      set({ physicalActivities: activities });
    } catch (error) {
      console.error("Error cargando actividades físicas:", error);
    }
  },

  getDailyCalorieBalance: (date: Date) => {
    const state = get();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;

    const dayNutrition = state.nutritionAnalyses.filter(
      (analysis) => analysis.date === dateKey
    );

    const caloriesConsumed = dayNutrition.reduce(
      (total, analysis) => total + (analysis.totalCalories || 0),
      0
    );

    const dayActivities = state.physicalActivities.filter(
      (activity) => activity.date === dateKey
    );

    const caloriesBurned = dayActivities.reduce(
      (total, activity) => total + (activity.activeEnergyKcal || 0),
      0
    );

    const netCalories = caloriesConsumed - caloriesBurned;

    return {
      caloriesConsumed,
      caloriesBurned,
      netCalories,
      isDeficit: netCalories < 0,
      isSurplus: netCalories > 0,
      mealsCount: dayNutrition.length,
      activitiesCount: dayActivities.length,
    };
  },

  addWeightEntry: async (entry: CreateWeightEntryDto) => {
    try {
      set((state) => ({
        weightEntries: [entry as unknown as WeightEntry, ...state.weightEntries].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      }));
    } catch (error) {
      console.error("Error agregando peso al state:", error);
      toast.error("Error", "No se pudo registrar el peso");
    }
  },

  deleteWeightEntry: async (id: string) => {
    try {
      await api.nutrition.deleteWeightEntry(id);
      set((state) => ({
        weightEntries: state.weightEntries.filter(
          (entry) => entry.id !== id
        ),
      }));

      toast.success(
        "Registro eliminado",
        "El registro de peso se ha eliminado"
      );
    } catch (error) {
      console.error("Error eliminando peso:", error);
      toast.error("Error", "No se pudo eliminar el registro");
    }
  },

  getAllWeightEntries: async () => {
    try {
      const response = await api.nutrition.getAllWeightEntries();
      const entries = response.data as WeightEntry[];
      set({ weightEntries: entries });
    } catch (error) {
      console.error("Error cargando registros de peso:", error);
    }
  },

  refreshNutritionData: async () => {
    try {
      await get().getAllFoodAnalysis();
    } catch (error) {
      console.error("Error refrescando datos nutricionales:", error);
    }
  },

  refreshPhysicalActivities: async () => {
    try {
      await get().getAllPhysicalActivities();
    } catch (error) {
      console.error("Error refrescando actividades físicas:", error);
    }
  },

  refreshWeightEntries: async () => {
    try {
      await get().getAllWeightEntries();
    } catch (error) {
      console.error("Error refrescando weight entries:", error);
    }
  },

  loadNutritionGoals: async () => {
    try {
      const response = await api.preferences.getCurrentGoals();
      if (response.success && response.data) {
        const goals = response.data as {
          dailyCalorieGoal: number;
          proteinGoal: number;
          carbsGoal: number;
          fatGoal: number;
        };
        set((state) => ({
          preferences: {
            ...state.preferences,
            dailyCalorieGoal: goals.dailyCalorieGoal,
            proteinGoal: goals.proteinGoal,
            carbsGoal: goals.carbsGoal,
            fatGoal: goals.fatGoal,
          },
        }));
      }
    } catch (error) {
      console.error("Error cargando objetivos nutricionales:", error);
    }
  },
});
