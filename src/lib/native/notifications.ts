/**
 * Notificaciones locales (recordatorios de habitos / hidratacion).
 * Programa repeticiones diarias a horas fijas. No-op en web.
 */
import { isNative } from "./platform";

export interface DailyReminder {
  id: number;
  title: string;
  body: string;
  hour: number; // 0-23
  minute: number; // 0-59
  /** Acciones dentro de la notificación: registrar sin abrir la app. */
  actionTypeId?: string;
}

/**
 * Ids de los grupos de acciones (declarados acá arriba porque los usan los
 * recordatorios por defecto; se registran en `registerNotificationActions`).
 */
export const ACTION_TYPE_HYDRATION = "HYDRATION_ACTIONS";
export const ACTION_TYPE_WORKOUT = "WORKOUT_ACTIONS";
export const ACTION_TYPE_MEAL = "MEAL_ACTIONS";
export const ACTION_TYPE_HABITS = "HABITS_ACTIONS";

/** Días de handball (0=dom … 6=sáb): lun, mar, jue y dom. */
export const TRAINING_WEEKDAYS = [1, 2, 4, 0];
/** Recordatorio post-entrenamiento, con acción "Sí, entrené" en la notificación. */
const WORKOUT_REMINDER_ID_BASE = 1200;

/** Recordatorios por defecto de NaviTracker. */
export const DEFAULT_REMINDERS: DailyReminder[] = [
  // (el recordatorio fijo de hidratación fue reemplazado por los graduales
  //  por tramos de scheduleHydrationPaceReminders)
  {
    id: 1002,
    title: "🧉 Merienda",
    body: "Tocá \"La de siempre\" y queda registrada, sin abrir la app.",
    hour: 17,
    minute: 0,
    actionTypeId: ACTION_TYPE_MEAL,
  },
  {
    id: 1003,
    title: "🎯 Hábitos del día",
    body: "Si los cumpliste, marcalos todos desde acá.",
    hour: 21,
    minute: 30,
    actionTypeId: ACTION_TYPE_HABITS,
  },
  {
    id: 1004,
    title: "🍽️ Almuerzo",
    body: "Tocá \"La de siempre\" y queda registrado.",
    hour: 14,
    minute: 0,
    actionTypeId: ACTION_TYPE_MEAL,
  },
  {
    id: 1005,
    title: "🍽️ Cena",
    body: "Tocá \"La de siempre\" y queda registrada.",
    hour: 22,
    minute: 0,
    actionTypeId: ACTION_TYPE_MEAL,
  },
];

/**
 * Acciones sobre la propia notificación: registrar sin abrir la app.
 * La fricción de "abrir app → navegar → cargar" es lo que hace que se dejen
 * de registrar las cosas; desde la pantalla bloqueada es un solo toque.
 */
export async function registerNotificationActions(): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: ACTION_TYPE_HYDRATION,
          actions: [
            { id: "water_glass", title: "Tomé un vaso" },
            { id: "water_two", title: "Tomé dos" },
            { id: "dismiss", title: "Después", destructive: true },
          ],
        },
        {
          id: ACTION_TYPE_WORKOUT,
          actions: [
            { id: "workout_yes", title: "Sí, entrené" },
            { id: "dismiss", title: "Hoy no", destructive: true },
          ],
        },
        {
          id: ACTION_TYPE_MEAL,
          actions: [
            { id: "meal_usual", title: "La de siempre" },
            { id: "dismiss", title: "Después", destructive: true },
          ],
        },
        {
          id: ACTION_TYPE_HABITS,
          actions: [
            { id: "habits_all", title: "Los hice todos" },
            { id: "dismiss", title: "Después", destructive: true },
          ],
        },
      ],
    });
  } catch {
    /* sin soporte de acciones */
  }
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );
    const status = await LocalNotifications.checkPermissions();
    if (status.display === "granted") return true;
    const req = await LocalNotifications.requestPermissions();
    return req.display === "granted";
  } catch {
    return false;
  }
}

