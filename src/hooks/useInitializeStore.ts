import { useEffect } from "react";
import { useRef } from "react";
import { useNaviTrackerStore } from "@/store";

export function useInitializeStore() {
  const { initializeFromDatabase, isInitialized, isLoading } =
    useNaviTrackerStore();

  // Flag para asegurar que sólo llamamos una vez incluso en modo Strict
  const hasInitRef = useRef(false);

  useEffect(() => {
    if (hasInitRef.current) return;
    if (!isInitialized && !isLoading) {
      hasInitRef.current = true;
      initializeFromDatabase();
    }
  }, [isInitialized, isLoading, initializeFromDatabase]);

  return { isInitialized, isLoading };
}
