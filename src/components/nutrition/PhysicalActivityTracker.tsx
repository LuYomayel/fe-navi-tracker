"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Activity, Clock, Footprints, Zap } from "lucide-react";
import { api } from "@/lib/api-client";
import { PhysicalActivity } from "@/types";
import { CreatePhysicalActivityDialog } from "@/components/nutrition/CreatePhysicalActivityDialog";
import { toast } from "@/hooks/use-toast";
import { useNaviTrackerStore } from "@/store";

interface PhysicalActivityTrackerProps {
  date: string;
}

export function PhysicalActivityTracker({
  date,
}: PhysicalActivityTrackerProps) {
  const {
    getAllPhysicalActivities: _getAllPhysicalActivities,
    physicalActivities,
    refreshPhysicalActivities,
  } = useNaviTrackerStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [date]);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      const response = await api.physicalActivity.getAll();
      console.log("response", response);
      if (response.success) {
        // Las actividades se actualizan automáticamente en el store
        console.log("✅ Actividades físicas cargadas");
      }
    } catch (error) {
      console.error("Error loading activities:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las actividades físicas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivityCreated = async (_newActivity: PhysicalActivity) => {
    setShowCreateDialog(false);

    // Refrescar actividades físicas para mostrar la nueva
    refreshPhysicalActivities();

    // El backend YA agrega XP automáticamente, solo disparar eventos
    window.dispatchEvent(new CustomEvent("physical-activity"));
    window.dispatchEvent(new CustomEvent("xp-updated"));

    toast({
      title: "¡Actividad registrada!",
      description: `Has ganado 60 XP por registrar tu actividad física`,
    });
  };

  const handleDeleteActivity = async (id: string) => {
    try {
      const response = await api.physicalActivity.delete(id);

      if (response.success) {
        // setActivities((prev) => prev.filter((activity) => activity.id !== id));
        toast({
          title: "Actividad eliminada",
          description: "La actividad física se eliminó correctamente",
        });
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la actividad",
        variant: "destructive",
      });
    }
  };

  // Filtrar actividades del día seleccionado SOLO para el cálculo calórico
  const todayActivities = physicalActivities.filter(
    (activity) => activity.date === date
  );

  // Calcular totales del día (solo para el día seleccionado)
  console.log("physicalActivities", physicalActivities);
  const totals = todayActivities.reduce(
    (acc, activity) => {
      acc.calories += activity.activeEnergyKcal || 0;
      acc.steps += activity.steps || 0;
      acc.distanceKm += activity.distanceKm || 0;
      acc.exerciseMinutes += activity.exerciseMinutes || 0;
      return acc;
    },
    { calories: 0, steps: 0, distanceKm: 0, exerciseMinutes: 0 }
  );

  // Ordenar TODAS las actividades por fecha (más recientes primero)
  const allActivitiesSorted = [...physicalActivities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumen del día */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Resumen de Actividad Física
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-600">Calorías</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {totals.calories}
              </div>
              <div className="text-xs text-gray-500">kcal quemadas</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Footprints className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">Pasos</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {totals.steps.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">pasos</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Distancia</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {totals.distanceKm.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">km</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-600">Ejercicio</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {totals.exerciseMinutes}
              </div>
              <div className="text-xs text-gray-500">minutos</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón para agregar actividad */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="w-full"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar Actividad Física
          </Button>
        </CardContent>
      </Card>

      {/* Lista de actividades */}
      {allActivitiesSorted.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Historial de Actividades</span>
              <Badge variant="outline">
                {allActivitiesSorted.length} actividades
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allActivitiesSorted.map((activity) => {
                const isToday = activity.date === date;
                return (
                  <div
                    key={activity.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isToday
                        ? "bg-blue-50 border-2 border-blue-200"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">
                          {activity.source === "image" ? "IA" : "Manual"}
                        </Badge>
                        {isToday && (
                          <Badge variant="default" className="bg-blue-500">
                            Hoy
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {activity.date}
                        </span>
                        {activity.aiConfidence && (
                          <span className="text-xs text-gray-500">
                            {Math.round(activity.aiConfidence * 100)}% confianza
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {activity.activeEnergyKcal && (
                          <span>🔥 {activity.activeEnergyKcal} kcal</span>
                        )}
                        {activity.steps && (
                          <span>
                            👟 {activity.steps.toLocaleString()} pasos
                          </span>
                        )}
                        {activity.distanceKm && (
                          <span>📏 {activity.distanceKm} km</span>
                        )}
                        {activity.exerciseMinutes && (
                          <span>⏱️ {activity.exerciseMinutes} min</span>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Eliminar
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para crear actividad */}
      <CreatePhysicalActivityDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onActivityCreated={handleActivityCreated}
        date={date}
      />
    </div>
  );
}
