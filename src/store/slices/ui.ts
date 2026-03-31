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
import type { StoreSet, StoreGet } from "../types";
import { getDateKey } from "@/lib/utils";

export interface UISlice {
  selectedDate: Date;
  selectedModalDate: Date | undefined;
  currentWeekStart: Date;
  showAddActivityModal: boolean;
  showDailyReflection: boolean;
  showReadingAssistant: boolean;
  showNutritionAnalyzer: boolean;
  showAIAssistant: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  preferences: UserPreferences;
  setSelectedDate: (date: Date) => void;
  setCurrentWeekStart: (date: Date) => void;
  setShowAddActivityModal: (show: boolean) => void;
  setShowDailyReflection: (show: boolean, date?: Date) => void;
  setShowReadingAssistant: (show: boolean) => void;
  setShowNutritionAnalyzer: (show: boolean, date?: Date) => void;
  setShowAIAssistant: (show: boolean) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  initializeFromDatabase: () => Promise<void>;
  refreshAllData: () => Promise<void>;
  refreshActivities: () => Promise<void>;
}

export const createUISlice = (set: StoreSet, get: StoreGet): UISlice => ({
  selectedDate: new Date(),
  selectedModalDate: undefined,
  currentWeekStart: new Date(),
  showAddActivityModal: false,
  showDailyReflection: false,
  showReadingAssistant: false,
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
  setShowReadingAssistant: (show) => set({ showReadingAssistant: show }),
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

  initializeFromDatabase: async () => {
    try {
      set({ isLoading: true });

      const todayStr = getDateKey(new Date());
      const thirtyDaysLater = getDateKey(new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ));

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
        api.activities.getAll().catch(() => ({ data: [] })),
        api.nutrition.getAnalyses().catch(() => ({ data: [] })),
        api.bodyAnalysis.getAll().catch(() => ({ data: [] })),
        api.notes.getAll().catch(() => ({ data: [] })),
        api.physicalActivity.getAll().catch(() => ({ data: [] })),
        api.nutrition.getAllWeightEntries().catch(() => ({ data: [] })),
        api.skinFold.getRecords().catch(() => ({ data: [] })),
        api.tasks.getAll().catch(() => ({ data: [] })),
        api.calendar.getEvents(todayStr, thirtyDaysLater).catch(() => ({ data: [] })),
      ]);

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

      toast.success("Datos cargados", "Tu información se ha sincronizado");
    } catch (error) {
      console.error("Error inicializando desde API:", error);
      set({ isLoading: false, isInitialized: true });
      toast.error(
        "Error de sincronización",
        "No se pudieron cargar todos los datos. Trabajando en modo local."
      );
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
