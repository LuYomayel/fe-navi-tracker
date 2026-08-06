import { useEffect, useRef } from "react";
import { useNaviTrackerStore } from "@/store";
import { useAuthStore } from "@/modules/auth/store";

const MAX_ATTEMPTS = 3;

/**
 * Carga inicial del store global.
 *
 * OJO con el orden: el persist del auth store es ASINCRONO en nativo
 * (Capacitor Preferences), asi que en el primer render todavia no hay token.
 * Si se dispara la carga ahi, las requests salen sin Authorization, el backend
 * responde 401 y la app queda vacia hasta que la cerras y la volves a abrir.
 * Por eso esperamos a `isHydrated` + sesion antes de pedir nada, y reintentamos
 * con backoff si la tanda fallo entera (sin red / token vencido).
 */
export function useInitializeStore() {
  const { initializeFromDatabase, isInitialized, isLoading } =
    useNaviTrackerStore();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?.id ?? null);

  // Una carga por usuario: si cambia (login/logout) se vuelve a cargar.
  const loadedForUser = useRef<string | null>(null);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || !userId) return;
    if (loadedForUser.current === userId) return;
    loadedForUser.current = userId;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const run = async (attempt: number) => {
      if (cancelled) return;
      if (useNaviTrackerStore.getState().isInitialized) return;

      const last = attempt === MAX_ATTEMPTS;
      await initializeFromDatabase({ silent: !last });

      if (cancelled) return;
      if (useNaviTrackerStore.getState().isInitialized || last) return;
      timer = setTimeout(() => run(attempt + 1), 1500 * attempt);
    };

    run(1);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // isInitialized/isLoading a proposito NO van en deps: cambian al terminar
    // la carga y volverian a disparar el efecto en loop.
  }, [isHydrated, isAuthenticated, userId, initializeFromDatabase]);

  return { isInitialized, isLoading };
}
