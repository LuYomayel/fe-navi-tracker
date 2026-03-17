import type { Activity, DailyCompletion } from "@/types";
import { toast } from "@/lib/toast-helper";
import { api } from "@/lib/api-client";
import { XpAction } from "@/types/xp";
import type { StoreSet, StoreGet } from "../types";

const getRandomColor = () => {
  const colors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export interface ActivitiesSlice {
  activities: Activity[];
  completions: DailyCompletion[];
  addActivity: (
    activity: Omit<Activity, "id" | "createdAt" | "updatedAt" | "userId" | "user">
  ) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  duplicateActivity: (id: string) => Promise<void>;
  archiveActivity: (id: string) => Promise<void>;
  restoreActivity: (id: string) => Promise<void>;
  toggleCompletion: (activityId: string, date: Date) => Promise<void>;
  getCompletion: (activityId: string, date: Date) => boolean;
}

export const createActivitiesSlice = (set: StoreSet, get: StoreGet): ActivitiesSlice => ({
  activities: [],
  completions: [],

  addActivity: async (activity) => {
    try {
      set({ isLoading: true });

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
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("habit-created"));
        }
      }

      const newActivity = response.data as Activity;

      set((state) => ({
        activities: [...state.activities, newActivity],
        isLoading: false,
      }));

      setTimeout(() => {
        get().refreshActivities();
      }, 500);

      toast.success(
        "Hábito creado",
        `"${newActivity.name}" se ha agregado exitosamente`
      );
    } catch (error) {
      console.error("Error creando actividad:", error);
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
      console.error("Error actualizando actividad:", error);
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

      await api.activities.delete(id);

      set((state) => ({
        activities: state.activities.filter(
          (activity) => activity.id !== id
        ),
        isLoading: false,
      }));

      toast.success(
        "Hábito eliminado",
        "El hábito se ha eliminado correctamente"
      );
    } catch (error) {
      console.error("Error eliminando actividad:", error);
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

    try {
      const { id: _id, createdAt: _c, updatedAt: _u, completions: _comp, user: _user, userId: _uid, ...activityData } = activityToDuplicate;
      const response = await api.activities.create({
        ...activityData,
        name: `${activityToDuplicate.name} (Copia)`,
      });

      if (!response.success) {
        toast.error("Error", "No se pudo duplicar el hábito");
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
      toast.error(
        "Error",
        "No se pudo duplicar el hábito. Inténtalo de nuevo."
      );
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
      console.error("Error archivando actividad:", error);
      toast.error(
        "Error",
        "No se pudo archivar el hábito. Inténtalo de nuevo."
      );
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
      toast.error(
        "Error",
        "No se pudo restaurar el hábito. Inténtalo de nuevo."
      );
    }
  },

  toggleCompletion: async (activityId, date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;

    try {
      const response = await api.completions.toggle({
        activityId,
        date: dateKey,
      });

      const completion = response.data as DailyCompletion;
      set((state) => {
        const activitiesNew = state.activities.map((a) => {
          if (a.id !== activityId) return a;
          if (completion.completed) {
            return {
              ...a,
              completions: [...(a.completions || []), completion],
            };
          } else {
            return {
              ...a,
              completions: (a.completions || []).filter(
                (c) => !(c.activityId === activityId && c.date === dateKey)
              ),
            };
          }
        });
        return { activities: activitiesNew };
      });

      try {
        if (completion.completed) {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("habit-completed"));
            window.dispatchEvent(new Event("xp-updated"));
          }

          const stateAfter = get();
          const allDone = stateAfter.activities
            .filter((act) => !act.archived)
            .every((act) => {
              const dow = new Date(date).getDay();
              const dayIndex = (dow + 6) % 7;
              if (!act.days[dayIndex]) return true;
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
                await api.xp.addXp({
                  action: XpAction.DAY_COMPLETE,
                  xpAmount: 50,
                  description: "Todos los hábitos del día completados",
                });
                localStorage.setItem(bonusKey, "true");
              } catch (error) {
                console.error("Error manejando XP/bonus:", error);
                toast.error(
                  "Error",
                  "No se pudo agregar el XP. Inténtalo de nuevo."
                );
              }

              window.dispatchEvent(new Event("day-completed"));
            }
          }
        }
      } catch (err) {
        console.error("Error manejando XP/bonus:", err);
      }
    } catch (error) {
      console.error("Error guardando completación:", error);
      toast.error(
        "Error",
        "No se pudo guardar la completación. Inténtalo de nuevo."
      );
    }
  },

  getCompletion: (activityId, date) => {
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
            completion.date === dateKey &&
            completion.completed
        ) || false
    );
  },
});
