"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { MessageSquare, Calendar, Star, History, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNaviTrackerStore } from "@/store";
import type { DailyNote } from "@/types";

interface ReflectionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReflectionHistory({ isOpen, onClose }: ReflectionHistoryProps) {
  const { dailyNotes } = useNaviTrackerStore();
  const [selectedNote, setSelectedNote] = useState<DailyNote | null>(null);

  // Ordenar notas por fecha (más recientes primero)
  const sortedNotes = [...dailyNotes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

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
      return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  const getDateDifference = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      const today = new Date();
      const diffTime = today.getTime() - date.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Hoy";
      if (diffDays === 1) return "Ayer";
      if (diffDays < 7) return `Hace ${diffDays} días`;
      if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
      return `Hace ${Math.floor(diffDays / 30)} meses`;
    } catch {
      return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Reflexiones
            <span className="text-sm font-normal text-muted-foreground">
              ({sortedNotes.length} reflexiones)
            </span>
          </DialogTitle>
        </DialogHeader>

        {sortedNotes.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-center">
            <div className="space-y-3">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">No hay reflexiones aún</h3>
                <p className="text-sm text-muted-foreground">
                  Comienza a escribir tus reflexiones diarias para verlas aquí
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4">
            {sortedNotes.map((note) => {
              const moodDisplay = getMoodDisplay(note.mood);

              return (
                <div
                  key={note.id}
                  className="border rounded-lg p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedNote(note)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">
                            {formatDate(note.date)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getDateDifference(note.date)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span className="text-lg">{moodDisplay.emoji}</span>
                        <span className="text-xs text-muted-foreground">
                          {moodDisplay.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {note.customComment && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm line-clamp-3">
                        {note.customComment}
                      </p>
                    </div>
                  )}

                  {note.predefinedComments &&
                    note.predefinedComments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {note.predefinedComments
                          .slice(0, 3)
                          .map((commentId, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              Comentario #{commentId.slice(-4)}
                            </span>
                          ))}
                        {note.predefinedComments.length > 3 && (
                          <span className="inline-block px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                            +{note.predefinedComments.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de detalle de reflexión */}
        {selectedNote && (
          <Dialog
            open={!!selectedNote}
            onOpenChange={() => setSelectedNote(null)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Reflexión del {formatDate(selectedNote.date)}
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNote(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                {/* Estado de ánimo */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Star className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Estado de ánimo</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {getMoodDisplay(selectedNote.mood).emoji}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {getMoodDisplay(selectedNote.mood).label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reflexión personal */}
                {selectedNote.customComment && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Reflexión personal</h4>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedNote.customComment}
                      </p>
                    </div>
                  </div>
                )}

                {/* Comentarios predefinidos */}
                {selectedNote.predefinedComments &&
                  selectedNote.predefinedComments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Aspectos del día</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedNote.predefinedComments.map(
                          (commentId, index) => (
                            <span
                              key={index}
                              className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                            >
                              Comentario #{commentId.slice(-4)}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* Análisis de IA si existe */}
                {selectedNote.aiAnalysis && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Análisis de patrones</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      {selectedNote.aiAnalysis.patterns.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-blue-800 mb-1">
                            Patrones detectados:
                          </p>
                          <ul className="text-sm text-blue-700 space-y-1">
                            {selectedNote.aiAnalysis.patterns.map(
                              (pattern, index) => (
                                <li key={index}>• {pattern}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                      {selectedNote.aiAnalysis.suggestions.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-blue-800 mb-1">
                            Sugerencias:
                          </p>
                          <ul className="text-sm text-blue-700 space-y-1">
                            {selectedNote.aiAnalysis.suggestions.map(
                              (suggestion, index) => (
                                <li key={index}>• {suggestion}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                  Reflexión guardada el{" "}
                  {format(
                    new Date(selectedNote.createdAt),
                    "d/MM/yyyy 'a las' HH:mm",
                    { locale: es }
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
