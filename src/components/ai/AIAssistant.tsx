"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Plus, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNaviTrackerStore } from "@/store";
import { api } from "@/lib/api-client";
import { renderMarkdown } from "@/lib/markdown";
import { toast } from "@/lib/toast-helper";

interface AIMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  activities?: ParsedActivity[];
  needsValidation?: boolean;
  validationQuestions?: string[];
  suggestions?: string[];
}

interface ParsedActivity {
  name: string;
  days: boolean[];
  category?: string;
  time?: string;
  description?: string;
}

const WELCOME_MESSAGE: AIMessage = {
  id: "welcome",
  type: "ai",
  content: `\u00a1Hola! Soy tu asistente personal de h\u00e1bitos. Puedo ayudarte con:

\u2022 Consejos para mantener la constancia
\u2022 Sugerencias de rutinas personalizadas
\u2022 An\u00e1lisis de tu progreso
\u2022 **Agregar actividades desde tablas de h\u00e1bitos**

\u00bfEn qu\u00e9 puedo ayudarte hoy?`,
  timestamp: new Date(),
};

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([WELCOME_MESSAGE]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [pendingActivities, setPendingActivities] = useState<ParsedActivity[]>(
    []
  );
  const [showActivitiesPreview, setShowActivitiesPreview] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { addActivity } = useNaviTrackerStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history from backend when dialog opens
  const loadChatHistory = useCallback(async () => {
    if (historyLoaded) return;
    setIsLoadingHistory(true);
    try {
      const response = await api.chat.getMessages();
      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        const loadedMessages: AIMessage[] = response.data.map(
          (msg: { id: string; role: string; content: string; timestamp: string }) => ({
            id: msg.id,
            type: msg.role === "user" ? "user" : "ai",
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          })
        );
        setMessages([WELCOME_MESSAGE, ...loadedMessages]);
      }
      setHistoryLoaded(true);
    } catch (error) {
      console.error("Error loading chat history:", error);
      // Silently fail - user can still chat without history
    } finally {
      setIsLoadingHistory(false);
    }
  }, [historyLoaded]);

  useEffect(() => {
    if (isOpen && !historyLoaded) {
      loadChatHistory();
    }
  }, [isOpen, historyLoaded, loadChatHistory]);

  // Persist a single message to the backend (fire-and-forget)
  const persistMessage = async (role: "user" | "assistant", content: string) => {
    try {
      await api.chat.sendMessage({ role, content });
    } catch (error) {
      console.error("Error persisting chat message:", error);
    }
  };

  const handleClearChat = async () => {
    setIsClearing(true);
    try {
      await api.chat.clearMessages();
      setMessages([WELCOME_MESSAGE]);
      setHistoryLoaded(true);
      toast.success("Chat limpiado", "Se eliminaron todos los mensajes.");
    } catch (error) {
      console.error("Error clearing chat:", error);
      toast.error("Error", "No se pudo limpiar el chat.");
    } finally {
      setIsClearing(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsLoading(true);

    // Persist user message to backend
    persistMessage("user", inputMessage);

    try {
      // Preparar contexto de conversacion. Todos los mensajes de la conversacion.
      const chatHistory = updatedMessages.map((msg: AIMessage) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      // Usar el servicio de IA del backend
      const response = await api.aiSuggestions.generate({
        message: inputMessage,
        chatHistory: chatHistory,
      });

      // El backend ya retorna el formato correcto
      const aiSuggestion = response.data as any;

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiSuggestion.message,
        timestamp: new Date(),
        activities: aiSuggestion.extractedActivities,
        needsValidation: aiSuggestion.tableDetected,
        suggestions: aiSuggestion.suggestions,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Persist AI response to backend
      persistMessage("assistant", aiSuggestion.message);

      // Si hay actividades detectadas en tabla o conversacion, mostrar preview
      if (
        aiSuggestion.extractedActivities &&
        aiSuggestion.extractedActivities.length > 0
      ) {
        // Convertir al formato esperado por el componente
        const formattedActivities = aiSuggestion.extractedActivities.map(
          (activity: any) => ({
            name: activity.name,
            days: activity.days || [true, true, true, true, true, false, false], // L-V por defecto
            category: activity.category || "general",
            time: activity.time || "",
            description: activity.frequency
              ? `Frecuencia: ${activity.frequency}`
              : "Detectado por IA",
          })
        );

        setPendingActivities(formattedActivities);
        setShowActivitiesPreview(true);
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);

      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAddActivities = () => {
    pendingActivities.forEach((activity) => {
      addActivity({
        name: activity.name,
        description: activity.description || "Importado desde asistente IA",
        days: activity.days,
        category: activity.category,
        time: activity.time,
        color: getRandomActivityColor(),
      });
    });

    // Enviar mensaje de confirmacion
    const confirmationMessage: AIMessage = {
      id: Date.now().toString(),
      type: "ai",
      content: `\u00a1Perfecto! He agregado ${
        pendingActivities.length
      } actividades a tu calendario:

${pendingActivities.map((activity) => `\u2705 ${activity.name}`).join("\n")}

Ya puedes empezar a trackear estos h\u00e1bitos en tu calendario semanal. \u00bfTe gustar\u00eda que te d\u00e9 algunos consejos para mantener la constancia?`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, confirmationMessage]);
    setPendingActivities([]);
    setShowActivitiesPreview(false);
  };

  const getRandomActivityColor = () => {
    const colors = [
      "#3b82f6", // blue
      "#10b981", // green
      "#f59e0b", // yellow
      "#ef4444", // red
      "#8b5cf6", // purple
      "#06b6d4", // cyan
      "#84cc16", // lime
      "#f97316", // orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const suggestedQuestions = [
    "Dame consejos para ser m\u00e1s constante",
    "\u00bfQu\u00e9 rutina de ejercicios me recomiendas?",
    "Analiza mi progreso actual",
    "\u00bfC\u00f3mo puedo organizar mejor mis h\u00e1bitos?",
  ];

  const hasConversation = messages.length > 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[80vh] sm:h-[600px] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Asistente IA - NaviTracker
            </DialogTitle>
            {hasConversation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                disabled={isClearing || isLoading}
                className="text-muted-foreground hover:text-destructive"
              >
                {isClearing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span className="ml-1 hidden sm:inline">Limpiar</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Preview de actividades detectadas */}
        {showActivitiesPreview && pendingActivities.length > 0 && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-800 dark:text-green-300">
                Actividades detectadas en tu conversacion
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {pendingActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded border border-border"
                >
                  <div>
                    <span className="font-medium">{activity.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({activity.category})
                    </span>
                  </div>
                  <div className="text-sm">
                    {activity.days.filter(Boolean).length === 7
                      ? "Todos los d\u00edas"
                      : `${activity.days.filter(Boolean).length} d\u00edas/semana`}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddActivities} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Agregar todas las actividades
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPendingActivities([]);
                  setShowActivitiesPreview(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg">
          {isLoadingHistory && (
            <div className="flex justify-center py-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando historial...
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-2 max-w-[80%] ${
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === "user"
                      ? "bg-blue-400 text-white"
                      : "text-muted-foreground"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-blue-400 text-white"
                      : "border"
                  }`}
                >
                  {message.type === "user" ? (
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  ) : (
                    <div
                      className="text-sm [&>p]:mb-2 [&>p:last-child]:mb-0 [&>strong]:font-semibold [&>em]:italic [&>code]:bg-muted/50 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-xs [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mb-2 [&>h2]:text-md [&>h2]:font-semibold [&>h2]:mb-1 [&>li]:ml-4"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(message.content),
                      }}
                    />
                  )}

                  {/* Mostrar preguntas de validacion */}
                  {message.validationQuestions &&
                    message.validationQuestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        {message.validationQuestions.map((question, index) => (
                          <div
                            key={index}
                            className="text-sm text-muted-foreground mb-1"
                          >
                            {question}
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Mostrar sugerencias clickeables */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        Sugerencias rapidas:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setInputMessage(suggestion)}
                            className="text-xs px-3 py-1 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground mt-2">
                    {message.timestamp.toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="border rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preguntas sugeridas */}
        {messages.length === 1 && !isLoadingHistory && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Preguntas frecuentes:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="text-xs px-3 py-1 bg-muted/50 hover:bg-muted text-muted-foreground rounded-full border border-border transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escribe tu mensaje aqu\u00ed... (puedes pegar una tabla de h\u00e1bitos)"
            className="flex-1 resize-none border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
            rows={2}
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
