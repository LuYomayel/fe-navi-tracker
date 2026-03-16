import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Activity,
  DailyCompletion,
  DailyNote,
  UserPreferences,
  NutritionAnalysis,
  BodyAnalysis,
  SkinFoldRecord,
  PhysicalActivity,
  WeightEntry,
  CreateWeightEntryDto,
  Task,
  CalendarEvent,
  GoogleCalendarStatus,
  DayScore,
  MonthlyStats,
  WinStreak,
  HydrationLog,
  HydrationGoal,
  ShoppingList,
  ShoppingItem,
} from "@/types";
import { toast } from "@/lib/toast-helper";
import { api } from "@/lib/api-client";
import { XpAction } from "@/types/xp";
import { getErrorMessage } from "@/lib/api-error";

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 15);
const getRandomColor = () => {
  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#EC4899",
    "#6366F1",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Función para extraer patrones de las notas diarias
const extractPatternsFromNote = (note: DailyNote): string[] => {
  const patterns: string[] = [];
  const content = note.content?.toLowerCase() || "";
  const customComment = note.customComment?.toLowerCase() || "";
  const allText = `${content} ${customComment}`;

  // Detectar patrones básicos basados en palabras clave
  if (
    allText.includes("sueño") ||
    allText.includes("dormir") ||
    allText.includes("cansado")
  ) {
    patterns.push("sleep_issues");
  }

  if (
    allText.includes("estrés") ||
    allText.includes("ansiedad") ||
    allText.includes("nervioso")
  ) {
    patterns.push("stress_pattern");
  }

  if (
    allText.includes("desorganizado") ||
    allText.includes("caos") ||
    allText.includes("perdido")
  ) {
    patterns.push("organization_issues");
  }

  if (
    allText.includes("motivado") ||
    allText.includes("energía") ||
    allText.includes("positivo")
  ) {
    patterns.push("positive_mood");
  }

  return patterns;
};

interface NaviTrackerState {
  // Core data
  activities: Activity[];
  completions: DailyCompletion[];
  dailyNotes: DailyNote[];
  preferences: UserPreferences;
  nutritionAnalyses: NutritionAnalysis[];
  bodyAnalyses: BodyAnalysis[];
  skinFoldRecords: SkinFoldRecord[];
  physicalActivities: PhysicalActivity[];
  weightEntries: WeightEntry[];
  chatHistory: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;

  // UI state
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

  // Actions
  addActivity: (
    activity: Omit<Activity, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  duplicateActivity: (id: string) => Promise<void>;
  archiveActivity: (id: string) => Promise<void>;
  restoreActivity: (id: string) => Promise<void>;
  toggleCompletion: (activityId: string, date: Date) => Promise<void>;
  addOrUpdateNote: (
    date: Date,
    content: string,
    mood?: string
  ) => Promise<void>;
  deleteNote: (date: Date) => Promise<void>;
  getNote: (date: Date) => DailyNote | undefined;
  getCompletion: (activityId: string, date: Date) => boolean;
  addOrUpdateReflection: (
    date: Date,
    selectedComments: Array<{ id: string; text: string }>,
    customComment: string,
    mood: number
  ) => Promise<void>;
  getActiveSuggestions: () => Array<{
    id: string;
    title: string;
    description: string;
    actions?: Array<{ label: string }>;
  }>;
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
  addChatMessage: (
    role: "user" | "assistant",
    content: string
  ) => Promise<void>;
  clearChatHistory: () => Promise<void>;
  getRecentAnalysis: (days: number) => Array<{
    id: string;
    date: string;
    detectedPatterns: string[];
  }>;
  setSelectedDate: (date: Date) => void;
  setCurrentWeekStart: (date: Date) => void;
  setShowAddActivityModal: (show: boolean) => void;
  setShowDailyReflection: (show: boolean, date?: Date) => void;
  setShowReadingAssistant: (show: boolean) => void;
  setShowNutritionAnalyzer: (show: boolean, date?: Date) => void;
  setShowAIAssistant: (show: boolean) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  initializeFromDatabase: () => Promise<void>;
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
  // Weight actions
  addWeightEntry: (entry: CreateWeightEntryDto) => Promise<void>;
  deleteWeightEntry: (id: string) => Promise<void>;
  getAllWeightEntries: () => Promise<void>;
  // Funciones de refrescar datos
  refreshAllData: () => Promise<void>;
  refreshActivities: () => Promise<void>;
  refreshNutritionData: () => Promise<void>;
  refreshPhysicalActivities: () => Promise<void>;
  refreshWeightEntries: () => Promise<void>;
  loadNutritionGoals: () => Promise<void>;

  // Tasks
  tasks: Task[];
  tasksLoading: boolean;
  fetchTasks: (params?: {
    date?: string;
    status?: string;
    category?: string;
    from?: string;
    to?: string;
  }) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  reorderTasks: (taskIds: string[]) => Promise<void>;

  // Calendar Events
  calendarEvents: CalendarEvent[];
  calendarEventsLoading: boolean;
  fetchCalendarEvents: (from: string, to: string) => Promise<void>;
  createCalendarEvent: (data: Partial<CalendarEvent>) => Promise<void>;
  updateCalendarEvent: (
    id: string,
    data: Partial<CalendarEvent>
  ) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;

  // Google Calendar
  googleCalendarStatus: GoogleCalendarStatus | null;
  fetchGoogleCalendarStatus: () => Promise<void>;
  connectGoogleCalendar: () => Promise<void>;
  disconnectGoogleCalendar: () => Promise<void>;
  syncGoogleCalendar: () => Promise<void>;

  // Day Score
  dayScores: DayScore[];
  dayScoresLoading: boolean;
  currentDayScore: DayScore | null;
  winStreak: WinStreak | null;
  monthlyStats: MonthlyStats | null;
  fetchDayScore: (date: string) => Promise<void>;
  fetchDayScoreRange: (from: string, to: string) => Promise<void>;
  fetchWinStreak: () => Promise<void>;
  fetchMonthlyStats: (month: string) => Promise<void>;
  recalculateDayScore: (date: string) => Promise<void>;

  // Hydration
  todayHydration: HydrationLog | null;
  hydrationGoal: HydrationGoal;
  fetchTodayHydration: (date?: string) => Promise<void>;
  adjustHydration: (date: string, delta: number) => Promise<void>;
  setHydrationGoal: (goal: HydrationGoal) => Promise<void>;
  fetchHydrationGoal: () => Promise<void>;

  // Shopping List
  shoppingLists: ShoppingList[];
  activeShoppingList: ShoppingList | null;
  shoppingListLoading: boolean;
  fetchShoppingLists: () => Promise<void>;
  fetchShoppingListById: (id: string) => Promise<void>;
  createShoppingList: (name: string, notes?: string) => Promise<ShoppingList | null>;
  generateShoppingList: (mealPrepId?: string, name?: string) => Promise<ShoppingList | null>;
  archiveShoppingList: (id: string) => Promise<void>;
  deleteShoppingList: (id: string) => Promise<void>;
  addShoppingItem: (listId: string, data: Partial<ShoppingItem>) => Promise<void>;
  toggleShoppingItem: (listId: string, itemId: string) => Promise<void>;
  updateShoppingItem: (listId: string, itemId: string, data: Partial<ShoppingItem>) => Promise<void>;
  deleteShoppingItem: (listId: string, itemId: string) => Promise<void>;
  uncheckAllShoppingItems: (listId: string) => Promise<void>;
}

export const useNaviTrackerStore = create<NaviTrackerState>()(
  persist(
    (set, get) => ({
      // Initial state
      activities: [],
      completions: [],
      dailyNotes: [],
      nutritionAnalyses: [],
      bodyAnalyses: [],
      skinFoldRecords: [],
      physicalActivities: [],
      weightEntries: [],
      chatHistory: [],
      preferences: {
        darkMode: false,
        weekStartsOnMonday: true,
        notifications: true,
        language: "es",
      },
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

      // Activity actions
      getActivities: async () => {
        const response = await api.activities.getAll();

        const activities = response.data as Activity[];
        set({ activities });
      },
      addActivity: async (activity) => {
        try {
          set({ isLoading: true });

          // 🚀 Usar API real en lugar de datos locales
          const response = await api.activities.create({
            ...activity,
            color: activity.color || getRandomColor(),
          });
          if (!response.success) {
            toast.error("Error", response.message);
            return;
          }
          if (
            activity.description &&
            activity.description === "Detectado por IA"
          ) {
            const responseEXP = await api.xp.addXp({
              action: XpAction.HABIT_CREATED_BY_AI,
              xpAmount: 70,
              description: `Hábito creado por IA: ${activity.name}`,
            });
            if (!responseEXP.success) {
              toast.error("Error", responseEXP.message);
              return;
            }
            // Emitir evento para que Navi reaccione
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("habit-created-by-ai"));
            }
          } else {
            const responseEXP = await api.xp.addXp({
              action: XpAction.HABIT_CREATED,
              xpAmount: 30,
              description: `Hábito creado: ${activity.name}`,
            });
            if (!responseEXP.success) {
              toast.error("Error", responseEXP.message);
              return;
            }
            // Emitir evento para que Navi reaccione
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("habit-created"));
            }
          }

          const newActivity = response.data as Activity;

          set((state) => ({
            activities: [...state.activities, newActivity],
            isLoading: false,
          }));

          // Refrescar actividades para asegurar sincronización
          setTimeout(() => {
            get().refreshActivities();
          }, 500);

          toast.success(
            "Hábito creado",
            `"${newActivity.name}" se ha agregado exitosamente`
          );
        } catch (error) {
          console.error("❌ Error creando actividad:", error);
          set({ isLoading: false });
          toast.error("Error", getErrorMessage(error));
        }
      },

      updateActivity: async (id, updates) => {
        try {
          set({ isLoading: true });

          // 🚀 Usar API real
          const response = await api.activities.update(id, updates);
          const updatedActivity = response.data as Activity;

          set((state) => ({
            activities: state.activities.map((activity) =>
              activity.id === id ? updatedActivity : activity
            ),
            isLoading: false,
          }));

          toast.success(
            "Hábito actualizado",
            "Los cambios se han guardado correctamente"
          );
        } catch (error) {
          console.error("❌ Error actualizando actividad:", error);
          set({ isLoading: false });
          toast.error("Error", getErrorMessage(error));
        }
      },

      deleteActivity: async (id) => {
        try {
          set({ isLoading: true });

          // 🚀 Usar API real
          await api.activities.delete(id);

          set((state) => ({
            activities: state.activities.filter(
              (activity) => activity.id !== id
            ),
            completions: state.completions.filter(
              (completion) => completion.activityId !== id
            ),
            isLoading: false,
          }));

          toast.success(
            "Hábito eliminado",
            "El hábito se ha eliminado correctamente"
          );
        } catch (error) {
          console.error("❌ Error eliminando actividad:", error);
          set({ isLoading: false });
          toast.error("Error", getErrorMessage(error));
        }
      },

      duplicateActivity: async (id) => {
        const state = get();
        const activityToDuplicate = state.activities.find(
          (activity) => activity.id === id
        );

        if (!activityToDuplicate) {
          toast.error("Error", "No se encontró el hábito a duplicar");
          return;
        }

        try {
          const { id: _id, createdAt: _c, updatedAt: _u, completions: _comp, user: _user, userId: _uid, ...activityData } = activityToDuplicate;
          const response = await api.activities.create({
            ...activityData,
            name: `${activityToDuplicate.name} (Copia)`,
          });

          if (!response.success) {
            toast.error("Error", response.message);
            return;
          }

          const newActivity = response.data as Activity;
          set((state) => ({
            activities: [...state.activities, newActivity],
          }));

          toast.success(
            "Hábito duplicado",
            `Se ha creado una copia de "${activityToDuplicate.name}"`
          );
        } catch (error) {
          console.error("Error duplicando actividad:", error);
          toast.error("Error", getErrorMessage(error));
        }
      },

      archiveActivity: async (id) => {
        try {
          const response = await api.activities.archive(id);
          if (!response.success) {
            toast.error("Error", response.message);
            return;
          }
          set((state) => ({
            activities: state.activities.map((activity) =>
              activity.id === id
                ? {
                    ...activity,
                    archived: true,
                    archivedAt: new Date(),
                    updatedAt: new Date(),
                  }
                : activity
            ),
          }));

          toast.success(
            "Hábito archivado",
            "El hábito se ha archivado. Puedes restaurarlo cuando quieras"
          );
        } catch (error) {
          console.error("❌ Error archivando actividad:", error);
          toast.error("Error", getErrorMessage(error));
        }
      },

      restoreActivity: async (id) => {
        try {
          const response = await api.activities.restore(id);
          if (!response.success) {
            toast.error("Error", response.message);
            return;
          }
          set((state) => ({
            activities: state.activities.map((activity) =>
              activity.id === id
                ? {
                    ...activity,
                    archived: false,
                    archivedAt: undefined,
                    updatedAt: new Date(),
                  }
                : activity
            ),
          }));

          toast.success(
            "Hábito restaurado",
            "El hábito se ha restaurado exitosamente"
          );
        } catch (error) {
          console.error("Error restaurando actividad:", error);
          toast.error("Error", getErrorMessage(error));
        }
      },

      // Completion actions
      toggleCompletion: async (activityId, date) => {
        // Usar zona horaria local para consistencia
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateKey = `${year}-${month}-${day}`;

        try {
          // 🚀 Usar API real
          const response = await api.completions.toggle({
            activityId,
            date: dateKey,
          });

          const completion = response.data as DailyCompletion;
          set((state) => {
            const activity = state.activities.find((a) => a.id === activityId);
            if (completion.completed) {
              // Agregar o actualizar completación
              const activitiesNew = state.activities.map((a) =>
                a.id === activityId
                  ? {
                      ...a,
                      completions: [...(a.completions || []), completion],
                    }
                  : a
              );
              return { activities: activitiesNew };
            } else {
              // Remover completación
              return {
                completions: activity?.completions?.filter(
                  (c) => !(c.activityId === activityId && c.date === dateKey)
                ),
              };
            }
          });

          console.log("✅ Completación guardada");

          // ➕ Agregar XP por hábito completado y emitir evento global
          try {
            if (completion.completed) {
              // El backend YA agrega XP automáticamente, no necesitamos hacerlo aquí
              // Solo emitir evento para que Navi reaccione
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("habit-completed"));
                // Emitir evento para actualizar XP stats
                window.dispatchEvent(new Event("xp-updated"));
              }

              // BONUS: comprobar si todos los hábitos para hoy están completos
              const stateAfter = get();
              const allDone = stateAfter.activities
                .filter((act) => !act.archived)
                .every((act) => {
                  // Día de la semana (0 = domingo)
                  const dow = new Date(date).getDay();
                  const dayIndex = (dow + 6) % 7; // convierte domingo=6
                  if (!act.days[dayIndex]) return true; // no programado ese día
                  return act.completions?.some(
                    (c) =>
                      c.activityId === act.id &&
                      c.date === dateKey &&
                      c.completed
                  );
                });

              if (allDone) {
                const bonusKey = `day-bonus-${dateKey}`;
                if (
                  typeof window !== "undefined" &&
                  !localStorage.getItem(bonusKey)
                ) {
                  try {
                    // Otorgar bonus XP solo una vez al día
                    await api.xp.addXp({
                      action: XpAction.DAY_COMPLETE,
                      xpAmount: 50,
                      description: "Todos los hábitos del día completados",
                    });
                    localStorage.setItem(bonusKey, "true");
                  } catch (error) {
                    console.error("❌ Error manejando XP/bonus:", error);

                    toast.error("Error", getErrorMessage(error));
                  }

                  window.dispatchEvent(new Event("day-completed"));
                }
              }
            }
          } catch (err) {
            console.error("❌ Error manejando XP/bonus:", err);
          }
        } catch (error) {
          console.error("❌ Error guardando completación:", error);
          toast.error("Error", getErrorMessage(error));
        }
      },

      // Note actions
      addOrUpdateNote: async (date, content, mood) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateKey = `${year}-${month}-${day}`;

        try {
          const state = get();
          const existingNote = state.dailyNotes.find(
            (n) => n.date === dateKey
          );

          if (existingNote?.id) {
            // Update existing note via API
            const response = await api.notes.update(existingNote.id, {
              content,
              mood: mood ? parseInt(mood) : undefined,
            });

            if (!response.success) {
              toast.error("Error", response.message);
              return;
            }

            const updatedNote = response.data as DailyNote;
            set((state) => ({
              dailyNotes: state.dailyNotes.map((n) =>
                n.date === dateKey ? { ...n, ...updatedNote } : n
              ),
            }));
          } else {
            // Create new note via API
            const noteToSave = {
              date: dateKey,
              content,
              mood: mood ? parseInt(mood) : undefined,
            };

            const response = await api.notes.create(noteToSave);

            if (!response.success) {
              toast.error("Error", response.message);
              return;
            }

            const newNote = response.data as DailyNote;
            set((state) => ({
              dailyNotes: [...state.dailyNotes, newNote],
            }));
          }

          toast.success("Nota guardada", "Tu reflexión diaria se ha guardado");
        } catch (error) {
          console.error("❌ Error guardando nota:", error);
          toast.error("Error", getErrorMessage(error));
        }
      },

      deleteNote: async (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateKey = `${year}-${month}-${day}`;

        try {
          const state = get();
          const noteToDelete = state.dailyNotes.find(
            (note) => note.date === dateKey
          );

          if (noteToDelete?.id) {
            const response = await api.notes.delete(noteToDelete.id);
            if (!response.success) {
              toast.error("Error", response.message);
              return;
            }
          }

          set((state) => ({
            dailyNotes: state.dailyNotes.filter(
              (note) => note.date !== dateKey
            ),
          }));

          toast.success("Nota eliminada", "La reflexión se ha eliminado");
        } catch (error) {
          console.error("Error eliminando nota:", error);
          toast.error("Error", getErrorMessage(error));
        }
      },

      getNote: (date) => {
        // Usar zona horaria local para consistencia
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateKey = `${year}-${month}-${day}`;
        const state = get();
        return state.dailyNotes.find((note) => note.date === dateKey);
      },

      getCompletion: (activityId, date) => {
        // Usar zona horaria local para consistencia
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateKey = `${year}-${month}-${day}`;
        const state = get();
        return (
          state.activities
            .find((activity) => activity.id === activityId)
            ?.completions?.some(
              (completion) =>
                completion.activityId === activityId &&
                completion.date === dateKey
            ) || false
        ); // Asegurar que siempre retorne boolean
      },

      addOrUpdateReflection: async (
        date,
        selectedComments,
        customComment,
        mood
      ) => {
        // Usar zona horaria local para consistencia
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateKey = `${year}-${month}-${day}`;

        try {
          const noteToSave: any = {
            date: dateKey,
            content: customComment,
            mood: mood,
            predefinedComments: selectedComments.map((c: any) => c.id),
            customComment,
          };
          const response = await api.notes.create(noteToSave);

          if (!response.success) {
            toast.error("Error", response.message);
            return;
          }

          const newNote = response.data as DailyNote;
          set((state) => ({
            dailyNotes: [...state.dailyNotes, newNote],
          }));

          // Actualizar la experiencia
          const xpResponse = await api.xp.addXp({
            action: XpAction.DAILY_COMMENT,
            xpAmount: 15,
            description: "Reflexión diaria guardada",
          });
          if (!xpResponse.success) {
            toast.error("Error", xpResponse.message);
            return;
          }

          // Emitir evento para que Navi reaccione
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("daily-comment"));
          }

          toast.success(
            "Reflexión guardada",
            "Tu reflexión diaria se ha guardado"
          );
        } catch (error) {
          console.error("Error guardando reflexión:", error);
          toast.error("Error", getErrorMessage(error));
        }
      },

      getActiveSuggestions: () => {
        // Por ahora retornamos un array vacío, se puede implementar más tarde
        return [];
      },

      // Nutrition actions
      addNutritionAnalysis: async (analysis) => {
        try {
          set({ isLoading: true });

          // 🚀 Usar API real
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
          // Emitir evento para que Navi reaccione
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("nutrition-log"));
          }
          const newAnalysis = response.data as NutritionAnalysis;

          set((state) => ({
            nutritionAnalyses: [...state.nutritionAnalyses, newAnalysis],
            isLoading: false,
          }));

          // Refrescar datos nutricionales para asegurar sincronización
          setTimeout(() => {
            get().refreshNutritionData();
          }, 500);

          toast.success(
            "Análisis nutricional guardado",
            "Se ha registrado tu comida exitosamente"
          );
        } catch (error) {
          console.error("❌ Error guardando análisis nutricional:", error);
          set({ isLoading: false });
          toast.error("Error", getErrorMessage(error));
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
          toast.error("Error", getErrorMessage(error));
        }
      },

      updateNutritionAnalysis: async (id, updates) => {
        try {
          const response = await api.nutrition.updateAnalysis(id, updates);
          const updatedAnalysis = response.data;

          set((state) => ({
            nutritionAnalyses: state.nutritionAnalyses.map((analysis) =>
              analysis.id === id
                ? { ...analysis, ...updatedAnalysis }
                : analysis
            ),
          }));

          toast.success("Análisis actualizado", "Los cambios se han guardado");
        } catch (error) {
          console.error("Error actualizando análisis nutricional:", error);
          toast.error("Error", getErrorMessage(error));
        }
      },

      // Body analysis actions
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
          toast.error("Error", getErrorMessage(error));
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
          console.error("❌ Error eliminando análisis corporal:", error);
          toast.error("Error", getErrorMessage(error));
        }
      },

      // Skin fold actions
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
          toast.error("Error", getErrorMessage(error));
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
          toast.error("Error", getErrorMessage(error));
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
          toast.error("Error", getErrorMessage(error));
        }
      },

      // Chat actions
      addChatMessage: async (role, content) => {
        try {
          await api.chat.sendMessage({ role, content });

          const message = {
            id: generateId(),
            role,
            content,
            timestamp: new Date(),
          };

          set((state) => ({
            chatHistory: [...state.chatHistory, message],
          }));
        } catch (error) {
          console.error("Error enviando mensaje:", error);
          toast.error("Error", getErrorMessage(error));
        }
      },

      clearChatHistory: async () => {
        try {
          await api.chat.clearMessages();
          set({ chatHistory: [] });
          toast.success(
            "Historial limpiado",
            "Se ha eliminado el historial del chat"
          );
        } catch (error) {
          console.error("Error limpiando historial:", error);
          toast.error("Error", getErrorMessage(error));
        }
      },

      getRecentAnalysis: (days) => {
        const state = get();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return state.dailyNotes
          .filter((note) => new Date(note.date) >= cutoffDate)
          .map((note) => ({
            id: note.id,
            date: note.date,
            detectedPatterns: extractPatternsFromNote(note),
          }));
      },

      // UI state actions
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

          // Track which modules failed to load
          const failedModules: string[] = [];

          const safeLoad = <T>(
            promise: Promise<{ data: T }>,
            moduleName: string,
            fallback: T
          ): Promise<{ data: T }> =>
            promise.catch((err) => {
              console.error(`Error cargando ${moduleName}:`, err);
              failedModules.push(moduleName);
              return { data: fallback };
            });

          const todayStr = new Date().toISOString().split("T")[0];
          const thirtyDaysLater = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split("T")[0];

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
            safeLoad(api.activities.getAll(), "hábitos", []),
            safeLoad(api.nutrition.getAnalyses(), "nutrición", []),
            safeLoad(api.bodyAnalysis.getAll(), "análisis corporal", []),
            safeLoad(api.notes.getAll(), "notas", []),
            safeLoad(api.physicalActivity.getAll(), "actividad física", []),
            safeLoad(api.nutrition.getAllWeightEntries(), "peso", []),
            safeLoad(api.skinFold.getRecords(), "pliegues", []),
            safeLoad(api.tasks.getAll(), "tareas", []),
            safeLoad(api.calendar.getEvents(todayStr, thirtyDaysLater), "calendario", []),
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

          // Load nutrition goals from backend (non-blocking)
          get().loadNutritionGoals().catch(() => {});

          if (failedModules.length > 0) {
            toast.error(
              "Carga parcial",
              `No se pudieron cargar: ${failedModules.join(", ")}. El resto se sincronizó correctamente.`
            );
          } else {
            toast.success(
              "Datos cargados",
              "Tu información se ha sincronizado"
            );
          }
        } catch (error) {
          console.error("Error inicializando desde API:", error);
          set({ isLoading: false, isInitialized: true });
          toast.error(
            "Error de sincronización",
            getErrorMessage(error)
          );
        }
      },
      getAllFoodAnalysis: async () => {
        try {
          const response = await api.nutrition.getAnalyses();
          const analysis = response.data as NutritionAnalysis[];
          set({ nutritionAnalyses: analysis });
        } catch (error) {
          console.error("❌ Error cargando análisis nutricionales:", error);
        }
      },
      getAllBodyAnalysis: async () => {
        try {
          const response = await api.bodyAnalysis.getAll();
          const analysis = response.data as BodyAnalysis[];
          set({ bodyAnalyses: analysis });
        } catch (error) {
          console.error("❌ Error cargando análisis corporales:", error);
        }
      },
      getAllSkinFoldRecords: async () => {
        try {
          const response = await api.skinFold.getRecords();
          const records = response.data as SkinFoldRecord[];
          set({ skinFoldRecords: records });
        } catch (error) {
          console.error("❌ Error cargando registros de pliegues:", error);
        }
      },
      getAllPhysicalActivities: async () => {
        try {
          const response = await api.physicalActivity.getAll();
          const activities = response.data as PhysicalActivity[];
          set({ physicalActivities: activities });
        } catch (error) {
          console.error("❌ Error cargando actividades físicas:", error);
        }
      },

      getDailyCalorieBalance: (date: Date) => {
        const state = get();
        // Usar zona horaria local para consistencia
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateKey = `${year}-${month}-${day}`;

        // Calorías consumidas de comidas
        const dayNutrition = state.nutritionAnalyses.filter(
          (analysis) => analysis.date === dateKey
        );

        const caloriesConsumed = dayNutrition.reduce(
          (total, analysis) => total + (analysis.totalCalories || 0),
          0
        );

        // Calorías quemadas por actividad física
        const dayActivities = state.physicalActivities.filter(
          (activity) => activity.date === dateKey
        );

        const caloriesBurned = dayActivities.reduce(
          (total, activity) => total + (activity.activeEnergyKcal || 0),
          0
        );

        // Balance neto (positivo = superávit, negativo = déficit)
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

      // Funciones de refrescar datos
      refreshAllData: async () => {
        try {
          set({ isLoading: true });
          await Promise.all([
            get().getAllFoodAnalysis(),
            get().getAllBodyAnalysis(),
            get().getAllSkinFoldRecords(),
            get().getAllPhysicalActivities(),
          ]);

          // Recargar actividades con completaciones actualizadas
          const activitiesResponse = await api.activities.getAll();
          if (activitiesResponse.success) {
            set({ activities: activitiesResponse.data as Activity[] });
          }

          console.log("✅ Todos los datos refrescados");
        } catch (error) {
          console.error("❌ Error refrescando datos:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      refreshActivities: async () => {
        try {
          const response = await api.activities.getAll();
          if (response.success) {
            set({ activities: response.data as Activity[] });
            console.log("✅ Actividades refrescadas");
          }
        } catch (error) {
          console.error("❌ Error refrescando actividades:", error);
        }
      },

      refreshNutritionData: async () => {
        try {
          await get().getAllFoodAnalysis();
          console.log("✅ Datos nutricionales refrescados");
        } catch (error) {
          console.error("❌ Error refrescando datos nutricionales:", error);
        }
      },

      refreshPhysicalActivities: async () => {
        try {
          await get().getAllPhysicalActivities();
          console.log("✅ Actividades físicas refrescadas");
        } catch (error) {
          console.error("❌ Error refrescando actividades físicas:", error);
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
            console.log("✅ Objetivos nutricionales cargados desde API:", goals);
          }
        } catch (error) {
          console.error("❌ Error cargando objetivos nutricionales:", error);
        }
      },

      // Weight actions - entry already comes from API (WeightTracker calls the endpoint)
      addWeightEntry: async (entry: CreateWeightEntryDto) => {
        try {
          set((state) => ({
            weightEntries: [entry as unknown as WeightEntry, ...state.weightEntries].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
          }));
        } catch (error) {
          console.error("Error agregando peso al state:", error);
          toast.error("Error", getErrorMessage(error));
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
          console.error("❌ Error eliminando peso:", error);
          toast.error("Error", getErrorMessage(error));
        }
      },

      getAllWeightEntries: async () => {
        try {
          const response = await api.nutrition.getAllWeightEntries();
          const entries = response.data as WeightEntry[];
          set({ weightEntries: entries });

          console.log("✅ Registros de peso cargados");
        } catch (error) {
          console.error("❌ Error cargando registros de peso:", error);
        }
      },

      refreshWeightEntries: async () => {
        try {
          await get().getAllWeightEntries();
          console.log("✅ Actividades físicas refrescadas");
        } catch (error) {
          console.error("❌ Error refrescando actividades físicas:", error);
        }
      },

      // ==========================================
      // TASKS
      // ==========================================
      tasks: [],
      tasksLoading: false,

      fetchTasks: async (params) => {
        set({ tasksLoading: true });
        try {
          const res = await api.tasks.getAll(params);
          if (res.data) set({ tasks: res.data as Task[] });
        } catch (e) {
          console.error("Error fetching tasks:", e);
        }
        set({ tasksLoading: false });
      },

      createTask: async (data) => {
        try {
          const res = await api.tasks.create(data);
          if (res.data) {
            set((state) => ({
              tasks: [...state.tasks, res.data as Task],
            }));
            toast.success("Tarea creada", data.title || "Nueva tarea");
          }
        } catch (error) {
          toast.error("Error", getErrorMessage(error));
        }
      },

      updateTask: async (id, data) => {
        try {
          const res = await api.tasks.update(id, data);
          if (res.data) {
            set((state) => ({
              tasks: state.tasks.map((t) =>
                t.id === id ? (res.data as Task) : t
              ),
            }));
          }
        } catch (error) {
          toast.error("Error", getErrorMessage(error));
        }
      },

      deleteTask: async (id) => {
        try {
          await api.tasks.delete(id);
          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
          }));
          toast.success("Tarea eliminada");
        } catch (error) {
          toast.error("Error", getErrorMessage(error));
        }
      },

      toggleTask: async (id) => {
        // Optimistic update
        const prevTasks = get().tasks;
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  status: (!t.completed ? "completed" : "pending") as Task["status"],
                }
              : t
          ),
        }));
        try {
          const res = await api.tasks.toggle(id);
          if (res.data) {
            const task = res.data as Task;
            set((state) => ({
              tasks: state.tasks.map((t) => (t.id === id ? task : t)),
            }));
            if (task.completed) {
              toast.success("Tarea completada! +XP");
              window.dispatchEvent(new CustomEvent("xp-updated"));
            }
          }
        } catch {
          // Revert optimistic update
          set({ tasks: prevTasks });
        }
      },

      reorderTasks: async (taskIds) => {
        const prevTasks = get().tasks;
        // Optimistic: reorder locally
        set((state) => {
          const taskMap = new Map(state.tasks.map((t) => [t.id, t]));
          const reordered = taskIds
            .map((id, index) => {
              const task = taskMap.get(id);
              return task ? { ...task, order: index } : null;
            })
            .filter(Boolean) as Task[];
          const others = state.tasks.filter((t) => !taskIds.includes(t.id));
          return { tasks: [...reordered, ...others] };
        });
        try {
          await api.tasks.reorder(taskIds);
        } catch (e) {
          console.error("Error reordering tasks:", e);
          set({ tasks: prevTasks });
        }
      },

      // ==========================================
      // CALENDAR EVENTS
      // ==========================================
      calendarEvents: [],
      calendarEventsLoading: false,

      fetchCalendarEvents: async (from, to) => {
        set({ calendarEventsLoading: true });
        try {
          const res = await api.calendar.getEvents(from, to);
          if (res.data)
            set({ calendarEvents: res.data as CalendarEvent[] });
        } catch (e) {
          console.error("Error fetching calendar events:", e);
        }
        set({ calendarEventsLoading: false });
      },

      createCalendarEvent: async (data) => {
        try {
          const res = await api.calendar.createEvent(data);
          if (res.data) {
            set((state) => ({
              calendarEvents: [
                ...state.calendarEvents,
                res.data as CalendarEvent,
              ],
            }));
            toast.success("Evento creado");
          }
        } catch (error) {
          toast.error("Error", getErrorMessage(error));
        }
      },

      updateCalendarEvent: async (id, data) => {
        try {
          const res = await api.calendar.updateEvent(id, data);
          if (res.data) {
            set((state) => ({
              calendarEvents: state.calendarEvents.map((e) =>
                e.id === id ? (res.data as CalendarEvent) : e
              ),
            }));
          }
        } catch (error) {
          toast.error("Error", getErrorMessage(error));
        }
      },

      deleteCalendarEvent: async (id) => {
        try {
          await api.calendar.deleteEvent(id);
          set((state) => ({
            calendarEvents: state.calendarEvents.filter((e) => e.id !== id),
          }));
          toast.success("Evento eliminado");
        } catch (error) {
          toast.error("Error", getErrorMessage(error));
        }
      },

      // ==========================================
      // GOOGLE CALENDAR
      // ==========================================
      googleCalendarStatus: null,

      fetchGoogleCalendarStatus: async () => {
        try {
          const res = await api.calendar.google.getStatus();
          if (res.data)
            set({
              googleCalendarStatus: res.data as GoogleCalendarStatus,
            });
        } catch (e) {
          console.error("Error fetching Google Calendar status:", e);
        }
      },

      connectGoogleCalendar: async () => {
        try {
          const res = await api.calendar.google.getAuthUrl();
          if (res.data?.url) window.location.href = res.data.url;
        } catch (error) {
          toast.error("Error", getErrorMessage(error));
        }
      },

      disconnectGoogleCalendar: async () => {
        try {
          await api.calendar.google.disconnect();
          set({ googleCalendarStatus: { connected: false, syncEnabled: false } });
          toast.success("Google Calendar desconectado");
        } catch (error) {
          toast.error("Error", getErrorMessage(error));
        }
      },

      syncGoogleCalendar: async () => {
        try {
          await api.calendar.google.sync();
          toast.success("Google Calendar sincronizado");
          // Re-fetch events for current range
          const today = new Date().toISOString().split("T")[0];
          const thirtyDaysLater = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split("T")[0];
          get().fetchCalendarEvents(today, thirtyDaysLater);
        } catch (error) {
          toast.error("Error", getErrorMessage(error));
        }
      },

      // ==========================================
      // DAY SCORE
      // ==========================================
      dayScores: [],
      dayScoresLoading: false,
      currentDayScore: null,
      winStreak: null,
      monthlyStats: null,

      fetchDayScore: async (date) => {
        set({ currentDayScore: null });
        try {
          const res = await api.dayScore.getByDate(date);
          if (res.data)
            set({ currentDayScore: res.data as DayScore });
        } catch (e) {
          console.error("Error fetching day score:", e);
        }
      },

      fetchDayScoreRange: async (from, to) => {
        set({ dayScoresLoading: true, dayScores: [] });
        try {
          const res = await api.dayScore.getRange(from, to);
          if (res.data) set({ dayScores: res.data as DayScore[] });
        } catch (e) {
          console.error("Error fetching day score range:", e);
          set({ dayScores: [] });
        }
        set({ dayScoresLoading: false });
      },

      fetchWinStreak: async () => {
        try {
          const res = await api.dayScore.getWinStreak();
          if (res.data) set({ winStreak: res.data as WinStreak });
        } catch (e) {
          console.error("Error fetching win streak:", e);
        }
      },

      fetchMonthlyStats: async (month) => {
        try {
          const res = await api.dayScore.getMonthlyStats(month);
          if (res.data)
            set({ monthlyStats: res.data as MonthlyStats });
        } catch (e) {
          console.error("Error fetching monthly stats:", e);
        }
      },

      recalculateDayScore: async (date) => {
        try {
          const res = await api.dayScore.recalculate(date);
          if (res.data) {
            const score = res.data as DayScore;
            set((state) => ({
              dayScores: state.dayScores.map((d) =>
                d.date === date ? score : d
              ),
              currentDayScore:
                state.currentDayScore?.date === date
                  ? score
                  : state.currentDayScore,
            }));
          }
        } catch (e) {
          console.error("Error recalculating day score:", e);
        }
      },

      // ==========================================
      // HYDRATION
      // ==========================================
      todayHydration: null,
      hydrationGoal: { goalGlasses: 8, mlPerGlass: 250 },

      fetchTodayHydration: async (date?: string) => {
        try {
          const targetDate = date || new Date().toISOString().split("T")[0];
          const res = await api.hydration.getByDate(targetDate);
          if (res.data) {
            set({ todayHydration: res.data as HydrationLog });
          }
        } catch (e) {
          console.error("Error fetching hydration:", e);
        }
      },

      adjustHydration: async (date, delta) => {
        const prev = get().todayHydration;
        const goal = get().hydrationGoal;
        // Optimistic update
        const currentGlasses = prev?.glassesConsumed ?? 0;
        const newGlasses = Math.max(0, Math.min(30, currentGlasses + delta));
        set({
          todayHydration: {
            ...(prev || { userId: "", date }),
            date,
            glassesConsumed: newGlasses,
            mlConsumed: newGlasses * goal.mlPerGlass,
          } as HydrationLog,
        });
        try {
          const res = await api.hydration.adjust({ date, delta });
          if (res.data) {
            set({ todayHydration: res.data as HydrationLog });
          }
        } catch (e) {
          console.error("Error adjusting hydration:", e);
          set({ todayHydration: prev });
          toast.error("Error al actualizar hidratacion");
        }
      },

      setHydrationGoal: async (goal) => {
        try {
          await api.hydration.setGoal(goal);
          set({ hydrationGoal: goal });
          toast.success("Meta de hidratacion actualizada");
        } catch (e) {
          console.error("Error setting hydration goal:", e);
          toast.error("Error al actualizar meta");
        }
      },

      fetchHydrationGoal: async () => {
        try {
          const res = await api.hydration.getGoal();
          if (res.data) {
            set({ hydrationGoal: res.data as HydrationGoal });
          }
        } catch (e) {
          console.error("Error fetching hydration goal:", e);
        }
      },

      // ==========================================
      // SHOPPING LIST
      // ==========================================
      shoppingLists: [],
      activeShoppingList: null,
      shoppingListLoading: false,

      fetchShoppingLists: async () => {
        try {
          const res = await api.shoppingList.getAll();
          if (res.data) {
            set({ shoppingLists: res.data as ShoppingList[] });
          }
        } catch (e) {
          console.error("Error fetching shopping lists:", e);
        }
      },

      fetchShoppingListById: async (id) => {
        try {
          set({ shoppingListLoading: true });
          const res = await api.shoppingList.getById(id);
          if (res.data) {
            set({ activeShoppingList: res.data as ShoppingList });
          }
        } catch (e) {
          console.error("Error fetching shopping list:", e);
        } finally {
          set({ shoppingListLoading: false });
        }
      },

      createShoppingList: async (name, notes) => {
        try {
          const res = await api.shoppingList.create({ name, notes });
          if (res.data) {
            const list = res.data as ShoppingList;
            set((state) => ({
              shoppingLists: [list, ...state.shoppingLists],
            }));
            toast.success("Lista creada");
            return list;
          }
          return null;
        } catch (e) {
          console.error("Error creating shopping list:", e);
          toast.error("Error al crear lista");
          return null;
        }
      },

      generateShoppingList: async (mealPrepId, name) => {
        try {
          set({ shoppingListLoading: true });
          const res = await api.shoppingList.generate({ mealPrepId, name });
          if (res.data) {
            const list = res.data as ShoppingList;
            set((state) => ({
              shoppingLists: [list, ...state.shoppingLists],
              activeShoppingList: list,
            }));
            toast.success("Lista de compras generada con IA");
            return list;
          }
          return null;
        } catch (e) {
          console.error("Error generating shopping list:", e);
          toast.error("Error al generar lista de compras");
          return null;
        } finally {
          set({ shoppingListLoading: false });
        }
      },

      archiveShoppingList: async (id) => {
        try {
          await api.shoppingList.update(id, { status: "archived" });
          set((state) => ({
            shoppingLists: state.shoppingLists.map((l) =>
              l.id === id ? { ...l, status: "archived" as const } : l
            ),
          }));
          toast.success("Lista archivada");
        } catch (e) {
          console.error("Error archiving shopping list:", e);
        }
      },

      deleteShoppingList: async (id) => {
        try {
          await api.shoppingList.delete(id);
          set((state) => ({
            shoppingLists: state.shoppingLists.filter((l) => l.id !== id),
            activeShoppingList:
              state.activeShoppingList?.id === id
                ? null
                : state.activeShoppingList,
          }));
          toast.success("Lista eliminada");
        } catch (e) {
          console.error("Error deleting shopping list:", e);
        }
      },

      addShoppingItem: async (listId, data) => {
        try {
          const res = await api.shoppingList.addItem(listId, data);
          if (res.data) {
            const item = res.data as ShoppingItem;
            set((state) => {
              if (state.activeShoppingList?.id !== listId) return state;
              return {
                activeShoppingList: {
                  ...state.activeShoppingList,
                  items: [...(state.activeShoppingList.items || []), item],
                },
              };
            });
          }
        } catch (e) {
          console.error("Error adding item:", e);
          toast.error("Error al agregar item");
        }
      },

      toggleShoppingItem: async (listId, itemId) => {
        const list = get().activeShoppingList;
        if (!list || list.id !== listId) return;

        const item = list.items?.find((i) => i.id === itemId);
        if (!item) return;

        // Optimistic
        set((state) => {
          if (state.activeShoppingList?.id !== listId) return state;
          return {
            activeShoppingList: {
              ...state.activeShoppingList,
              items: state.activeShoppingList.items?.map((i) =>
                i.id === itemId ? { ...i, checked: !i.checked } : i
              ),
            },
          };
        });

        try {
          await api.shoppingList.updateItem(listId, itemId, {
            checked: !item.checked,
          } as any);
        } catch (e) {
          console.error("Error toggling item:", e);
          // Revert
          set((state) => {
            if (state.activeShoppingList?.id !== listId) return state;
            return {
              activeShoppingList: {
                ...state.activeShoppingList,
                items: state.activeShoppingList.items?.map((i) =>
                  i.id === itemId ? { ...i, checked: item.checked } : i
                ),
              },
            };
          });
        }
      },

      updateShoppingItem: async (listId, itemId, data) => {
        try {
          const res = await api.shoppingList.updateItem(listId, itemId, data);
          if (res.data) {
            const updated = res.data as ShoppingItem;
            set((state) => {
              if (state.activeShoppingList?.id !== listId) return state;
              return {
                activeShoppingList: {
                  ...state.activeShoppingList,
                  items: state.activeShoppingList.items?.map((i) =>
                    i.id === itemId ? updated : i
                  ),
                },
              };
            });
          }
        } catch (e) {
          console.error("Error updating item:", e);
        }
      },

      deleteShoppingItem: async (listId, itemId) => {
        // Optimistic
        const list = get().activeShoppingList;
        set((state) => {
          if (state.activeShoppingList?.id !== listId) return state;
          return {
            activeShoppingList: {
              ...state.activeShoppingList,
              items: state.activeShoppingList.items?.filter(
                (i) => i.id !== itemId
              ),
            },
          };
        });

        try {
          await api.shoppingList.deleteItem(listId, itemId);
        } catch (e) {
          console.error("Error deleting item:", e);
          set({ activeShoppingList: list });
        }
      },

      uncheckAllShoppingItems: async (listId) => {
        try {
          await api.shoppingList.uncheckAll(listId);
          set((state) => {
            if (state.activeShoppingList?.id !== listId) return state;
            return {
              activeShoppingList: {
                ...state.activeShoppingList,
                items: state.activeShoppingList.items?.map((i) => ({
                  ...i,
                  checked: false,
                  checkedAt: undefined,
                })),
              },
            };
          });
        } catch (e) {
          console.error("Error unchecking all:", e);
        }
      },
    }),
    {
      name: "navi-preferences",
      // Solo guardamos preferencias de usuario; el resto viene de la API
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);
