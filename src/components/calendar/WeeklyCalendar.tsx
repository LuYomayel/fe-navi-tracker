"use client";

import React, { useState, useEffect } from "react";
import { format, addWeeks, subWeeks } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Clock,
  Calendar,
  Bot,
  MessageSquare,
  Book,
  Edit,
  Trash2,
  Copy,
  Archive,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNaviTrackerStore } from "@/store";
import { getWeekDates, getDayNames, formatTime } from "@/lib/utils";
import type { Activity } from "@/types";
import { EditActivityModal } from "./EditActivityModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { useToast } from "@/hooks/use-toast";

export function WeeklyCalendar() {
  const {
    activities,
    currentWeekStart,
    setCurrentWeekStart,
    setShowAddActivityModal,
    setShowAIAssistant,
    setShowDailyReflection,
    setShowReadingAssistant,
    getCompletion,
    toggleCompletion,
    deleteActivity,
    duplicateActivity,
    archiveActivity,
    restoreActivity,
  } = useNaviTrackerStore();

  const { toast } = useToast();

  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(
    null
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setWeekDates(getWeekDates(currentWeekStart));
  }, [currentWeekStart]);

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeekStart =
      direction === "prev"
        ? subWeeks(currentWeekStart, 1)
        : addWeeks(currentWeekStart, 1);
    setCurrentWeekStart(newWeekStart);
  };

  const goToToday = () => {
    setCurrentWeekStart(new Date());
  };

  const shouldShowActivity = (activity: Activity, dayIndex: number) => {
    return activity.days[dayIndex];
  };

  const getWeekTitle = () => {
    if (weekDates.length === 0) return "";
    const start = weekDates[0];
    const end = weekDates[6];

    if (start.getMonth() === end.getMonth()) {
      return `${format(start, "d", { locale: es })} - ${format(
        end,
        "d MMMM yyyy",
        { locale: es }
      )}`;
    } else {
      return `${format(start, "d MMM", { locale: es })} - ${format(
        end,
        "d MMM yyyy",
        { locale: es }
      )}`;
    }
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setShowEditModal(true);
  };

  const handleDeleteActivity = (activity: Activity) => {
    setDeletingActivity(activity);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingActivity) return;

    setIsDeleting(true);
    try {
      await deleteActivity(deletingActivity.id);
      toast({
        title: "Hábito eliminado",
        description: `"${deletingActivity.name}" ha sido eliminado permanentemente.`,
      });
      setShowDeleteModal(false);
      setDeletingActivity(null);
    } catch (error) {
      console.error("Error al eliminar actividad:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el hábito. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicateActivity = async (activity: Activity) => {
    try {
      await duplicateActivity(activity.id);
      toast({
        title: "Hábito duplicado",
        description: `Se ha creado una copia de "${activity.name}".`,
      });
    } catch (error) {
      console.error("Error al duplicar actividad:", error);
      toast({
        title: "Error",
        description: "No se pudo duplicar el hábito. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleArchiveActivity = async (activity: Activity) => {
    try {
      await archiveActivity(activity.id);
      toast({
        title: "Hábito archivado",
        description: `"${activity.name}" ha sido archivado. Puedes restaurarlo cuando quieras.`,
      });
    } catch (error) {
      console.error("Error al archivar actividad:", error);
      toast({
        title: "Error",
        description: "No se pudo archivar el hábito. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleRestoreActivity = async (activity: Activity) => {
    try {
      await restoreActivity(activity.id);
      toast({
        title: "Hábito restaurado",
        description: `"${activity.name}" ha sido restaurado.`,
      });
    } catch (error) {
      console.error("Error al restaurar actividad:", error);
      toast({
        title: "Error",
        description: "No se pudo restaurar el hábito. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const isDisabled = (activity: Activity, dayIndex: number) => {
    const today = new Date();
    // No se puede completar un hábito archivado ni un habito que sea de otro dia que no sea hoy
    console.log("date", activity, dayIndex, today.getDate());
    return activity.archived || dayIndex !== today.getDay();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4">
      {/* Header con navegación */}
      <div className="flex flex-col gap-3 mb-4 sm:mb-6">
        {/* Week navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateWeek("prev")}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <h2 className="text-sm sm:text-lg font-semibold">{getWeekTitle()}</h2>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateWeek("next")}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="flex-shrink-0 h-8 text-xs sm:text-sm"
          >
            <Calendar className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Hoy</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDailyReflection(true, new Date())}
            className="flex-shrink-0 h-8 text-xs sm:text-sm"
          >
            <MessageSquare className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Reflexión</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReadingAssistant(true)}
            className="flex-shrink-0 h-8 text-xs sm:text-sm"
          >
            <Book className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Lectura</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIAssistant(true)}
            className="flex-shrink-0 h-8 text-xs sm:text-sm"
          >
            <Bot className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">IA</span>
          </Button>

          <Button
            onClick={() => setShowAddActivityModal(true)}
            size="sm"
            className="flex-shrink-0 h-8 text-xs sm:text-sm ml-auto"
          >
            <Plus className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Agregar</span>
          </Button>
        </div>
      </div>

      {/* Tabla del calendario */}
      <div className="rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto -mx-px">
          <table className="w-full min-w-[600px]">
            {/* Header de días */}
            <thead>
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium w-32 sm:w-64 sticky left-0 bg-card z-10">
                  Actividad
                </th>
                {weekDates.map((date, index) => (
                  <th
                    key={date.toISOString()}
                    className={`px-1.5 sm:px-3 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium min-w-[52px] sm:min-w-[80px]`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] sm:text-xs uppercase tracking-wide">
                        {getDayNames()[index]}
                      </span>
                      <span className="text-sm sm:text-lg font-bold">
                        {format(date, "d")}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium w-10 sm:w-16">
                </th>
              </tr>
            </thead>

            {/* Cuerpo de la tabla */}
            <tbody className="divide-y divide-border">
              {activities.filter((activity) => !activity.archived).length ===
              0 ? (
                <tr>
                  <td
                    colSpan={weekDates.length + 2}
                    className="px-4 py-8 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="h-8 w-8" />
                      <p className="text-sm">No tienes actividades registradas</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddActivityModal(true)}
                      >
                        Agregar primera actividad
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                activities
                  .filter((activity) => !activity.archived)
                  .map((activity) => (
                    <tr key={activity.id}>
                      {/* Columna de actividad */}
                      <td className="px-2 sm:px-4 py-2.5 sm:py-4 sticky left-0 bg-card z-10">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: activity.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-medium truncate">
                              {activity.name}
                            </h3>
                            {activity.time && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-muted-foreground" />
                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                  {formatTime(activity.time)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Columnas de días */}
                      {weekDates.map((date, dayIndex) => (
                        <td
                          key={`${activity.id}-${date.toISOString()}`}
                          className={`px-1.5 sm:px-3 py-2.5 sm:py-4 text-center`}
                        >
                          {shouldShowActivity(activity, dayIndex) ? (
                            <Checkbox
                              checked={getCompletion(activity.id, date)}
                              onCheckedChange={() =>
                                toggleCompletion(activity.id, date)
                              }
                              disabled={isDisabled(activity, dayIndex)}
                              className="mx-auto h-4 w-4 sm:h-5 sm:w-5"
                            />
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </td>
                      ))}

                      {/* Columna de opciones */}
                      <td className="px-1 sm:px-4 py-2.5 sm:py-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditActivity(activity)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Edit className="h-4 w-4" />
                              Editar hábito
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicateActivity(activity)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Copy className="h-4 w-4" />
                              Duplicar hábito
                            </DropdownMenuItem>
                            {activity.archived ? (
                              <DropdownMenuItem
                                onClick={() => handleRestoreActivity(activity)}
                                className="flex items-center gap-2 cursor-pointer text-blue-600 focus:text-blue-600"
                              >
                                <RotateCcw className="h-4 w-4" />
                                Restaurar hábito
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleArchiveActivity(activity)}
                                className="flex items-center gap-2 cursor-pointer text-orange-600 focus:text-orange-600"
                              >
                                <Archive className="h-4 w-4" />
                                Archivar hábito
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteActivity(activity)}
                              className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar permanentemente
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-xl border border-border text-center sm:text-left">
          <h3 className="text-[10px] sm:text-sm font-medium text-muted-foreground">Actividades</h3>
          <p className="text-lg sm:text-2xl font-bold mt-0.5">
            {activities.filter((activity) => !activity.archived).length}
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-border text-center sm:text-left">
          <h3 className="text-[10px] sm:text-sm font-medium text-muted-foreground">Completadas</h3>
          <p className="text-lg sm:text-2xl font-bold mt-0.5">
            {
              activities
                .filter((activity) => !activity.archived)
                .filter((activity) => getCompletion(activity.id, new Date()))
                .length
            }
          </p>
        </div>

        <div className="p-3 sm:p-4 rounded-xl border border-border text-center sm:text-left">
          <h3 className="text-[10px] sm:text-sm font-medium text-muted-foreground">Racha</h3>
          <p className="text-lg sm:text-2xl font-bold mt-0.5">0 días</p>
        </div>
      </div>

      {/* Modales */}
      <EditActivityModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingActivity(null);
        }}
        activity={editingActivity}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingActivity(null);
        }}
        onConfirm={handleConfirmDelete}
        activity={deletingActivity}
        isDeleting={isDeleting}
      />
    </div>
  );
}
