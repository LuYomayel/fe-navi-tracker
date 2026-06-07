/**
 * Storage para el persist de Zustand.
 *
 * - Web/SSR: localStorage (sincronico).
 * - Nativo (Capacitor): @capacitor/preferences => UserDefaults (iOS) /
 *   SharedPreferences (Android). Es durable y esta sandboxeado por app, a
 *   diferencia del localStorage del WebView que el OS puede evictar.
 *
 * Para endurecer aun mas los tokens JWT se puede cambiar Preferences por un
 * plugin de Keychain/Keystore sin tocar el resto del codigo.
 */
import type { StateStorage } from "zustand/middleware";
import { isNative } from "./platform";

export function createCapacitorStorage(): StateStorage {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  if (isNative()) {
    return {
      getItem: async (name) => {
        const { Preferences } = await import("@capacitor/preferences");
        const { value } = await Preferences.get({ key: name });
        return value ?? null;
      },
      setItem: async (name, value) => {
        const { Preferences } = await import("@capacitor/preferences");
        await Preferences.set({ key: name, value });
      },
      removeItem: async (name) => {
        const { Preferences } = await import("@capacitor/preferences");
        await Preferences.remove({ key: name });
      },
    };
  }

  return localStorage;
}
