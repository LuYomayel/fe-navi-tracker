"use client";

import { useState, useEffect, useMemo } from "react";
import { useNaviTrackerStore } from "@/store";
import { CalendarEvent } from "@/types";
import { ChevronLeft, ChevronRight, Calendar, CheckCircle2, Circle, Utensils, Dumbbell, BookOpen, Droplets, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import AddEventDialog from "./AddEventDialog";

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export default function DailyAgenda() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const {
    tasks,
    activities,
    calendarEvents,
    nutritionAnalyses,
    physicalActivities,
    dailyNotes,
    currentDayScore,
    todayHydration,
    hydrationGoal,
    toggleTask,
    toggleCompletion,
    fetchCalendarEvents,
    fetchDayScore,
    fetchTodayHydration,
    refreshActivities,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
  } = useNaviTrackerStore();

  const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    refreshActivities();
    fetchDayScore(dateKey);
    fetchCalendarEvents(dateKey, dateKey);
    fetchTodayHydration(dateKey);
  }, [dateKey, refreshActivities, fetchDayScore, fetchCalendarEvents, fetchTodayHydration]);

  const navigateDay = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(d);
  };

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const isToday = dateKey === todayKey;

  // Day of week for habits (0=Mon in our system)
  const dayOfWeek = selectedDate.getDay();
  const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Habits scheduled for this day
  const scheduledHabits = useMemo(
    () =>
      activities.filter((a) => {
        if (a.archived) return false;
        const days = a.days;
        return Array.isArray(days) && days[dayIndex];
      }),
    [activities, dayIndex]
  );

  // Tasks for this day
  const dayTasks = useMemo(
    () => tasks.filter((t) => t.dueDate === dateKey),
    [tasks, dateKey]
  );

  // Events for this day
  const dayEvents = useMemo(
    () =>
      calendarEvents.filter((e) => {
        const eventDate = e.startTime.split("T")[0];
        return eventDate === dateKey;
      }),
    [calendarEvents, dateKey]
  );

  // Nutrition for this day (local store data for today, DayScore for past days)
  const dayNutrition = nutritionAnalyses.filter((n) => n.date === dateKey);
  const dayExercise = physicalActivities.filter((p) => p.date === dateKey);
  const dayNote = dailyNotes.find((n) => n.date === dateKey);

  // Progress calculation - guard against stale score from different date
  const score = currentDayScore?.date === dateKey ? currentDayScore : null;
  const percentage = score?.percentage ?? 0;

  // For past days, prefer DayScore source of truth over local arrays
  const nutritionRegistered = isToday ? dayNutrition.length > 0 : (score?.nutritionLogged ?? dayNutrition.length > 0);
  const exerciseRegistered = isToday ? dayExercise.length > 0 : (score?.exerciseLogged ?? dayExercise.length > 0);
  const reflectionRegistered = isToday ? !!dayNote : (score?.reflectionLogged ?? !!dayNote);
  const hydrationRegistered = isToday
    ? (todayHydration?.glassesConsumed ?? 0) >= hydrationGoal.goalGlasses
    : (score?.hydrationLogged ?? false);

  const statusColors: Record<string, string> = {
    won: "text-green-500",
    partial: "text-yellow-500",
    lost: "text-red-500",
    no_data: "text-muted-foreground",
  };

  const statusLabels: Record<string, string> = {
    won: "DIA GANADO",
    partial: "DIA PARCIAL",
    lost: "DIA PERDIDO",
    no_data: "SIN DATOS",
  };

  return (
    <div className="space-y-4">
      {/* Date navigator */}
      <div className="flex items-center justify-between bg-card rounded-lg border p-3">
        <Button variant="ghost" size="icon" onClick={() => navigateDay(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <p className="font-semibold">
            {dayNames[selectedDate.getDay()]} {selectedDate.getDate()} de{" "}
            {monthNames[selectedDate.getMonth()]}
          </p>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(new Date())}
              className="text-xs text-primary hover:underline"
            >
              Ir a hoy
            </button>
          )}
          {isToday && (
            <span className="text-xs text-primary font-medium">Hoy</span>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigateDay(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Day score bar */}
      {score && score.status !== "future" && (
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-sm font-bold ${statusColors[score.status] || ""}`}
            >
              {statusLabels[score.status] || score.status}
            </span>
            <span className="text-sm text-muted-foreground">
              {score.completedItems}/{score.totalItems} items
            </span>
          </div>
          <Progress
            value={percentage}
            className={`h-3 ${
              percentage === 100
                ? "[&>div]:bg-green-500"
                : percentage >= 50
                  ? "[&>div]:bg-yellow-500"
                  : "[&>div]:bg-red-500"
            }`}
          />
          <p className="text-xs text-muted-foreground mt-1">{percentage}% completado</p>
        </div>
      )}

      {/* Calendar Events */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            Eventos
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => {
              setEditingEvent(null);
              setShowEventDialog(true);
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Agregar
          </Button>
        </div>
        {dayEvents.length > 0 ? (
          <div className="space-y-2">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 text-sm pl-2 border-l-2"
                style={{ borderColor: event.color || "#60a5fa" }}
              >
                <span className="text-xs text-muted-foreground min-w-[50px]">
                  {event.allDay
                    ? "Todo el dia"
                    : new Date(event.startTime).toLocaleTimeString("es", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                </span>
                <span className="flex-1">{event.title}</span>
                {event.source === "google" ? (
                  <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1.5 rounded">
                    Google
                  </span>
                ) : (
                  <div className="flex gap-0.5">
                    <button
                      onClick={() => {
                        setEditingEvent(event);
                        setShowEventDialog(true);
                      }}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Pencil className="h-3 w-3 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => deleteCalendarEvent(event.id)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Sin eventos</p>
        )}
      </div>

      {/* Habits */}
      {scheduledHabits.length > 0 && (
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Habitos ({scheduledHabits.filter((h) => {
              return h.completions?.some(
                (c) => c.activityId === h.id && c.date === dateKey && c.completed
              );
            }).length}/{scheduledHabits.length})
          </h3>
          <div className="space-y-2">
            {scheduledHabits.map((habit) => {
              const isCompleted = habit.completions?.some(
                (c) => c.activityId === habit.id && c.date === dateKey && c.completed
              ) ?? false;
              return (
                <div key={habit.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => toggleCompletion(habit.id, selectedDate)}
                  />
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  <span
                    className={`text-sm ${
                      isCompleted ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {habit.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tasks */}
      {dayTasks.length > 0 && (
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Circle className="h-4 w-4 text-orange-500" />
            Tareas ({dayTasks.filter((t) => t.completed).length}/{dayTasks.length})
          </h3>
          <div className="space-y-2">
            {dayTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                />
                <span
                  className={`text-sm ${
                    task.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day status modules */}
      <div className="bg-card rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-3">Registro del dia</h3>
        <div className="space-y-3">
          <Link
            href="/nutrition"
            className="flex items-center gap-3 text-sm hover:bg-muted/50 rounded p-2 -m-2 transition"
          >
            <Utensils className="h-4 w-4 text-orange-500" />
            <span className="flex-1">Nutricion</span>
            {nutritionRegistered ? (
              <span className="text-xs text-green-500">
                {dayNutrition.length > 0 ? `${dayNutrition.length} comida${dayNutrition.length > 1 ? "s" : ""}` : "Registrado"}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Sin registrar</span>
            )}
          </Link>

          <Link
            href="/nutrition"
            className="flex items-center gap-3 text-sm hover:bg-muted/50 rounded p-2 -m-2 transition"
          >
            <Dumbbell className="h-4 w-4 text-purple-500" />
            <span className="flex-1">Ejercicio</span>
            {exerciseRegistered ? (
              <span className="text-xs text-green-500">Registrado</span>
            ) : (
              <span className="text-xs text-muted-foreground">Sin registrar</span>
            )}
          </Link>

          <div className="flex items-center gap-3 text-sm p-2 -m-2">
            <BookOpen className="h-4 w-4 text-teal-500" />
            <span className="flex-1">Reflexion</span>
            {reflectionRegistered ? (
              <span className="text-xs text-green-500">
                {dayNote ? `Mood: ${dayNote.mood}/5` : "Registrado"}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Sin registrar</span>
            )}
          </div>

          <Link
            href="/hydration"
            className="flex items-center gap-3 text-sm hover:bg-muted/50 rounded p-2 -m-2 transition"
          >
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="flex-1">Hidratacion</span>
            {hydrationRegistered ? (
              <span className="text-xs text-green-500">Meta alcanzada</span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {isToday && todayHydration
                  ? `${todayHydration.glassesConsumed}/${hydrationGoal.goalGlasses} vasos`
                  : "Sin registrar"}
              </span>
            )}
          </Link>
        </div>
      </div>

      <AddEventDialog
        isOpen={showEventDialog}
        editingEvent={editingEvent}
        defaultDate={dateKey}
        onSave={async (data) => {
          if (editingEvent) {
            await updateCalendarEvent(editingEvent.id, data);
          } else {
            await createCalendarEvent(data);
          }
          fetchCalendarEvents(dateKey, dateKey);
        }}
        onClose={() => {
          setShowEventDialog(false);
          setEditingEvent(null);
        }}
      />
    </div>
  );
}
