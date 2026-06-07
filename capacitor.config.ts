import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lucianoyomayel.navitracker",
  appName: "NaviTracker",
  webDir: "out",
  // El backend vive en otro dominio; los requests salen del WebView
  // (capacitor://localhost / http://localhost). El CORS del backend
  // ya permite esos origins (ver backend main.ts).
  server: {
    androidScheme: "https",
    // Esquema custom para deep links del callback OAuth de Google Calendar.
    // En produccion se usa este scheme; el redirect_uri en Google Console
    // debe ser navitracker://oauth-callback.
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#0f172a",
      showSpinner: false,
      androidSplashResourceName: "splash",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0f172a",
    },
    Keyboard: {
      resize: "native",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#22c55e",
    },
  },
};

export default config;
