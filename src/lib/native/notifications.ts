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
  {
    id: 1001,
    title: "💧 Hidratación",
    body: "¿Ya tomaste agua? Registrá tus vasos.",
    hour: 11,
    minute: 0,
  },
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

    // Limpiar las previas para no duplicar al re-programar.
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
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
