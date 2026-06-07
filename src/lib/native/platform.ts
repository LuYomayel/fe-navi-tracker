/**
 * Helpers de plataforma. Todo lo nativo se gatea por `isNative()` para que el
 * mismo codigo corra en web (fallback) y en la app Capacitor (iOS/Android).
 */
import { Capacitor } from "@capacitor/core";

export function isNative(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export function getPlatform(): "ios" | "android" | "web" {
  if (typeof window === "undefined") return "web";
  try {
    return Capacitor.getPlatform() as "ios" | "android" | "web";
  } catch {
    return "web";
  }
}

export const isIOS = () => getPlatform() === "ios";
export const isAndroid = () => getPlatform() === "android";
