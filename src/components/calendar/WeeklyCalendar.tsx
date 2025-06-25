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
import { ThemeToggle } from "@/components/ui/theme-toggle";
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

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Header con navegación */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">NaviTracker</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Hoy
          </Button>
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-center min-w-[200px]">
            <h2 className="text-lg font-semibold ">{getWeekTitle()}</h2>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDailyReflection(true, new Date())}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Reflexión</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReadingAssistant(true)}
            className="flex items-center gap-2"
          >
            <Book className="h-4 w-4" />
            <span className="hidden sm:inline">Lectura</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowAIAssistant(true)}
            className="flex items-center gap-2"
          >
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Asistente IA</span>
          </Button>

          <Button
            onClick={() => setShowAddActivityModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Agregar</span>
          </Button>
        </div>
      </div>

      {/* Tabla del calendario */}
      <div className=" rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header de días */}
            <thead className="">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium w-64">
                  Actividad
                </th>
                {weekDates.map((date, index) => (
                  <th
                    key={date.toISOString()}
                    className={`px-3 py-3 text-center text-sm font-medium min-w-[100px]`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs uppercase tracking-wide">
                        {getDayNames()[index]}
                      </span>
                      <span className="text-lg font-bold">
                        {format(date, "d")}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-sm font-medium w-16">
                  Opciones
                </th>
              </tr>
            </thead>

            {/* Cuerpo de la tabla */}
            <tbody className="divide-y divide-gray-200">
              {activities.filter((activity) => !activity.archived).length ===
              0 ? (
                <tr>
                  <td
                    colSpan={weekDates.length + 2}
                    className="px-4 py-8 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="h-8 w-8" />
                      <p>No tienes actividades registradas</p>
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
                    <tr key={activity.id} className="">
                      {/* Columna de actividad */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: activity.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium truncate">
                              {activity.name}
                            </h3>
                            {activity.time && (
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs">
                                  {formatTime(activity.time)}
                                </span>
                              </div>
                            )}
                            {activity.description && (
                              <p className="text-xs mt-1 truncate">
                                {activity.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Columnas de días */}
                      {weekDates.map((date, dayIndex) => (
                        <td
                          key={`${activity.id}-${date.toISOString()}`}
                          className={`px-3 py-4 text-center`}
                        >
                          {shouldShowActivity(activity, dayIndex) ? (
                            <Checkbox
                              checked={getCompletion(activity.id, date)}
                              onCheckedChange={() =>
                                toggleCompletion(activity.id, date)
                              }
                              className="mx-auto"
                            />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      ))}

                      {/* Columna de opciones */}
                      <td className="px-4 py-4 text-center">
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
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium">Actividades esta semana</h3>
          <p className="text-2xl font-bold mt-1">
            {activities.filter((activity) => !activity.archived).length}
          </p>
        </div>

        <div className="p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium">Completadas hoy</h3>
          <p className="text-2xl font-bold mt-1">
            {
              activities
                .filter((activity) => !activity.archived)
                .filter((activity) => getCompletion(activity.id, new Date()))
                .length
            }
          </p>
        </div>

        <div className="p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium">Racha actual</h3>
          <p className="text-2xl font-bold mt-1">0 días</p>
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
