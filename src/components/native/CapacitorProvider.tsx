"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { initNativeApp } from "@/lib/native/app";
import { setupPushHandlers } from "@/lib/native/push";

/**
 * Inicializa todo lo nativo de Capacitor (status bar, splash, back button,
 * deep links OAuth, recordatorios, push). No-op en web. Se monta una vez en el
 * root layout.
 */
export default function CapacitorProvider() {
  const router = useRouter();

  useEffect(() => {
    const navigate = (path: string) => router.push(path);
    initNativeApp({ navigate });
    setupPushHandlers(navigate);
  }, [router]);

  return null;
}
