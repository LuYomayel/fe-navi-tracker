import { useEffect } from "react";
import { useNaviTrackerStore } from "@/store";

export function useInitializeStore() {
  const { initializeFromDatabase, isInitialized, isLoading } =
    useNaviTrackerStore();

  useEffect(() => {
    if (!isInitialized && !isLoading) {
      console.log("🚀 Inicializando datos desde la base de datos MySQL...");
      initializeFromDatabase();
    }
  }, [initializeFromDatabase, isInitialized, isLoading]);

  return { isInitialized, isLoading };
}
