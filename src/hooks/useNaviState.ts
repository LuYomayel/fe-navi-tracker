"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useXp } from "./useXp";
import { useNaviTrackerStore } from "@/store";
import { getDateKey } from "@/lib/utils";

export type NaviState =
  | "celebrating" // Subió de nivel o logro importante
  | "happy" // Ganó XP hoy o completó actividades
  | "excited" // Racha activa de 7+ días (cualquier categoría)
  | "proud" // Racha activa de 3+ días (cualquier categoría)
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

// Mensajes estáticos por estado para evitar randomness en render
const STATE_MESSAGES: Record<NaviState, { messages: string[]; emoji: string }> =
  {
    celebrating: {
      messages: [
        "¡Felicidades! ¡Subiste de nivel! 🎉",
        "¡Increíble logro! ¡Sigue así! 🎉",
        "¡Este momento es épico! 🎉",
      ],
      emoji: "🎉",
    },
    excited: {
      messages: [
        "¡Tu racha es increíble! ¡Sigue así! 🚀",
        "¡Estoy súper emocionado por tu constancia! ⭐",
        "¡Eres imparable! ¡Vamos por más! 🔥",
        "¡Tu dedicación me inspira! 💫",
      ],
      emoji: "🚀",
    },
    proud: {
      messages: [
        "¡Estoy orgulloso de tu constancia! 🌟",
        "¡Tu progreso es admirable! ✨",
        "¡Cada día mejor! ¡Excelente! 💖",
        "¡Tu esfuerzo está dando frutos! 🎯",
      ],
      emoji: "🌟",
    },
    happy: {
      messages: [
        "¡Excelente trabajo hoy! 😊",
        "¡Estoy muy feliz por ti! ✨",
        "¡Sigue así, lo estás haciendo genial! 🌟",
        "¡Tu progreso me hace feliz! 💖",
      ],
      emoji: "😊",
    },
    sad: {
      messages: [
        "No te preocupes, ¡mañana es un nuevo día! 😢",
        "Todos tenemos días difíciles. ¡Ánimo! 😢",
      ],
      emoji: "😢",
    },
    sick: {
      messages: [
        "Te extraño... ¿podrías completar un hábito? 🤒",
        "Estoy un poco enfermo sin verte... 🤒",
      ],
      emoji: "🤒",
    },
    sleepy: {
      messages: [
        "Tengo un poco de sueño... ¿vamos a hacer algo? 😴",
        "Un pequeño hábito puede despertarnos a ambos 😴",
      ],
      emoji: "😴",
    },
    default: {
      messages: [
        "Hola, ¿cómo está tu día? 👋",
        "Estoy aquí para acompañarte 💫",
        "Vamos a hacer algo juntos 🌟",
        "Tu compañero Navi está aquí ✨",
      ],
      emoji: "✨",
    },
  };

const STATE_IMAGES: Record<NaviState, string> = {
  celebrating: "/Navi_celebrating.png",
  excited: "/Navi_celebrating.png",
  happy: "/Navi_happy.png",
  proud: "/Navi_happy.png",
  sad: "/Navi_sad.png",
  sick: "/Navi_sick.png",
  sleepy: "/Navi_sleepy.png",
  default: "/Navi.png",
};

/**
 * Selecciona un mensaje estable basado en un seed que cambia cada minuto
 * para evitar re-renders con Math.random() en useMemo
 */
function getStableMessage(state: NaviState): string {
  const messages = STATE_MESSAGES[state].messages;
  const minuteSeed = Math.floor(Date.now() / 60000);
  return messages[minuteSeed % messages.length];
}

/**
 * Obtiene la mejor racha entre las 3 categorías
 */
function getBestStreak(xpStats: {
  streak: number;
  streaks?: {
    habits: { streak: number; lastDate: string | null };
    nutrition: { streak: number; lastDate: string | null };
    activity: { streak: number; lastDate: string | null };
  };
}): number {
  if (!xpStats.streaks) return xpStats.streak;
  return Math.max(
    xpStats.streaks.habits.streak,
    xpStats.streaks.nutrition.streak,
    xpStats.streaks.activity.streak,
    xpStats.streak // legacy fallback
  );
}

export function useNaviState() {
  const { xpStats, isLevelingUp } = useXp();
  const activities = useNaviTrackerStore((state) => state.activities);
  const completions = useMemo(
    () => activities.flatMap((a) => a.completions || []),
    [activities]
  );

  const [currentState, setCurrentState] = useState<NaviState>(() => {
    if (typeof window === "undefined") return "default";
    const saved = localStorage.getItem("navi-current-state");
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
  const determineNaviState = useCallback((): NaviState => {
    const today = getDateKey(new Date());
    const threeDaysAgo = getDateKey(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000));

    // Estado 1: Celebrando (subió de nivel)
    if (isLevelingUp) {
      return "celebrating";
    }

    // Obtener la mejor racha entre todas las categorías
    const bestStreak = xpStats ? getBestStreak(xpStats) : 0;

    // Estado 2: Emocionado (racha activa de 7+ días en cualquier categoría)
    if (bestStreak >= 7) {
      return "excited";
    }

    // Estado 3: Orgulloso (racha de 3-6 días en cualquier categoría)
    if (bestStreak >= 3) {
      return "proud";
    }

    // Estado 4: Feliz (completó actividades hoy Y tiene XP en nivel actual)
    const completionsToday = completions.filter(
      (c) => c.date === today && c.completed
    );

    if (completionsToday.length > 0 && xpStats?.xp && xpStats.xp > 0) {
      return "happy";
    }

    // Estado 5: Triste (rompió racha recientemente)
    if (xpStats?.streak === 0 && xpStats?.lastStreakDate) {
      const daysSinceLastStreak = Math.floor(
        (Date.now() - new Date(xpStats.lastStreakDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastStreak <= 2) {
        return "sad";
      }
    }

    // Estado 6: Enfermo (más de 3 días sin ninguna actividad completada)
    const hasActivityInLastThreeDays = completions.some(
      (c) => c.date >= threeDaysAgo && c.completed
    );

    if (!hasActivityInLastThreeDays && completions.length > 0) {
      return "sick";
    }

    // Estado 7: Somnoliento (sin completions hoy)
    const hasCompletionsToday = completions.some(
      (c) => c.date === today && c.completed
    );
    if (!hasCompletionsToday && completions.length > 0) {
      return "sleepy";
    }

    // Estado por defecto
    return "default";
  }, [isLevelingUp, completions, xpStats]);

  // Memoizar el estado calculado
  const calculatedState = useMemo(
    () => determineNaviState(),
    [determineNaviState]
  );

  // Construir naviInfo estable
  const naviInfo = useMemo((): NaviStateInfo => {
    return {
      state: calculatedState,
      image: STATE_IMAGES[calculatedState],
      message: getStableMessage(calculatedState),
      emoji: STATE_MESSAGES[calculatedState].emoji,
    };
  }, [calculatedState]);

  // Actualizar estado cuando cambien las dependencias
  useEffect(() => {
    setCurrentState(naviInfo.state);
    setStateMessage(naviInfo.message);
  }, [naviInfo]);

  // Persistir estado en localStorage y disparar evento
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("navi-current-state", currentState);
      window.dispatchEvent(
        new CustomEvent("navi-state-change", { detail: currentState })
      );
    }
  }, [currentState]);

  const getNaviInfo = useCallback((): NaviStateInfo => {
    return naviInfo;
  }, [naviInfo]);

  const getNaviImage = useCallback((): string => {
    return STATE_IMAGES[currentState];
  }, [currentState]);

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
