"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { MessageSquare, Star, History, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNaviTrackerStore } from "@/store";
import { DailyReflection } from "./DailyReflection";
import { ReflectionHistory } from "./ReflectionHistory";
import { getDateKey } from "@/lib/utils";

export function DailyReflectionWidget() {
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { dailyNotes } = useNaviTrackerStore();

  const today = new Date();
  const todayKey = getDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getDateKey(yesterday);

  // Buscar reflexión de hoy o de ayer
  const todayReflection = dailyNotes.find((note) => note.date === todayKey);
  const yesterdayReflection = dailyNotes.find(
    (note) => note.date === yesterdayKey
  );
  const currentReflection = todayReflection || yesterdayReflection;

  // Obtener la reflexión más reciente si no hay de hoy ni ayer
  const mostRecentReflection =
    dailyNotes.length > 0
      ? [...dailyNotes].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0]
      : null;

  const displayReflection = currentReflection || mostRecentReflection;

  const moodEmojis = ["😣", "😟", "😐", "😊", "😄"];
  const moodLabels = ["Muy mal", "Mal", "Regular", "Bien", "Excelente"];

  const getMoodDisplay = (mood?: number) => {
    if (!mood || mood < 1 || mood > 5)
      return { emoji: "😐", label: "No especificado" };
    return { emoji: moodEmojis[mood - 1], label: moodLabels[mood - 1] };
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (dateString === getDateKey(today)) return "Hoy";
      if (dateString === getDateKey(yesterday)) return "Ayer";

      return format(date, "d 'de' MMMM", { locale: es });
    } catch {
      return dateString;
    }
  };

  const getReflectionStatus = () => {
    if (todayReflection) {
      return {
        status: "today",
        title: "Reflexión de hoy",
        subtitle: "Ya escribiste tu reflexión de hoy",
        color: "text-green-600",
        bgColor: " border-green-200",
      };
    } else if (yesterdayReflection) {
      return {
        status: "yesterday",
        title: "Reflexión de ayer",
        subtitle: "No has escrito tu reflexión de hoy aún",
        color: "text-yellow-600",
        bgColor: "border-yellow-200",
      };
    } else if (mostRecentReflection) {
      return {
        status: "old",
        title: `Reflexión del ${formatDate(mostRecentReflection.date)}`,
        subtitle: "Es hora de escribir una nueva reflexión",
        color: "text-blue-600",
        bgColor: " border-blue-200",
      };
    } else {
      return {
        status: "none",
        title: "Primera reflexión",
        subtitle: "Comienza tu diario personal",
        color: "text-muted-foreground",
        bgColor: " border-dashed",
      };
    }
  };

  const reflectionStatus = getReflectionStatus();

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Reflexión Diaria
              </CardTitle>
              <CardDescription>
                Tu espacio para reflexionar sobre el día
              </CardDescription>
            </div>
            {dailyNotes.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistoryModal(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <History className="h-4 w-4 mr-1" />
                Ver historial
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {displayReflection ? (
            <div
              className={`p-4 rounded-lg border ${reflectionStatus.bgColor}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className={`font-medium ${reflectionStatus.color}`}>
                    {reflectionStatus.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {reflectionStatus.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg">
                    {getMoodDisplay(displayReflection.mood).emoji}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getMoodDisplay(displayReflection.mood).label}
                  </span>
                </div>
              </div>

              {displayReflection.customComment && (
                <div className=" rounded-lg p-3 mb-3">
                  <p className="text-sm line-clamp-2">
                    {displayReflection.customComment}
                  </p>
                </div>
              )}

              {displayReflection.predefinedComments &&
                displayReflection.predefinedComments.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {displayReflection.predefinedComments
                      .slice(0, 2)
                      .map((commentId, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          Comentario #{commentId.slice(-4)}
                        </span>
                      ))}
                    {displayReflection.predefinedComments.length > 2 && (
                      <span className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                        +{displayReflection.predefinedComments.length - 2} más
                      </span>
                    )}
                  </div>
                )}
            </div>
          ) : (
            <div
              className={`p-6 rounded-lg border ${reflectionStatus.bgColor} text-center`}
            >
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h4 className={`font-medium ${reflectionStatus.color}`}>
                    {reflectionStatus.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {reflectionStatus.subtitle}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowReflectionModal(true)}
              className="flex-1"
              variant={todayReflection ? "outline" : "default"}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {todayReflection
                ? "Editar reflexión de hoy"
                : "Escribir reflexión de hoy"}
            </Button>

            {dailyNotes.length > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowHistoryModal(true)}
              >
                <History className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Estadística rápida */}
          {dailyNotes.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
              <span>Total de reflexiones: {dailyNotes.length}</span>
              <span>
                Última: {formatDate(mostRecentReflection?.date || "")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modales */}
      <DailyReflection
        isOpen={showReflectionModal}
        onClose={() => setShowReflectionModal(false)}
        selectedDate={today}
      />

      <ReflectionHistory
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </>
  );
}
