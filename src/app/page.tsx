"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/modules/auth/store";
import { useNaviTrackerStore } from "@/store";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const { isInitialized, initializeFromDatabase } = useNaviTrackerStore();

  useEffect(() => {
    if (isHydrated && !isInitialized) {
      initializeFromDatabase();
    }
  }, [isHydrated, isInitialized, initializeFromDatabase]);

  useEffect(() => {
    if (isHydrated) {
      if (isAuthenticated && user) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    }
  }, [user, isAuthenticated, isHydrated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="flex items-center gap-3 mb-2 justify-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">NT</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            NaviTracker
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Cargando tu experiencia personalizada...
        </p>
      </div>
    </div>
  );
}
