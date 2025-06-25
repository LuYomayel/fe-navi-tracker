"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/modules/shared/components/AppLayout";
import { useAuthStore } from "@/modules/auth/store";

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, setHydrated } = useAuthStore();

  // Timeout de emergencia para forzar la hidratación
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      if (!isHydrated) {
        setHydrated();
      }
    }, 2000);

    return () => clearTimeout(emergencyTimeout);
  }, [isHydrated, setHydrated]);

  useEffect(() => {
    // Solo redirigir después de que el estado esté hidratado
    if (isHydrated && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isHydrated, router]);

  // Mostrar loading mientras se hidrata el estado
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Cargando NaviTracker...
          </p>
        </div>
      </div>
    );
  }

  // Mostrar loading si no está autenticado (mientras se hace la redirección)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Verificando autenticación...
          </p>
        </div>
      </div>
    );
  }

  return <AppLayout>{children}</AppLayout>;
}
