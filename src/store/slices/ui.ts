import type {
  Activity,
  NutritionAnalysis,
  BodyAnalysis,
  SkinFoldRecord,
  PhysicalActivity,
  WeightEntry,
  DailyNote,
  UserPreferences,
  Task,
  CalendarEvent,
} from "@/types";
import { toast } from "@/lib/toast-helper";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/modules/auth/store";
import type { StoreSet, StoreGet } from "../types";
import { getDateKey } from "@/lib/utils";

export interface UISlice {
  selectedDate: Date;
  selectedModalDate: Date | undefined;
  currentWeekStart: Date;
  showAddActivityModal: boolean;
  showDailyReflection: boolean;
  showNutritionAnalyzer: boolean;
  showAIAssistant: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  preferences: UserPreferences;
  setSelectedDate: (date: Date) => void;
  setCurrentWeekStart: (date: Date) => void;
  setShowAddActivityModal: (show: boolean) => void;
  setShowDailyReflection: (show: boolean, date?: Date) => void;
  setShowNutritionAnalyzer: (show: boolean, date?: Date) => void;
  setShowAIAssistant: (show: boolean) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  initializeFromDatabase: (opts?: { silent?: boolean }) => Promise<void>;
  refreshAllData: () => Promise<void>;
  refreshActivities: () => Promise<void>;
}

export const createUISlice = (set: StoreSet, get: StoreGet): UISlice => ({
  selectedDate: new Date(),
  selectedModalDate: undefined,
  currentWeekStart: new Date(),
  showAddActivityModal: false,
  showDailyReflection: false,
  showNutritionAnalyzer: false,
  showAIAssistant: false,
  isLoading: false,
  isInitialized: false,
  preferences: {
    darkMode: false,
    weekStartsOnMonday: true,
    notifications: true,
    language: "es",
  },

  setSelectedDate: (date) => set({ selectedDate: date }),
  setCurrentWeekStart: (date) => set({ currentWeekStart: date }),
  setShowAddActivityModal: (show) => set({ showAddActivityModal: show }),
  setShowDailyReflection: (show, date) =>
    set({
      showDailyReflection: show,
      selectedModalDate: date,
    }),
  setShowNutritionAnalyzer: (show, date) =>
    set({
      showNutritionAnalyzer: show,
      selectedModalDate: date,
    }),
  setShowAIAssistant: (show) => set({ showAIAssistant: show }),

  updatePreferences: (preferences) =>
    set((state) => ({
      preferences: { ...state.preferences, ...preferences },
    })),

  initializeFromDatabase: async (opts?: { silent?: boolean }) => {
    // Sin token no se pide nada: en nativo el persist de auth es ASINCRONO
    // (Capacitor Preferences), asi que arrancar antes de rehidratar mandaba
    // las 9 requests sin Authorization -> 401 -> store vacio hasta reabrir
    // la app. Dejamos isInitialized en false para reintentar al rehidratar.
    if (!useAuthStore.getState().getAccessToken()) return;
    try {
      set({ isLoading: true });

      const todayStr = getDateKey(new Date());
      const thirtyDaysLater = getDateKey(new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ));

      // Si TODAS fallan (sin red, token vencido) no marcamos inicializado:
      // que el proximo trigger reintente en vez de quedar vacio para siempre.
      let failed = 0;
      const onFail = () => {
        failed++;
        return { data: [] };
      };

      const [
        activitiesResponse,
        nutritionResponse,
        bodyAnalysesResponse,
        notesResponse,
        physicalActivitiesResponse,
        weightEntriesResponse,
        skinFoldResponse,
        tasksResponse,
        calendarEventsResponse,
      ] = await Promise.all([
        api.activities.getAll().catch(onFail),
        api.nutrition.getAnalyses().catch(onFail),
        api.bodyAnalysis.getAll().catch(onFail),
        api.notes.getAll().catch(onFail),
        api.physicalActivity.getAll().catch(onFail),
        api.nutrition.getAllWeightEntries().catch(onFail),
        api.skinFold.getRecords().catch(onFail),
        api.tasks.getAll().catch(onFail),
        api.calendar.getEvents(todayStr, thirtyDaysLater).catch(onFail),
      ]);

      const allFailed = failed === 9;
      if (allFailed) {
        set({ isLoading: false, isInitialized: false });
        if (!opts?.silent) {
          toast.error(
            "Error de sincronización",
            "No se pudieron cargar los datos. Revisá la conexión."
          );
        }
        return;
      }

      set({
        activities: (activitiesResponse.data as Activity[]) || [],
        nutritionAnalyses:
          (nutritionResponse.data as NutritionAnalysis[]) || [],
        bodyAnalyses: (bodyAnalysesResponse.data as BodyAnalysis[]) || [],
        dailyNotes: (notesResponse.data as DailyNote[]) || [],
        physicalActivities:
          (physicalActivitiesResponse.data as PhysicalActivity[]) || [],
        weightEntries: (weightEntriesResponse.data as WeightEntry[]) || [],
        skinFoldRecords: (skinFoldResponse.data as SkinFoldRecord[]) || [],
        tasks: (tasksResponse.data as Task[]) || [],
        calendarEvents: (calendarEventsResponse.data as CalendarEvent[]) || [],
        isInitialized: true,
        isLoading: false,
      });

      get().loadNutritionGoals().catch(() => {});
    } catch (error) {
      console.error("Error inicializando desde API:", error);
      // isInitialized queda en false para que el proximo trigger reintente
      set({ isLoading: false, isInitialized: false });
      if (!opts?.silent) {
        toast.error(
          "Error de sincronización",
          "No se pudieron cargar los datos. Revisá la conexión."
        );
      }
    }
  },

  refreshAllData: async () => {
    try {
      set({ isLoading: true });
      await Promise.all([
        get().getAllFoodAnalysis(),
        get().getAllBodyAnalysis(),
        get().getAllSkinFoldRecords(),
        get().getAllPhysicalActivities(),
      ]);

      const activitiesResponse = await api.activities.getAll();
      if (activitiesResponse.success) {
        set({ activities: activitiesResponse.data as Activity[] });
      }
    } catch (error) {
      console.error("Error refrescando datos:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  refreshActivities: async () => {
    try {
      const response = await api.activities.getAll();
      if (response.success) {
        set({ activities: response.data as Activity[] });
      }
    } catch (error) {
      console.error("Error refrescando actividades:", error);
    }
  },
});
