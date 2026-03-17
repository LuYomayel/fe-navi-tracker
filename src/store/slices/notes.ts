import type { DailyNote } from "@/types";
import { toast } from "@/lib/toast-helper";
import { api } from "@/lib/api-client";
import { XpAction } from "@/types/xp";
import type { StoreSet, StoreGet } from "../types";

const extractPatternsFromNote = (note: DailyNote): string[] => {
  const patterns: string[] = [];
  const content = note.content?.toLowerCase() || "";
  const customComment = note.customComment?.toLowerCase() || "";
  const allText = `${content} ${customComment}`;

  if (
    allText.includes("sueño") ||
    allText.includes("dormir") ||
    allText.includes("cansado")
  ) {
    patterns.push("sleep_issues");
  }

  if (
    allText.includes("estrés") ||
    allText.includes("ansiedad") ||
    allText.includes("nervioso")
  ) {
    patterns.push("stress_pattern");
  }

  if (
    allText.includes("desorganizado") ||
    allText.includes("caos") ||
    allText.includes("perdido")
  ) {
    patterns.push("organization_issues");
  }

  if (
    allText.includes("motivado") ||
    allText.includes("energía") ||
    allText.includes("positivo")
  ) {
    patterns.push("positive_mood");
  }

  return patterns;
};

export interface NotesSlice {
  dailyNotes: DailyNote[];
  addOrUpdateNote: (
    date: Date,
    content: string,
    mood?: string
  ) => Promise<void>;
  deleteNote: (date: Date) => Promise<void>;
  getNote: (date: Date) => DailyNote | undefined;
  addOrUpdateReflection: (
    date: Date,
    selectedComments: Array<{ id: string; text: string }>,
    customComment: string,
    mood: number
  ) => Promise<void>;
  getActiveSuggestions: () => Array<{
    id: string;
    title: string;
    description: string;
    actions?: Array<{ label: string }>;
  }>;
  getRecentAnalysis: (days: number) => Array<{
    id: string;
    date: string;
    detectedPatterns: string[];
  }>;
}

export const createNotesSlice = (set: StoreSet, get: StoreGet): NotesSlice => ({
  dailyNotes: [],

  addOrUpdateNote: async (date, content, mood) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;

    try {
      const state = get();
      const existingNote = state.dailyNotes.find(
        (n) => n.date === dateKey
      );

      if (existingNote?.id) {
        const response = await api.notes.update(existingNote.id, {
          content,
          mood: mood ? parseInt(mood) : undefined,
        });

        if (!response.success) {
          toast.error("Error", "No se pudo actualizar la nota");
          return;
        }

        const updatedNote = response.data as DailyNote;
        set((state) => ({
          dailyNotes: state.dailyNotes.map((n) =>
            n.date === dateKey ? { ...n, ...updatedNote } : n
          ),
        }));
      } else {
        const noteToSave = {
          date: dateKey,
          content,
          mood: mood ? parseInt(mood) : undefined,
        };

        const response = await api.notes.create(noteToSave);

        if (!response.success) {
          toast.error("Error", "No se pudo guardar la nota");
          return;
        }

        const newNote = response.data as DailyNote;
        set((state) => ({
          dailyNotes: [...state.dailyNotes, newNote],
        }));
      }

      toast.success("Nota guardada", "Tu reflexión diaria se ha guardado");
    } catch (error) {
      console.error("Error guardando nota:", error);
      toast.error(
        "Error",
        "No se pudo guardar la nota. Inténtalo de nuevo."
      );
    }
  },

  deleteNote: async (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;

    try {
      const state = get();
      const noteToDelete = state.dailyNotes.find(
        (note) => note.date === dateKey
      );

      if (noteToDelete?.id) {
        const response = await api.notes.delete(noteToDelete.id);
        if (!response.success) {
          toast.error("Error", "No se pudo eliminar la nota");
          return;
        }
      }

      set((state) => ({
        dailyNotes: state.dailyNotes.filter(
          (note) => note.date !== dateKey
        ),
      }));

      toast.success("Nota eliminada", "La reflexión se ha eliminado");
    } catch (error) {
      console.error("Error eliminando nota:", error);
      toast.error(
        "Error",
        "No se pudo eliminar la nota. Inténtalo de nuevo."
      );
    }
  },

  getNote: (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;
    const state = get();
    return state.dailyNotes.find((note) => note.date === dateKey);
  },

  addOrUpdateReflection: async (
    date,
    selectedComments,
    customComment,
    mood
  ) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;

    try {
      const noteToSave: any = {
        date: dateKey,
        content: customComment,
        mood: mood,
        predefinedComments: selectedComments.map((c: any) => c.id),
        customComment,
      };
      const response = await api.notes.create(noteToSave);

      if (!response.success) {
        toast.error("Error", "No se pudo guardar la reflexión");
        return;
      }

      const newNote = response.data as DailyNote;
      set((state) => ({
        dailyNotes: [...state.dailyNotes, newNote],
      }));

      const xpResponse = await api.xp.addXp({
        action: XpAction.DAILY_COMMENT,
        xpAmount: 15,
        description: "Reflexión diaria guardada",
      });
      if (!xpResponse.success) {
        toast.error("Error", "No se pudo guardar la reflexión");
        return;
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("daily-comment"));
      }

      toast.success(
        "Reflexión guardada",
        "Tu reflexión diaria se ha guardado"
      );
    } catch (error) {
      console.error("Error guardando reflexión:", error);
      toast.error("Error", (error as Error).message);
    }
  },

  getActiveSuggestions: () => {
    return [];
  },

  getRecentAnalysis: (days) => {
    const state = get();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return state.dailyNotes
      .filter((note) => new Date(note.date) >= cutoffDate)
      .map((note) => ({
        id: note.id,
        date: note.date,
        detectedPatterns: extractPatternsFromNote(note),
      }));
  },
});
