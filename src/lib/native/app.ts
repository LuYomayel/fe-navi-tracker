/**
 * Inicializacion de la app nativa (Capacitor). Se llama una vez al montar el
 * CapacitorProvider. Todo gateado por isNative(): en web es no-op.
 *
 * Cubre: status bar, splash screen, back button Android, recordatorios locales,
 * deep links (callback OAuth de Google Calendar) y push notifications.
 */
import { isNative, isAndroid } from "./platform";
import { scheduleDailyReminders } from "./notifications";
import { registerPush } from "./push";

export interface NativeInitOptions {
  /** Navega dentro de la app (normalmente router.push de Next). */
  navigate: (path: string) => void;
  /** Maneja el callback OAuth: recibe el `code` (y opcional `state`). */
  onOAuthCallback?: (code: string, state: string | null) => void;
}

let initialized = false;

export async function initNativeApp(opts: NativeInitOptions): Promise<void> {
  if (!isNative() || initialized) return;
  initialized = true;

  await setupStatusBar();
  await hideSplash();
  await setupBackButton(opts.navigate);
  await setupDeepLinks(opts);
  await scheduleDailyReminders();
  await registerPush();
}

async function setupStatusBar(): Promise<void> {
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    if (isAndroid()) {
      await StatusBar.setBackgroundColor({ color: "#0f172a" });
    }
  } catch {
    /* sin status bar */
  }
}

async function hideSplash(): Promise<void> {
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    /* sin splash */
  }
}

async function setupBackButton(navigate: (path: string) => void): Promise<void> {
  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        // En la raiz: minimizar en vez de cerrar abruptamente.
        App.minimizeApp?.().catch(() => navigate("/"));
      }
    });
  } catch {
    /* sin back button */
  }
}

async function setupDeepLinks(opts: NativeInitOptions): Promise<void> {
  try {
    const { App } = await import("@capacitor/app");
    App.addListener("appUrlOpen", ({ url }) => {
      // Formatos esperados:
      //   navitracker://oauth-callback?code=...&state=...
      //   https://navi-tracker.luciano-yomayel.com/auth/google-callback?code=...
      try {
        const parsed = new URL(url);
        const code = parsed.searchParams.get("code");
        const state = parsed.searchParams.get("state");
        const isOAuth =
          parsed.host === "oauth-callback" ||
          parsed.pathname.includes("google-callback") ||
          parsed.pathname.includes("oauth-callback");

        if (isOAuth && code) {
          // Cerrar el browser del sistema que quedo abierto del flujo OAuth.
          import("@capacitor/browser")
            .then(({ Browser }) => Browser.close())
            .catch(() => {});
          if (opts.onOAuthCallback) opts.onOAuthCallback(code, state);
          else opts.navigate(`/auth/google-callback?code=${code}`);
          return;
        }

        // Deep link generico: navegar a la ruta.
        if (parsed.pathname && parsed.pathname !== "/") {
          opts.navigate(parsed.pathname + parsed.search);
        }
      } catch {
        /* url no parseable */
      }
    });
  } catch {
    /* sin deep links */
  }
}
