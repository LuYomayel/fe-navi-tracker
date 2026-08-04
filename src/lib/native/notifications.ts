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
}

/** Recordatorios por defecto de NaviTracker. */
export const DEFAULT_REMINDERS: DailyReminder[] = [
  // (el recordatorio fijo de hidratación fue reemplazado por los graduales
  //  por tramos de scheduleHydrationPaceReminders)
  {
    id: 1002,
    title: "🧉 Merienda",
    body: "Momento de la merienda. Registrala en NaviTracker.",
    hour: 17,
    minute: 0,
  },
  {
    id: 1003,
    title: "🎯 Hábitos del día",
    body: "Repasá tus hábitos antes de cerrar el día.",
    hour: 21,
    minute: 30,
  },
];

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
        schedule: { on: { hour: r.hour, minute: r.minute }, allowWhileIdle: true },
      })),
    });
  } catch {
    /* notifications no disponibles */
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

const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

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
