"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useNaviState } from "@/hooks/useNaviState";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, MessageSquare, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NaviCompanionProps {
  className?: string;
}

export function NaviCompanion({ className = "" }: NaviCompanionProps) {
  const { currentState, getNaviInfo, getNaviImage } = useNaviState();
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("navi-visible");
    return saved === null ? true : JSON.parse(saved);
  });
  const [showMessage, setShowMessage] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState<string>("");
  const [previousState, setPreviousState] = useState(currentState);
  const [isAnimating, setIsAnimating] = useState(false);
  const happyMessages = [
    "¡Sos imparable hoy! 🦊✨",
    "¡Un hábito más, una sonrisa más! 😄",
    "¡Eso Navi lo celebra con una vueltita! 🎉",
    "¡Amo cuando cumplís cosas! 💛",
  ];

  // Cargar preferencia de visibilidad desde localStorage
  useEffect(() => {
    const savedVisibility = localStorage.getItem("navi-visible");
    if (savedVisibility !== null) {
      setIsVisible(JSON.parse(savedVisibility));
    }
  }, []);

  // Guardar preferencia cuando cambie
  useEffect(() => {
    localStorage.setItem("navi-visible", JSON.stringify(isVisible));
  }, [isVisible]);

  // Detectar cambios de estado para mostrar animación
  useEffect(() => {
    if (currentState !== previousState) {
      setIsAnimating(true);
      setPreviousState(currentState);

      // Mostrar notificación cuando cambie el estado (solo si está habilitado)
      const notificationsEnabled = localStorage.getItem("navi-notifications");
      const showNotifications =
        notificationsEnabled === null || JSON.parse(notificationsEnabled);

      if (showNotifications && currentState !== "default") {
        const naviInfo = getNaviInfo();
        toast({
          title: `Navi ${naviInfo.emoji}`,
          description: naviInfo.message,
          duration: 3000,
        });
      }

      // Resetear animación después de un tiempo
      setTimeout(() => setIsAnimating(false), 1000);
    }
  }, [currentState, previousState]); // Removido getNaviInfo de las dependencias

  // Auto-mostrar mensaje después de un tiempo
  useEffect(() => {
    const timer = setTimeout(() => {
      // Verificar si los mensajes automáticos están habilitados
      const autoMessagesEnabled = localStorage.getItem("navi-auto-messages");
      const showAutoMessages =
        autoMessagesEnabled === null || JSON.parse(autoMessagesEnabled);

      if (showAutoMessages && Math.random() < 0.3) {
        // 30% chance de mostrar mensaje
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 4000);
      }
    }, 10000 + Math.random() * 20000); // Entre 10-30 segundos

    return () => clearTimeout(timer);
  }, []);

  // Escuchar eventos globales de hábitos completados y día completado
  useEffect(() => {
    const handleHabitCompleted = () => {
      // Pequeña animación
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);

      // Mostrar mensaje motivacional personalizado
      setBubbleMessage(
        happyMessages[Math.floor(Math.random() * happyMessages.length)]
      );
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 4000);
    };

    const handleDayCompleted = () => {
      setBubbleMessage("¡Día completado! Navi está eufórico 🎉");
      setShowMessage(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1500);
      setTimeout(() => setShowMessage(false), 5000);
    };

    window.addEventListener("habit-completed", handleHabitCompleted);
    window.addEventListener("day-completed", handleDayCompleted);

    return () => {
      window.removeEventListener("habit-completed", handleHabitCompleted);
      window.removeEventListener("day-completed", handleDayCompleted);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  // Memoizar valores que se usan frecuentemente
  const naviInfo = getNaviInfo();
  const naviImage = getNaviImage();
  const finalMessage = bubbleMessage || naviInfo.message;

  const handleNaviClick = () => {
    setShowMessage(!showMessage);

    // Pequeña vibración en mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleHideNavi = () => {
    setIsVisible(false);
    toast({
      title: "Navi se ha escondido",
      description: "Puedes volver a mostrarlo desde el menú de configuración",
      duration: 3000,
    });
  };

  return (
    <>
      {/* Navi Flotante */}
      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
          isAnimating ? "scale-110" : "scale-100"
        } ${className}`}
      >
        {/* Burbuja de mensaje */}
        {showMessage && (
          <div className="absolute bottom-full right-0 mb-4 w-64 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <Card className="shadow-lg border-2 border-primary/20">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <span className="text-lg">{naviInfo.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Navi dice:</p>
                    <p className="text-xs text-muted-foreground">
                      {finalMessage}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMessage(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>

                {/* Flecha de la burbuja */}
                <div className="absolute top-full right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-background"></div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navi */}
        <div className="relative group">
          {/* Brillo especial para states especiales */}
          {(currentState === "celebrating" || currentState === "happy") && (
            <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-pulse scale-125"></div>
          )}

          {/* Imagen de Navi */}
          <div
            className={`relative w-16 h-16 sm:w-20 sm:h-20 cursor-pointer transition-all duration-300 hover:scale-105 ${
              isAnimating ? "animate-bounce" : ""
            } ${currentState === "celebrating" ? "animate-spin-slow" : ""}`}
            onClick={handleNaviClick}
          >
            <Image
              src={naviImage}
              alt={`Navi ${currentState}`}
              fill
              className="object-contain drop-shadow-lg"
              priority
            />

            {/* Indicador de estado */}
            <div
              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                currentState === "celebrating"
                  ? "bg-yellow-400 animate-pulse"
                  : currentState === "happy"
                  ? "bg-green-400"
                  : currentState === "sad"
                  ? "bg-red-400"
                  : currentState === "sick"
                  ? "bg-purple-400"
                  : currentState === "sleepy"
                  ? "bg-blue-400"
                  : "bg-gray-400"
              }`}
            ></div>
          </div>

          {/* Botones de acción (aparecen al hover) */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex gap-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleNaviClick}
                className="h-6 w-6 p-0 rounded-full shadow-md"
              >
                <MessageSquare className="h-3 w-3" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleHideNavi}
                className="h-6 w-6 p-0 rounded-full shadow-md"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Botón para mostrar Navi si está oculto */}
      {!isVisible && (
        <Button
          onClick={() => setIsVisible(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full w-12 h-12 p-0"
          title="Mostrar a Navi"
        >
          <Settings className="h-4 w-4" />
        </Button>
      )}
    </>
  );
}
