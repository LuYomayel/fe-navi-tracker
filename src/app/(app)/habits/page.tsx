"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/modules/auth/store";
import { useNaviTrackerStore } from "@/store";
import { useInitializeStore } from "@/hooks/useInitializeStore";

// Componentes principales
import { WeeklyCalendar } from "@/components/calendar/WeeklyCalendar";
import { AddActivityModal } from "@/components/calendar/AddActivityModal";
import { DailyReflection } from "@/components/calendar/DailyReflection";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { ReadingAssistant } from "@/components/ai/ReadingAssistant";
import { NutritionTracker } from "@/components/nutrition/NutritionTracker";

export default function HabitsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { isLoading } = useInitializeStore();

  const {
    // Estados de modales
    showDailyReflection,
    showAIAssistant,
    showReadingAssistant,
    showNutritionAnalyzer,
    selectedModalDate,

    // Acciones para cerrar modales
    setShowDailyReflection,
    setShowAIAssistant,
    setShowReadingAssistant,
    setShowNutritionAnalyzer,
  } = useNaviTrackerStore();

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (isAuthenticated && !user) {
      router.push("/auth/login");
    }
  }, [user, isAuthenticated, router]);

  // Mostrar loading mientras se inicializa
  if (!isAuthenticated || !user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isLoading ? "Cargando tus hábitos..." : "Cargando..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Seguimiento de Hábitos 📈</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tus hábitos diarios, ve tu progreso y mantén la constancia
        </p>
      </div>

      {/* Calendario semanal principal con todas las funcionalidades */}
      <div className="bg-card rounded-lg shadow-sm border">
        <WeeklyCalendar />
      </div>

      {/* Modales */}
      <AddActivityModal />

      <DailyReflection
        isOpen={showDailyReflection}
        onClose={() => setShowDailyReflection(false)}
        selectedDate={selectedModalDate || new Date()}
      />

      <AIAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      />

      <ReadingAssistant
        isOpen={showReadingAssistant}
        onClose={() => setShowReadingAssistant(false)}
      />

      <NutritionTracker
        isOpen={showNutritionAnalyzer}
        onClose={() => setShowNutritionAnalyzer(false)}
        selectedDate={selectedModalDate || new Date()}
      />
    </div>
  );
}
