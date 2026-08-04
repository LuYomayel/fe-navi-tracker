import type { HydrationLog, HydrationGoal } from "@/types";
import { toast } from "@/lib/toast-helper";
import { api } from "@/lib/api-client";
import type { StoreSet, StoreGet } from "../types";
import { getDateKey } from "@/lib/utils";

export interface HydrationSlice {
  todayHydration: HydrationLog | null;
  hydrationGoal: HydrationGoal;
  fetchTodayHydration: (date?: string) => Promise<void>;
  adjustHydration: (date: string, delta: number) => Promise<void>;
  setHydrationGoal: (goal: HydrationGoal) => Promise<void>;
  fetchHydrationGoal: () => Promise<void>;
}

// Dos taps rapidos disparan dos adjust en paralelo. Si la respuesta del
// primero llega ultima, pisa el estado con un valor viejo y el contador
// RETROCEDE. Nos quedamos solo con la respuesta del ultimo pedido.
let adjustSeq = 0;

export const createHydrationSlice = (set: StoreSet, get: StoreGet): HydrationSlice => ({
  todayHydration: null,
  hydrationGoal: { goalGlasses: 8, mlPerGlass: 250 },

  fetchTodayHydration: async (date?: string) => {
    try {
      const targetDate = date || getDateKey(new Date());
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
    const requestId = ++adjustSeq;
    try {
      const res = await api.hydration.adjust({ date, delta });
      // Llego una respuesta vieja: ya hay otro ajuste en curso, la ignoramos.
      if (requestId !== adjustSeq) return;
      if (res.data) {
        set({ todayHydration: res.data as HydrationLog });
      }
    } catch (e) {
      console.error("Error adjusting hydration:", e);
      if (requestId !== adjustSeq) return;
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
});
