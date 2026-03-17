import { toast } from "@/lib/toast-helper";
import { api } from "@/lib/api-client";
import type { StoreSet, StoreGet } from "../types";

const generateId = () => Math.random().toString(36).substring(2, 15);

export interface ChatSlice {
  chatHistory: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  addChatMessage: (
    role: "user" | "assistant",
    content: string
  ) => Promise<void>;
  clearChatHistory: () => Promise<void>;
}

export const createChatSlice = (set: StoreSet, _get: StoreGet): ChatSlice => ({
  chatHistory: [],

  addChatMessage: async (role, content) => {
    try {
      await api.chat.sendMessage({ role, content });

      const message = {
        id: generateId(),
        role,
        content,
        timestamp: new Date(),
      };

      set((state) => ({
        chatHistory: [...state.chatHistory, message],
      }));
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      toast.error(
        "Error",
        "No se pudo enviar el mensaje. Inténtalo de nuevo."
      );
    }
  },

  clearChatHistory: async () => {
    try {
      await api.chat.clearMessages();
      set({ chatHistory: [] });
      toast.success(
        "Historial limpiado",
        "Se ha eliminado el historial del chat"
      );
    } catch (error) {
      console.error("Error limpiando historial:", error);
      toast.error(
        "Error",
        "No se pudo limpiar el historial. Inténtalo de nuevo."
      );
    }
  },
});
