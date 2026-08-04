/**
 * Ejecuta las acciones que se tocan en la propia notificación (sin abrir la
 * app): sumar vasos de agua, marcar que entrenó. Es el camino de menor
 * fricción que existe — un toque desde la pantalla bloqueada.
 *
 * iOS despierta la app en background para correr este handler; si el request
 * no llega a salir, la acción se guarda como pendiente y se reintenta en el
 * próximo arranque.
 */
import { isNative } from "./platform";

const PENDING_KEY = "navi:pending-notification-actions";

interface PendingAction {
  actionId: string;
  date: string;
  at: number;
}

const todayKey = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

function readPending(): PendingAction[] {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
  } catch {
    return [];
  }
}

function writePending(list: PendingAction[]): void {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(list));
  } catch {
    /* storage lleno */
  }
}

async function runAction(action: PendingAction): Promise<boolean> {
  const { api } = await import("@/lib/api-client");
  try {
    switch (action.actionId) {
      case "water_glass":
        await api.hydration.adjust({ date: action.date, delta: 1 });
        return true;
      case "water_two":
        await api.hydration.adjust({ date: action.date, delta: 2 });
        return true;
      case "workout_yes": {
        // Duración típica de handball; se puede ajustar después desde la app.
        const res = await api.physicalActivity.create({
          date: action.date,
          exerciseMinutes: 120,
          activeEnergyKcal: 1000,
          source: "quick",
          context: "Handball (calorías estimadas)",
        });
        return !!res?.success;
      }
      case "meal_usual":
        return logUsualMeal(action.date);
      case "habits_all":
        return completeTodayHabits(action.date);
      default:
        return true; // "dismiss" y desconocidas: nada que hacer
    }
  } catch {
    return false;
  }
}

/** Tipo de comida según la hora, para elegir qué plantilla repetir. */
function currentMealType(): string {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 16) return "lunch";
  if (h < 20) return "snack";
  return "dinner";
}

/**
 * Registra la comida guardada que más usa para ese momento del día. Es el
 * mismo camino que el quick-add de la app, pero disparado desde la notificación.
 */
async function logUsualMeal(date: string): Promise<boolean> {
  const { api } = await import("@/lib/api-client");
  try {
    const res = await api.savedMeals.getAll();
    const meals = (res?.data ?? []) as {
      id: string;
      name: string;
      mealType: string;
      foods: unknown[];
      totalCalories: number;
      macronutrients: unknown;
      timesUsed?: number;
    }[];
    if (!meals.length) return true; // nada que repetir: no reintentar

    const type = currentMealType();
    const pool = meals.filter((m) => m.mealType === type);
    const candidatos = pool.length ? pool : meals;
    const elegida = [...candidatos].sort(
      (a, b) => (b.timesUsed ?? 0) - (a.timesUsed ?? 0),
    )[0];

    const created = await api.nutrition.createAnalysis({
      date,
      mealType: elegida.mealType,
      foods: elegida.foods,
      totalCalories: elegida.totalCalories,
      macronutrients: elegida.macronutrients,
      aiConfidence: 1,
      savedMealId: elegida.id,
    } as never);
    if (!created?.success) return false;
    await api.savedMeals.use(elegida.id);
    return true;
  } catch {
    return false;
  }
}

/** Marca como completos todos los hábitos activos programados para hoy. */
async function completeTodayHabits(date: string): Promise<boolean> {
  const { api } = await import("@/lib/api-client");
  try {
    const [actsRes, compsRes] = await Promise.all([
      api.activities.getAll(),
      api.completions.getAll(),
    ]);
    const weekday = (new Date(`${date}T12:00:00`).getDay() + 6) % 7; // 0 = lunes
    const activities = ((actsRes?.data ?? []) as {
      id: string;
      days?: boolean[];
      isArchived?: boolean;
    }[]).filter((a) => !a.isArchived && (a.days ? a.days[weekday] : true));

    const yaHechos = new Set(
      ((compsRes as { data?: { activityId: string; date: string; completed: boolean }[] })
        ?.data ?? [])
        .filter((c) => c.date === date && c.completed)
        .map((c) => c.activityId),
    );

    for (const a of activities) {
      if (yaHechos.has(a.id)) continue;
      await api.completions.toggle({ activityId: a.id, date });
    }
    return true;
  } catch {
    return false;
  }
}

/** Reintenta lo que quedó sin enviar (el SO pudo matar el proceso antes). */
export async function flushPendingActions(): Promise<void> {
  const pending = readPending();
  if (!pending.length) return;
  const quedan: PendingAction[] = [];
  for (const action of pending) {
    const ok = await runAction(action);
    if (!ok) quedan.push(action);
  }
  writePending(quedan);
}

export async function setupNotificationActionHandler(): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );

    await LocalNotifications.addListener(
      "localNotificationActionPerformed",
      async (event) => {
        const actionId = event.actionId;
        // "tap" = abrió la notificación sin elegir acción: no registrar nada.
        if (!actionId || actionId === "tap" || actionId === "dismiss") return;

        const action: PendingAction = {
          actionId,
          date: todayKey(),
          at: Date.now(),
        };
        // Se guarda ANTES de intentar: si el SO corta el proceso, no se pierde.
        writePending([...readPending(), action]);
        await flushPendingActions();

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("xp-updated"));
          window.dispatchEvent(new Event("nutrition-log"));
        }
      },
    );

    await flushPendingActions();
  } catch {
    /* sin soporte de acciones */
  }
}