export async function scheduleDailyReminders(
  reminders: DailyReminder[] = DEFAULT_REMINDERS,
): Promise<void> {
  if (!isNative()) return;
  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  try {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );

    // Limpiar SOLO las propias (ids < 2000) para no pisar las de hidratación por tramos.
    const pending = await LocalNotifications.getPending();
    const own = pending.notifications.filter((n) => n.id < 2000);
    if (own.length) {
      await LocalNotifications.cancel({
        notifications: own.map((n) => ({ id: n.id })),
      });
    }

    await LocalNotifications.schedule({
      notifications: reminders.map((r) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        ...(r.actionTypeId ? { actionTypeId: r.actionTypeId } : {}),
        schedule: { on: { hour: r.hour, minute: r.minute }, allowWhileIdle: true },
      })),
    });
  } catch {
    /* notifications no disponibles */
  }
}

/**
 * Aviso al terminar el handball (lun/mar/jue 22:45 y dom 18:15) con la acción
 * "Sí, entrené" en la propia notificación: registra sin abrir la app.
 */
export async function scheduleWorkoutReminders(): Promise<void> {
  if (!isNative()) return;
  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  try {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );

    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter(
      (n) =>
        n.id >= WORKOUT_REMINDER_ID_BASE && n.id < WORKOUT_REMINDER_ID_BASE + 10,
    );
    if (ours.length) {
      await LocalNotifications.cancel({
        notifications: ours.map((n) => ({ id: n.id })),
      });
    }

    let nextId = WORKOUT_REMINDER_ID_BASE;
    await LocalNotifications.schedule({
      notifications: TRAINING_WEEKDAYS.map((weekday) => ({
        id: nextId++,
        title: "🤾 ¿Jugaste hoy?",
        body: "Tocá acá y queda registrado (+60 XP), sin abrir la app.",
        actionTypeId: ACTION_TYPE_WORKOUT,
        schedule: {
          // `on` con weekday repite todas las semanas ese día.
          on: weekday === 0
            ? { weekday: 1, hour: 18, minute: 15 }
            : { weekday: weekday + 1, hour: 22, minute: 45 },
          allowWhileIdle: true,
        },
      })),
    });
  } catch {
    /* no-op */
  }
}

export async function cancelAllReminders(): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    }
  } catch {
    /* no-op */
  }
}


// ─── Recordatorios graduales de hidratación por tramos ───────────────
// Ids 2001-2019. Se reprograman en cada registro de agua / carga del ritmo:
// avisan cuando te estás por quedar 1 vaso abajo del ritmo del tramo actual
// y al arrancar cada tramo que viene (el de entrenamiento solo si aplica).

interface PaceBlockLike {
  id: string;
  label: string;
  start: string;
  end: string;
  targetMl: number;
  active: boolean;
  status: string;
}

export interface HydrationPaceLike {
  blocks: PaceBlockLike[];
  currentBlock: PaceBlockLike | null;
  consumedMl: number;
  expectedByNowMl: number;
  deficitMl: number;
  mlPerGlass: number;
  goalReached: boolean;
}

const HYDRATION_ID_BASE = 2001;
/** Piso recurrente por tramo (2101+): sobrevive sin abrir la app. */
const HYDRATION_RECURRING_BASE = 2101;

const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Piso de recordatorios por tramo, agendados como repetición diaria nativa
 * (`on: {hour, minute}`). Los graduales de abajo usan `at: Date`, que dispara
 * una sola vez: sin esto, un día que no se abre la app no llega ningún aviso.
 * Los tramos que dependen de entrenar quedan afuera (no son todos los días).
 */
