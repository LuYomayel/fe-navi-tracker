/**
 * Push notifications (briefing 07:00 y avisos). En nativo registra el device
 * token contra APNs (iOS) / FCM (Android) y lo manda al backend para que pueda
 * enviar pushes. No-op en web.
 */
import { isNative, getPlatform } from "./platform";

let pushRegistered = false;

export async function registerPush(): Promise<void> {
  if (!isNative() || pushRegistered) return;
  pushRegistered = true;

  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");

    const perm = await PushNotifications.checkPermissions();
    let receive = perm.receive;
    if (receive === "prompt" || receive === "prompt-with-rationale") {
      receive = (await PushNotifications.requestPermissions()).receive;
    }
    if (receive !== "granted") return;

    // Token recibido => mandarlo al backend.
    await PushNotifications.addListener("registration", async (token) => {
      try {
        const { api } = await import("@/lib/api-client");
        await api.deviceTokens.register(token.value, getPlatform());
      } catch {
        /* backend no disponible: se reintenta en el proximo arranque */
      }
    });

    await PushNotifications.addListener("registrationError", () => {
      pushRegistered = false;
    });

    await PushNotifications.register();
  } catch {
    pushRegistered = false;
  }
}

/** Engancha taps sobre la push para rutear (ej: abrir el briefing). */
export async function setupPushHandlers(
  navigate: (path: string) => void,
): Promise<void> {
  if (!isNative()) return;
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    await PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action) => {
        const route = action.notification?.data?.route;
        if (route) navigate(route);
      },
    );
  } catch {
    /* no-op */
  }
}
