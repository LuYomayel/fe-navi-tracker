"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Activity, Clock, Footprints, Zap, Pencil } from "lucide-react";
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
  const [editingActivity, setEditingActivity] = useState<PhysicalActivity | null>(null);
  const [editForm, setEditForm] = useState({
    date: "",
    steps: "",
    distanceKm: "",
    activeEnergyKcal: "",
    exerciseMinutes: "",
    standHours: "",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [date]);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      const response = await api.physicalActivity.getAll();
      if (response.success) {
        // Las actividades se actualizan automáticamente en el store
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

  const openEditDialog = (activity: PhysicalActivity) => {
    setEditingActivity(activity);
    setEditForm({
      date: activity.date,
      steps: activity.steps?.toString() ?? "",
      distanceKm: activity.distanceKm?.toString() ?? "",
      activeEnergyKcal: activity.activeEnergyKcal?.toString() ?? "",
      exerciseMinutes: activity.exerciseMinutes?.toString() ?? "",
      standHours: activity.standHours?.toString() ?? "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingActivity) return;
    try {
      setIsSavingEdit(true);
      const response = await api.physicalActivity.update(editingActivity.id, {
        date: editForm.date,
        steps: editForm.steps ? parseInt(editForm.steps) : undefined,
        distanceKm: editForm.distanceKm ? parseFloat(editForm.distanceKm) : undefined,
        activeEnergyKcal: editForm.activeEnergyKcal ? parseInt(editForm.activeEnergyKcal) : undefined,
        exerciseMinutes: editForm.exerciseMinutes ? parseInt(editForm.exerciseMinutes) : undefined,
        standHours: editForm.standHours ? parseInt(editForm.standHours) : undefined,
      });
      if (response.success) {
        refreshPhysicalActivities();
        setEditingActivity(null);
        toast({ title: "Actividad actualizada" });
      }
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar la actividad", variant: "destructive" });
    } finally {
      setIsSavingEdit(false);
    }
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
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
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
                <span className="text-sm text-muted-foreground">Calorías</span>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {totals.calories}
              </div>
              <div className="text-xs text-muted-foreground">kcal quemadas</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Footprints className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Pasos</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {totals.steps.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">pasos</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Distancia</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {totals.distanceKm.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">km</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-muted-foreground">Ejercicio</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {totals.exerciseMinutes}
              </div>
              <div className="text-xs text-muted-foreground">minutos</div>
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
                        ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700"
                        : "bg-gray-50 dark:bg-gray-800"
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
                        <span className="text-xs text-muted-foreground">
                          {activity.date}
                        </span>
                        {activity.aiConfidence && (
                          <span className="text-xs text-muted-foreground">
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

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(activity)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para editar actividad */}
      <Dialog open={!!editingActivity} onOpenChange={(open) => !open && setEditingActivity(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Actividad Física</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Fecha</Label>
              <Input id="edit-date" type="date" value={editForm.date} onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-steps">Pasos</Label>
                <Input id="edit-steps" type="number" value={editForm.steps} onChange={(e) => setEditForm((p) => ({ ...p, steps: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-distance">Distancia (km)</Label>
                <Input id="edit-distance" type="number" step="0.1" value={editForm.distanceKm} onChange={(e) => setEditForm((p) => ({ ...p, distanceKm: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-calories">Calorías (kcal)</Label>
                <Input id="edit-calories" type="number" value={editForm.activeEnergyKcal} onChange={(e) => setEditForm((p) => ({ ...p, activeEnergyKcal: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-minutes">Minutos de ejercicio</Label>
                <Input id="edit-minutes" type="number" value={editForm.exerciseMinutes} onChange={(e) => setEditForm((p) => ({ ...p, exerciseMinutes: e.target.value }))} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-stand">Horas de pie</Label>
                <Input id="edit-stand" type="number" value={editForm.standHours} onChange={(e) => setEditForm((p) => ({ ...p, standHours: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditingActivity(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSaveEdit} disabled={isSavingEdit}>{isSavingEdit ? "Guardando..." : "Guardar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
