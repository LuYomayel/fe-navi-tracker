"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useXp } from "./useXp";
import { useNaviTrackerStore } from "@/store";

export type NaviState =
  | "celebrating" // Subió de nivel o logro importante
  | "happy" // Ganó XP hoy o completó actividades
  | "excited" // Racha activa o semana perfecta
  | "proud" // Objetivos nutricionales cumplidos
  | "sad" // Rompió racha
  | "sick" // Más de 3 días sin actividad
  | "sleepy" // 1 día sin actividad
  | "default"; // Estado normal

export interface NaviStateInfo {
  state: NaviState;
  image: string;
  message: string;
  emoji: string;
}

export function useNaviState() {
  const { xpStats, isLevelingUp } = useXp();
  // Usar selector específico en lugar de todo el store
  const activities = useNaviTrackerStore((state) => state.activities);
  const completions = useNaviTrackerStore((state) => state.completions);
  // Estado inicial: intentamos leer el último estado guardado en localStorage para evitar "parpadeo".
  const [currentState, setCurrentState] = useState<NaviState>(() => {
    if (typeof window === "undefined") return "default";
    const saved = localStorage.getItem("navi-current-state");
    console.log("saved", saved);
    if (
      saved === "celebrating" ||
      saved === "happy" ||
      saved === "sad" ||
      saved === "sick" ||
      saved === "sleepy" ||
      saved === "excited" ||
      saved === "proud" ||
      saved === "default"
    ) {
      return saved as NaviState;
    }
    return "default";
  });
  const [stateMessage, setStateMessage] = useState<string>("");

  // Determinar el estado de Navi basado en la actividad del usuario
  const determineNaviState = useCallback((): NaviStateInfo => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Estado 1: Celebrando (subió de nivel o logro importante)
    if (isLevelingUp) {
      return {
        state: "celebrating",
        image: "/Navi_celebrating.png",
        message: "¡Felicidades! ¡Subiste de nivel! 🎉",
        emoji: "🎉",
      };
    }

    // Estado 2: Emocionado (racha activa de 7+ días o semana perfecta)
    if (xpStats?.streak && xpStats.streak >= 7) {
      const excitedMessages = [
        "¡Tu racha es increíble! ¡Sigue así! 🚀",
        "¡Estoy súper emocionado por tu constancia! ⭐",
        "¡Eres imparable! ¡Vamos por más! 🔥",
        "¡Tu dedicación me inspira! 💫",
      ];
      return {
        state: "excited",
        image: "/Navi_celebrating.png",
        message:
          excitedMessages[Math.floor(Math.random() * excitedMessages.length)],
        emoji: "🚀",
      };
    }

    // Estado 3: Orgulloso (racha de 3-6 días o buen progreso)
    if (xpStats?.streak && xpStats.streak >= 3) {
      const proudMessages = [
        "¡Estoy orgulloso de tu constancia! 🌟",
        "¡Tu progreso es admirable! ✨",
        "¡Cada día mejor! ¡Excelente! 💖",
        "¡Tu esfuerzo está dando frutos! 🎯",
      ];
      return {
        state: "proud",
        image: "/Navi_happy.png",
        message:
          proudMessages[Math.floor(Math.random() * proudMessages.length)],
        emoji: "🌟",
      };
    }

    // Estado 4: Feliz (ganó XP hoy o completó actividades)

    const completionsToday = activities
      .flatMap((activity) => activity.completions || [])
      .filter((completion) => completion.date === today);

    if (completionsToday && xpStats?.xp && xpStats.xp > 0) {
      const messages = [
        "¡Excelente trabajo hoy! 😊",
        "¡Estoy muy feliz por ti! ✨",
        "¡Sigue así, lo estás haciendo genial! 🌟",
        "¡Tu progreso me hace feliz! 💖",
      ];
      return {
        state: "happy",
        image: "/Navi_happy.png",
        message: messages[Math.floor(Math.random() * messages.length)],
        emoji: "😊",
      };
    }

    // Estado 5: Triste (rompió racha)
    if (xpStats?.streak === 0 && xpStats?.lastStreakDate) {
      const daysSinceLastStreak = Math.floor(
        (Date.now() - new Date(xpStats.lastStreakDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastStreak <= 2) {
        return {
          state: "sad",
          image: "/Navi_sad.png",
          message: "No te preocupes, ¡mañana es un nuevo día! 😢",
          emoji: "😢",
        };
      }
    }

    // Estado 6: Enfermo (más de 3 días sin actividad)
    const hasActivityInLastThreeDays = completions.some(
      (c) => c.date >= threeDaysAgo && c.completed
    );

    if (!hasActivityInLastThreeDays) {
      return {
        state: "sick",
        image: "/Navi_sick.png",
        message: "Te extraño... ¿podrías completar un hábito? 🤒",
        emoji: "🤒",
      };
    }

    // Estado 7: Somnoliento (1 día sin actividad)
    const completionsYesterday = activities
      .flatMap((activity) => activity.completions || [])
      .filter((completion) => completion.date === yesterday);

    if (!completionsToday && !completionsYesterday) {
      return {
        state: "sleepy",
        image: "/Navi_sleepy.png",
        message: "Tengo un poco de sueño... ¿vamos a hacer algo? 😴",
        emoji: "😴",
      };
    }

    // Estado por defecto
    const defaultMessages = [
      "Hola, ¿cómo está tu día? 👋",
      "Estoy aquí para acompañarte 💫",
      "Vamos a hacer algo juntos 🌟",
      "Tu compañero Navi está aquí ✨",
    ];

    return {
      state: "default",
      image: "/Navi.png",
      message:
        defaultMessages[Math.floor(Math.random() * defaultMessages.length)],
      emoji: "✨",
    };
  }, [isLevelingUp, completions, xpStats]);

  // Memoizar la información de Navi para evitar recálculos constantes
  const naviInfo = useMemo((): NaviStateInfo => {
    return determineNaviState();
  }, [isLevelingUp, completions, xpStats]);

  // Actualizar estado cuando cambien las dependencias directas
  useEffect(() => {
    setCurrentState(naviInfo.state);
    setStateMessage(naviInfo.message);
  }, [naviInfo]); // Solo depende del naviInfo memoizado

  // Después de currentState state update effect
  useEffect(() => {
    // Persistir estado en localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("navi-current-state", currentState);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("navi-state-change", { detail: currentState })
      );
    }
  }, [currentState]);

  // Función para obtener información completa del estado actual
  const getNaviInfo = useCallback((): NaviStateInfo => {
    return naviInfo;
  }, [naviInfo]);

  // Función para obtener solo la imagen
  const getNaviImage = useCallback((): string => {
    const stateMap: Record<NaviState, string> = {
      celebrating: "/Navi_celebrating.png",
      happy: "/Navi_happy.png",
      excited: "/Navi_celebrating.png", // Usar celebrating para excited también
      proud: "/Navi_happy.png", // Usar happy para proud también
      sad: "/Navi_sad.png",
      sick: "/Navi_sick.png",
      sleepy: "/Navi_sleepy.png",
      default: "/Navi.png",
    };
    return stateMap[currentState];
  }, [currentState]);

  // Función para generar consejos basados en el estado
  const getNaviAdvice = useCallback((): string[] => {
    switch (currentState) {
      case "celebrating":
        return [
          "¡Has alcanzado un nuevo nivel! Tu constancia está dando frutos.",
          "Este momento merece una pequeña celebración. ¡Sigue así!",
          "Tu progreso es inspirador. ¡Continuemos creciendo juntos!",
          "Los logros como este demuestran tu dedicación. ¡Increíble!",
        ];

      case "excited":
        return [
          "¡Tu racha es impresionante! Eres un ejemplo de constancia.",
          "Esta energía que tienes es contagiosa. ¡Me emociona verte así!",
          "Estás en una racha increíble. ¡Vamos por más días perfectos!",
          "Tu dedicación semanal es admirable. ¡Sigues superándote!",
        ];

      case "proud":
        return [
          "Estoy muy orgulloso de tu progreso consistente.",
          "Tu esfuerzo diario está construyendo algo hermoso.",
          "Cada día que mantienes tu rutina, te acercas más a tus metas.",
          "Tu constancia de estos días es realmente admirable.",
        ];

      case "happy":
        return [
          "Tu energía positiva de hoy me contagia. ¡Excelente trabajo!",
          "Cada hábito completado es un paso hacia tus metas.",
          "Me encanta verte tan motivado. ¡Sigamos así!",
          "Hoy has demostrado que puedes lograr lo que te propongas.",
        ];

      case "sad":
        return [
          "Todos tenemos días difíciles. Lo importante es no rendirse.",
          "Una racha rota no define tu progreso. ¡Empecemos una nueva!",
          "Mañana es una nueva oportunidad para brillar.",
        ];

      case "sick":
        return [
          "Te he extrañado mucho. ¿Qué tal si empezamos con algo pequeño?",
          "No necesitas hacer todo de una vez. Un pequeño paso cuenta.",
          "Estoy aquí para apoyarte. Vamos paso a paso.",
        ];

      case "sleepy":
        return [
          "Un pequeño hábito puede despertarnos a ambos.",
          "¿Qué tal si hacemos algo rápido y fácil juntos?",
          "Incluso los días tranquilos pueden ser productivos.",
        ];

      default:
        return [
          "Estoy aquí para acompañarte en tu jornada diaria.",
          "Cada día es una nueva oportunidad de crecimiento.",
          "Juntos podemos lograr grandes cosas, paso a paso.",
        ];
    }
  }, [currentState]);

  return {
    currentState,
    setCurrentState,
    stateMessage,
    getNaviInfo,
    getNaviImage,
    getNaviAdvice,
    isLevelingUp,
  };
}
