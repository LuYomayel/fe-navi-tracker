"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Plus, AlertCircle } from "lucide-react";
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

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "welcome",
      type: "ai",
      content: `¡Hola! Soy tu asistente personal de hábitos. Puedo ayudarte con:

• Consejos para mantener la constancia
• Sugerencias de rutinas personalizadas  
• Análisis de tu progreso
• **Agregar actividades desde tablas de hábitos**

¿En qué puedo ayudarte hoy?`,
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingActivities, setPendingActivities] = useState<ParsedActivity[]>(
    []
  );
  const [showActivitiesPreview, setShowActivitiesPreview] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { addActivity } = useNaviTrackerStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    try {
      // Preparar contexto de conversación. Todos los mensajes de la conversación.
      const chatHistory = updatedMessages.map((msg: AIMessage) => ({
        role: msg.type === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      // 🚀 Usar el servicio de IA del backend
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

      // Si hay actividades detectadas en tabla o conversación, mostrar preview
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

    // Enviar mensaje de confirmación
    const confirmationMessage: AIMessage = {
      id: Date.now().toString(),
      type: "ai",
      content: `¡Perfecto! He agregado ${
        pendingActivities.length
      } actividades a tu calendario:

${pendingActivities.map((activity) => `✅ ${activity.name}`).join("\n")}

Ya puedes empezar a trackear estos hábitos en tu calendario semanal. ¿Te gustaría que te dé algunos consejos para mantener la constancia?`,
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
    "Dame consejos para ser más constante",
    "¿Qué rutina de ejercicios me recomiendas?",
    "Analiza mi progreso actual",
    "¿Cómo puedo organizar mejor mis hábitos?",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Asistente IA - NaviTracker
          </DialogTitle>
        </DialogHeader>

        {/* Preview de actividades detectadas */}
        {showActivitiesPreview && pendingActivities.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">
                🎯 Actividades detectadas en tu conversación
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {pendingActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded border"
                >
                  <div>
                    <span className="font-medium">{activity.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({activity.category})
                    </span>
                  </div>
                  <div className="text-sm">
                    {activity.days.filter(Boolean).length === 7
                      ? "Todos los días"
                      : `${activity.days.filter(Boolean).length} días/semana`}
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
        <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg ">
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
                      : " text-gray-600"
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
                      : " border"
                  }`}
                >
                  {message.type === "user" ? (
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                  ) : (
                    <div
                      className="text-sm [&>p]:mb-2 [&>p:last-child]:mb-0 [&>strong]:font-semibold [&>em]:italic [&>code]:bg-gray-100 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-xs [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mb-2 [&>h2]:text-md [&>h2]:font-semibold [&>h2]:mb-1 [&>li]:ml-4"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(message.content),
                      }}
                    />
                  )}

                  {/* Mostrar preguntas de validación */}
                  {message.validationQuestions &&
                    message.validationQuestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        {message.validationQuestions.map((question, index) => (
                          <div
                            key={index}
                            className="text-sm text-gray-600 mb-1"
                          >
                            • {question}
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Mostrar sugerencias clickeables */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">
                        💡 Sugerencias rápidas:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setInputMessage(suggestion)}
                            className="text-xs px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full border border-blue-200 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
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
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-gray-600" />
                </div>
                <div className="bg-white border rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preguntas sugeridas */}
        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">💡 Preguntas frecuentes:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="text-xs px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full border border-gray-200 transition-colors"
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
            placeholder="Escribe tu mensaje aquí... (puedes pegar una tabla de hábitos)"
            className="flex-1 resize-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
