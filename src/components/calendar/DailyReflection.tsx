"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, Brain, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNaviTrackerStore } from "@/store";
import {
  PREDEFINED_COMMENTS,
  getCommentsGroupedByCategory,
  CATEGORY_EMOJIS,
  CATEGORY_NAMES,
} from "@/lib/utils";
import { CommentCategory, PredefinedComment } from "@/types";

interface DailyReflectionProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

export function DailyReflection({
  isOpen,
  onClose,
  selectedDate = new Date(),
}: DailyReflectionProps) {
  const [selectedComments, setSelectedComments] = useState<PredefinedComment[]>(
    []
  );
  const [customComment, setCustomComment] = useState("");
  const [mood, setMood] = useState<number>(3);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { addOrUpdateNote, dailyNotes } = useNaviTrackerStore();

  const commentsByCategory = getCommentsGroupedByCategory();
  const dateKey = selectedDate.toISOString().split("T")[0];
  const existingNote = dailyNotes.find((note) => note.date === dateKey);
  const activeSuggestions: Array<{
    id: string;
    title: string;
    description: string;
    actions?: Array<{ label: string }>;
  }> = [];

  // Cargar datos existentes si hay una nota para esta fecha
  useEffect(() => {
    if (existingNote && isOpen) {
      setCustomComment(existingNote.customComment || "");
      setMood(existingNote.mood || 3);

      if (existingNote.predefinedComments) {
        const selected = PREDEFINED_COMMENTS.filter((comment: any) =>
          existingNote.predefinedComments?.includes(comment.id)
        );
        setSelectedComments(selected as any);
      }
    } else if (isOpen) {
      // Reset form for new entry
      setSelectedComments([]);
      setCustomComment("");
      setMood(3);
    }
  }, [existingNote, isOpen]);

  const handleCommentToggle = (comment: PredefinedComment) => {
    setSelectedComments((prev) => {
      const isSelected = prev.find((c) => c.id === comment.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== comment.id);
      } else {
        return [...prev, comment];
      }
    });
  };

  const handleSave = async () => {
    if (selectedComments.length === 0 && !customComment.trim()) {
      return;
    }

    setIsAnalyzing(true);

    try {
      await addOrUpdateNote(
        selectedDate,
        customComment.trim(),
        mood.toString()
      );
      onClose();
    } catch (error) {
      console.error("Error saving reflection:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const moodEmojis = ["😣", "😟", "😐", "😊", "😄"];
  const moodLabels = ["Muy mal", "Mal", "Regular", "Bien", "Excelente"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reflexión del día -{" "}
            {selectedDate.toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mood Selector */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              ¿Cómo te sentiste hoy?
            </h3>
            <div className="flex gap-2">
              {moodEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => setMood(index + 1)}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    mood === index + 1
                      ? "border-primary bg-accent"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <div className="text-2xl">{emoji}</div>
                  <div className="text-xs text-center mt-1">
                    {moodLabels[index]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Predefined Comments */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Selecciona qué tal estuvo tu día
            </h3>

            {Object.entries(commentsByCategory).map(([category, comments]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span className="text-lg">
                    {CATEGORY_EMOJIS[category as CommentCategory]}
                  </span>
                  {CATEGORY_NAMES[category as CommentCategory]}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(comments as any[]).map((comment: any) => {
                    const isSelected = selectedComments.find(
                      (c) => c.id === comment.id
                    );
                    return (
                      <button
                        key={comment.id}
                        onClick={() => handleCommentToggle(comment)}
                        className={`p-3 text-left rounded-lg border transition-all hover:scale-[1.02] ${
                          isSelected
                            ? "border-green-500 bg-green-50 text-green-800"
                            : "border-border hover:border-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{comment.text}</span>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Custom Comment */}
          <div className="space-y-3">
            <h3 className="font-medium">¿Algo más que quieras agregar?</h3>
            <textarea
              value={customComment}
              onChange={(e) => setCustomComment(e.target.value)}
              placeholder="Escribe tu propia reflexión sobre el día..."
              className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
            />
          </div>

          {/* Active AI Suggestions */}
          {activeSuggestions.length > 0 && (
            <div className="space-y-3 p-4 bg-accent rounded-lg">
              <h3 className="font-medium text-accent-foreground">
                💡 Sugerencias personalizadas basadas en tus patrones
              </h3>
              <div className="space-y-2">
                {activeSuggestions.slice(0, 3).map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-3 bg-card rounded border"
                  >
                    <div className="font-medium text-sm">
                      {suggestion.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {suggestion.description}
                    </div>
                    {suggestion.actions && suggestion.actions.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 text-xs"
                        onClick={() => {
                          // Aquí se puede implementar la acción
                          console.log(
                            "Suggestion action:",
                            suggestion.actions?.[0]
                          );
                        }}
                      >
                        {suggestion.actions[0]?.label}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isAnalyzing ||
                (selectedComments.length === 0 && !customComment.trim())
              }
              className="flex items-center gap-2"
            >
              {isAnalyzing && (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              )}
              {isAnalyzing ? "Analizando..." : "Guardar reflexión"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
