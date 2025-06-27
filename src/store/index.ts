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
} from "@/types";
import { toast } from "@/lib/toast-helper";
import { api } from "@/lib/api-client";

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
      addActivity: async (activity) => {
        try {
          set({ isLoading: true });

          // 🚀 Usar API real en lugar de datos locales
          const response = await api.activities.create({
            ...activity,
            color: activity.color || getRandomColor(),
          });

          const newActivity = response.data as Activity;

          set((state) => ({
            activities: [...state.activities, newActivity],
            isLoading: false,
          }));

          toast.success(
            "Hábito creado",
            `"${newActivity.name}" se ha agregado exitosamente`
          );
        } catch (error) {
          console.error("❌ Error creando actividad:", error);
          set({ isLoading: false });
          toast.error(
            "Error",
            "No se pudo crear el hábito. Inténtalo de nuevo."
          );
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
          toast.error(
            "Error",
            "No se pudo actualizar el hábito. Inténtalo de nuevo."
          );
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
          toast.error(
            "Error",
            "No se pudo eliminar el hábito. Inténtalo de nuevo."
          );
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

        const duplicatedActivity: Activity = {
          ...activityToDuplicate,
          id: generateId(),
          name: `${activityToDuplicate.name} (Copia)`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        try {
          set((state) => ({
            activities: [...state.activities, duplicatedActivity],
          }));

          toast.success(
            "Hábito duplicado",
            `Se ha creado una copia de "${activityToDuplicate.name}"`
          );
        } catch (error) {
          console.error("❌ Error duplicando actividad:", error);
          toast.error(
            "Error",
            "No se pudo duplicar el hábito. Inténtalo de nuevo."
          );
        }
      },

      archiveActivity: async (id) => {
        try {
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
          toast.error(
            "Error",
            "No se pudo archivar el hábito. Inténtalo de nuevo."
          );
        }
      },

      restoreActivity: async (id) => {
        try {
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
          console.error("❌ Error restaurando actividad:", error);
          toast.error(
            "Error",
            "No se pudo restaurar el hábito. Inténtalo de nuevo."
          );
        }
      },

      // Completion actions
      toggleCompletion: async (activityId, date) => {
        const dateKey = date.toISOString().split("T")[0];

        try {
          // 🚀 Usar API real
          const response = await api.completions.toggle({
            activityId,
            date: dateKey,
          });

          const completion = response.data as DailyCompletion;

          set((state) => {
            const existingIndex = state.completions.findIndex(
              (c) => c.activityId === activityId && c.date === dateKey
            );

            if (completion.completed) {
              // Agregar o actualizar completación
              if (existingIndex >= 0) {
                const newCompletions = [...state.completions];
                newCompletions[existingIndex] = completion;
                return { completions: newCompletions };
              } else {
                return { completions: [...state.completions, completion] };
              }
            } else {
              // Remover completación
              return {
                completions: state.completions.filter(
                  (c) => !(c.activityId === activityId && c.date === dateKey)
                ),
              };
            }
          });

          console.log("✅ Completación guardada");
        } catch (error) {
          console.error("❌ Error guardando completación:", error);
          toast.error(
            "Error",
            "No se pudo guardar la completación. Inténtalo de nuevo."
          );
        }
      },

      // Note actions
      addOrUpdateNote: async (date, content, mood) => {
        const dateKey = date.toISOString().split("T")[0];

        const note: DailyNote = {
          id: generateId(),
          date: dateKey,
          content,
          mood: mood ? parseInt(mood) : undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        try {
          set((state) => {
            const existingIndex = state.dailyNotes.findIndex(
              (n) => n.date === dateKey
            );

            if (existingIndex >= 0) {
              const updatedNotes = [...state.dailyNotes];
              updatedNotes[existingIndex] = {
                ...updatedNotes[existingIndex],
                content,
                mood: mood ? parseInt(mood) : undefined,
                updatedAt: new Date(),
              };
              return { dailyNotes: updatedNotes };
            } else {
              return { dailyNotes: [...state.dailyNotes, note] };
            }
          });

          toast.success("Nota guardada", "Tu reflexión diaria se ha guardado");
        } catch (error) {
          console.error("❌ Error guardando nota:", error);
          toast.error(
            "Error",
            "No se pudo guardar la nota. Inténtalo de nuevo."
          );
        }
      },

      deleteNote: async (date) => {
        const dateKey = date.toISOString().split("T")[0];

        try {
          set((state) => ({
            dailyNotes: state.dailyNotes.filter(
              (note) => note.date !== dateKey
            ),
          }));

          toast.success("Nota eliminada", "La reflexión se ha eliminado");
        } catch (error) {
          console.error("❌ Error eliminando nota:", error);
          toast.error(
            "Error",
            "No se pudo eliminar la nota. Inténtalo de nuevo."
          );
        }
      },

      getNote: (date) => {
        const dateKey = date.toISOString().split("T")[0];
        const state = get();
        return state.dailyNotes.find((note) => note.date === dateKey);
      },

      getCompletion: (activityId, date) => {
        const dateKey = date.toISOString().split("T")[0];
        const state = get();
        return state.completions.some(
          (completion) =>
            completion.activityId === activityId && completion.date === dateKey
        );
      },

      addOrUpdateReflection: async (
        date,
        selectedComments,
        customComment,
        mood
      ) => {
        const dateKey = date.toISOString().split("T")[0];

        const note: DailyNote = {
          id: generateId(),
          date: dateKey,
          content: customComment,
          mood: mood,
          predefinedComments: selectedComments.map((c) => c.id),
          customComment,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        try {
          set((state) => {
            const existingIndex = state.dailyNotes.findIndex(
              (n) => n.date === dateKey
            );

            if (existingIndex >= 0) {
              const updatedNotes = [...state.dailyNotes];
              updatedNotes[existingIndex] = {
                ...updatedNotes[existingIndex],
                content: customComment,
                mood: mood,
                predefinedComments: selectedComments.map((c) => c.id),
                customComment,
                updatedAt: new Date(),
              };
              return { dailyNotes: updatedNotes };
            } else {
              return { dailyNotes: [...state.dailyNotes, note] };
            }
          });

          toast.success(
            "Reflexión guardada",
            "Tu reflexión diaria se ha actualizado"
          );
        } catch (error) {
          console.error("❌ Error guardando reflexión:", error);
          toast.error(
            "Error",
            "No se pudo guardar la reflexión. Inténtalo de nuevo."
          );
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
          const newAnalysis = response.data as NutritionAnalysis;

          set((state) => ({
            nutritionAnalyses: [...state.nutritionAnalyses, newAnalysis],
            isLoading: false,
          }));

          toast.success(
            "Análisis nutricional guardado",
            "Se ha registrado tu comida exitosamente"
          );
        } catch (error) {
          console.error("❌ Error guardando análisis nutricional:", error);
          set({ isLoading: false });
          toast.error(
            "Error",
            "No se pudo guardar el análisis nutricional. Inténtalo de nuevo."
          );
        }
      },

      deleteNutritionAnalysis: async (id) => {
        try {
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
          console.error("❌ Error eliminando análisis nutricional:", error);
          toast.error(
            "Error",
            "No se pudo eliminar el análisis. Inténtalo de nuevo."
          );
        }
      },

      updateNutritionAnalysis: async (id, updates) => {
        try {
          set((state) => ({
            nutritionAnalyses: state.nutritionAnalyses.map((analysis) =>
              analysis.id === id
                ? { ...analysis, ...updates, updatedAt: new Date() }
                : analysis
            ),
          }));

          toast.success("Análisis actualizado", "Los cambios se han guardado");
        } catch (error) {
          console.error("❌ Error actualizando análisis nutricional:", error);
          toast.error(
            "Error",
            "No se pudo actualizar el análisis. Inténtalo de nuevo."
          );
        }
      },

      // Body analysis actions
      addBodyAnalysis: async (analysis) => {
        try {
          set({ isLoading: true });

          // 🚀 Crear el análisis directamente en el store (modo offline)
          // El API requiere imagen, pero nosotros guardamos el análisis procesado
          const newAnalysis: BodyAnalysis = {
            id: generateId(),
            ...analysis,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => ({
            bodyAnalyses: [...state.bodyAnalyses, newAnalysis],
            isLoading: false,
          }));

          toast.success(
            "Análisis corporal guardado",
            "Se ha registrado tu análisis exitosamente"
          );
        } catch (error) {
          console.error("❌ Error guardando análisis corporal:", error);
          set({ isLoading: false });
          toast.error(
            "Error",
            "No se pudo guardar el análisis corporal. Inténtalo de nuevo."
          );
        }
      },

      deleteBodyAnalysis: async (id) => {
        try {
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
          toast.error(
            "Error",
            "No se pudo eliminar el análisis. Inténtalo de nuevo."
          );
        }
      },

      // Skin fold actions
      addSkinFoldRecord: async (record) => {
        try {
          const newRecord: SkinFoldRecord = {
            ...record,
            id: generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            skinFoldRecords: [...state.skinFoldRecords, newRecord],
          }));

          toast.success(
            "Pliegues guardados",
            "Se han registrado tus mediciones"
          );
        } catch (error) {
          console.error("❌ Error guardando pliegues cutáneos:", error);
          toast.error(
            "Error",
            "No se pudieron guardar los pliegues. Inténtalo de nuevo."
          );
        }
      },

      updateSkinFoldRecord: async (id, updates) => {
        try {
          set((state) => ({
            skinFoldRecords: state.skinFoldRecords.map((record) =>
              record.id === id
                ? { ...record, ...updates, updatedAt: new Date().toISOString() }
                : record
            ),
          }));

          toast.success("Pliegues actualizados", "Los cambios se han guardado");
        } catch (error) {
          console.error("❌ Error actualizando pliegues cutáneos:", error);
          toast.error(
            "Error",
            "No se pudieron actualizar los pliegues. Inténtalo de nuevo."
          );
        }
      },

      deleteSkinFoldRecord: async (id) => {
        try {
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
          console.error("❌ Error eliminando pliegues cutáneos:", error);
          toast.error(
            "Error",
            "No se pudo eliminar el registro. Inténtalo de nuevo."
          );
        }
      },

      // Chat actions
      addChatMessage: async (role, content) => {
        try {
          const message = {
            id: generateId(),
            role,
            content,
            timestamp: new Date(),
          };

          set((state) => ({
            chatHistory: [...state.chatHistory, message],
          }));

          if (role === "user") {
            toast.success(
              "Mensaje enviado",
              "Tu consulta se ha enviado al asistente"
            );
          }
        } catch (error) {
          console.error("❌ Error enviando mensaje:", error);
          toast.error(
            "Error",
            "No se pudo enviar el mensaje. Inténtalo de nuevo."
          );
        }
      },

      clearChatHistory: async () => {
        try {
          set({ chatHistory: [] });
          toast.success(
            "Historial limpiado",
            "Se ha eliminado el historial del chat"
          );
        } catch (error) {
          console.error("❌ Error limpiando historial:", error);
          toast.error(
            "Error",
            "No se pudo limpiar el historial. Inténtalo de nuevo."
          );
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

          // 🚀 Cargar datos reales desde la API
          const [activitiesResponse, nutritionResponse, bodyAnalysesResponse] =
            await Promise.all([
              api.activities.getAll().catch(() => ({ data: [] })),
              api.nutrition.getAnalyses().catch(() => ({ data: [] })),
              api.bodyAnalysis.getAll().catch(() => ({ data: [] })),
            ]);

          set({
            activities: (activitiesResponse.data as Activity[]) || [],
            nutritionAnalyses:
              (nutritionResponse.data as NutritionAnalysis[]) || [],
            bodyAnalyses: (bodyAnalysesResponse.data as BodyAnalysis[]) || [],
            // bodyAnalyses se mantienen desde localStorage por ahora
            isInitialized: true,
            isLoading: false,
          });

          toast.success("Datos cargados", "Tu información se ha sincronizado");
        } catch (error) {
          console.error("❌ Error inicializando desde API:", error);
          set({ isLoading: false, isInitialized: true });
          toast.error(
            "Error de sincronización",
            "No se pudieron cargar todos los datos. Trabajando en modo local."
          );
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