export async function scheduleHydrationRecurringReminders(
  blocks: { label: string; start: string; end: string; targetMl: number; requiresTraining?: boolean }[],
): Promise<void> {
  if (!isNative()) return;
  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  try {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );

    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter(
      (n) =>
        n.id >= HYDRATION_RECURRING_BASE && n.id < HYDRATION_RECURRING_BASE + 19,
    );
    if (ours.length) {
      await LocalNotifications.cancel({
        notifications: ours.map((n) => ({ id: n.id })),
      });
    }

    let nextId = HYDRATION_RECURRING_BASE;
    const notifications = blocks
      .filter((b) => !b.requiresTraining)
      .flatMap((b) => {
        const start = minutesOf(b.start);
        const end = minutesOf(b.end);
        const mid = Math.floor((start + end) / 2);
        return [start + 5, mid].map((minute) => ({
          id: nextId++,
          title: `💧 ${b.label}`,
          body: `${(b.targetMl / 1000).toFixed(1).replace(".0", "")}L hasta las ${b.end}. Tomate un vaso.`,
          actionTypeId: ACTION_TYPE_HYDRATION,
          schedule: {
            on: { hour: Math.floor(minute / 60), minute: minute % 60 },
            allowWhileIdle: true,
          },
        }));
      });

    if (notifications.length) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch {
    /* no-op fuera de nativo */
  }
}

export async function scheduleHydrationPaceReminders(
  pace: HydrationPaceLike,
): Promise<void> {
  if (!isNative()) return;
  const granted = await ensureNotificationPermissions();
  if (!granted) return;

  try {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );

    // Cancelar las de hidratación previas (2001-2019)
    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter(
      (n) => n.id >= HYDRATION_ID_BASE && n.id < HYDRATION_ID_BASE + 19,
    );
    if (ours.length) {
      await LocalNotifications.cancel({
        notifications: ours.map((n) => ({ id: n.id })),
      });
    }

    if (pace.goalReached) return; // día cumplido: silencio

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const notifications: {
      id: number;
      title: string;
      body: string;
      actionTypeId?: string;
      schedule: { at: Date; allowWhileIdle: boolean };
    }[] = [];
    let nextId = HYDRATION_ID_BASE;
    const atTime = (minutes: number) => {
      const d = new Date(now);
      d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
      return d;
    };

    // 1) Tramo actual: avisar cuando el déficit llegue a 1 vaso
    if (pace.currentBlock) {
      const b = pace.currentBlock;
      const slope = b.targetMl / (minutesOf(b.end) - minutesOf(b.start)); // ml/min
      const behindIn =
        pace.deficitMl >= pace.mlPerGlass
          ? 30 // ya está atrasado: recordar en 30 min
          : Math.ceil(
              (pace.consumedMl + pace.mlPerGlass - pace.expectedByNowMl) /
                slope,
            );
      const fireAt = Math.min(nowMin + Math.max(behindIn, 10), minutesOf(b.end) - 5);
      if (fireAt > nowMin) {
        notifications.push({
          id: nextId++,
          title: `💧 ${b.label}: hora de un vaso`,
          body: `Para ir a ritmo del tramo (${b.targetMl}ml hasta las ${b.end}) tomate ~${pace.mlPerGlass}ml.`,
          actionTypeId: ACTION_TYPE_HYDRATION,
          schedule: { at: atTime(fireAt), allowWhileIdle: true },
        });
      }
    }

    // 2) Arranque de los tramos que vienen (solo activos)
    for (const b of pace.blocks) {
      if (!b.active) continue;
      const start = minutesOf(b.start);
      if (start > nowMin) {
        notifications.push({
          id: nextId++,
          title: `💧 Arranca ${b.label}`,
          body: `${(b.targetMl / 1000).toFixed(1).replace(".0", "")}L hasta las ${b.end}. ¡Vaso en mano!`,
          actionTypeId: ACTION_TYPE_HYDRATION,
          schedule: { at: atTime(start + 5), allowWhileIdle: true },
        });
      }
    }

    if (notifications.length) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch {
    /* no-op fuera de nativo */
  }
}
