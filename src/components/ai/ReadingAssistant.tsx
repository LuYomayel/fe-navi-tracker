"use client";

import { useState, useEffect } from "react";
import {
  Book,
  Clock,
  TrendingUp,
  Star,
  ExternalLink,
  Sparkles,
  Heart,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNaviTrackerStore } from "@/store";
import { api } from "@/lib/api-client";
import type { Analysis } from "@/types";
import { toast } from "@/hooks/use-toast";

interface ReadingRecommendation {
  id: string;
  title: string;
  author?: string;
  type: "book" | "article" | "newsletter" | "podcast";
  duration: string; // "5 min", "2 horas", etc.
  difficulty: "fácil" | "intermedio" | "avanzado";
  mood: "motivacional" | "relajante" | "educativo" | "inspirador" | "técnico";
  tags: string[];
  description: string;
  url?: string;
  rating: number; // 1-5
  reasonForRecommendation: string;
}

interface ReadingAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_RECOMMENDATIONS: ReadingRecommendation[] = [
  {
    id: "1",
    title: "Hábitos Atómicos",
    author: "James Clear",
    type: "book",
    duration: "2-3 horas",
    difficulty: "fácil",
    mood: "motivacional",
    tags: ["hábitos", "productividad", "desarrollo personal"],
    description:
      "Un enfoque revolucionario para formar buenos hábitos y romper los malos.",
    rating: 5,
    reasonForRecommendation:
      "Perfecto para alguien que está construyendo rutinas diarias",
  },
  {
    id: "2",
    title: "La Ciencia del Sueño",
    author: "Matthew Walker",
    type: "article",
    duration: "10 min",
    difficulty: "intermedio",
    mood: "educativo",
    tags: ["sueño", "salud", "ciencia"],
    description:
      "Descubre por qué dormimos y cómo mejorar la calidad de tu descanso.",
    url: "https://example.com/sleep-science",
    rating: 4,
    reasonForRecommendation:
      "Has mencionado problemas de sueño en tus reflexiones recientes",
  },
  {
    id: "3",
    title: "Meditación para Principiantes",
    author: "Headspace",
    type: "podcast",
    duration: "15 min",
    difficulty: "fácil",
    mood: "relajante",
    tags: ["meditación", "mindfulness", "bienestar"],
    description:
      "Una introducción práctica a la meditación y técnicas de relajación.",
    rating: 4,
    reasonForRecommendation:
      "Te ayudará con el estrés que has estado experimentando",
  },
  {
    id: "4",
    title: "Newsletter de Productividad",
    author: "Productivity Hub",
    type: "newsletter",
    duration: "5 min",
    difficulty: "fácil",
    mood: "motivacional",
    tags: ["productividad", "tips", "organización"],
    description: "Tips semanales para optimizar tu tiempo y energía.",
    rating: 4,
    reasonForRecommendation:
      "Te ayudará con la organización que mencionaste como desafío",
  },
];

export function ReadingAssistant({ isOpen, onClose }: ReadingAssistantProps) {
  const [availableTime, setAvailableTime] = useState<string>("15");
  const [preferredMood, setPreferredMood] = useState<string>("educativo");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<
    ReadingRecommendation[]
  >([]);

  const { activities, dailyNotes, addActivity } = useNaviTrackerStore();

  // Detectar si el usuario tiene hábito de lectura activo
  const hasReadingHabit = activities.some(
    (activity) =>
      activity.name.toLowerCase().includes("leer") ||
      activity.category?.toLowerCase().includes("lectura")
  );

  // Función para agregar hábito de lectura
  const handleAddReadingHabit = async () => {
    try {
      await addActivity({
        name: "Leer",
        description: "Tiempo dedicado a la lectura diaria",
        time: "20:00", // 8 PM por defecto
        days: [true, true, true, true, true, true, true], // Todos los días
        color: "#3B82F6", // Azul
        category: "lectura",
      });

      // Cerrar el modal después de agregar el hábito
      onClose();

      // Opcional: mostrar notificación de éxito
      toast({
        title: "¡Hábito de lectura agregado exitosamente!",
        description: "Ahora puedes recibir recomendaciones de lectura",
      });
    } catch (error) {
      console.error("❌ Error agregando hábito de lectura:", error);
      toast({
        title: "Error agregando hábito de lectura",
        description:
          typeof error === "string"
            ? error
            : "Intenta nuevamente, si el problema persiste, contacta al soporte",
      });
    }
  };

  // Función que simula un endpoint para obtener análisis recientes
  const getRecentAnalysis = async (days: number) => {
    try {
      // ✅ NUEVO: Usar el endpoint real del backend
      const response = await api.analysis.getRecent(days);
      return response.analyses || [];
    } catch (error) {
      console.error("❌ Error obteniendo análisis recientes:", error);

      // 📦 FALLBACK: Por ahora, simulamos con datos locales
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentNotes = dailyNotes.filter((note) => {
        const noteDate = new Date(note.date);
        return noteDate >= cutoffDate;
      });

      return recentNotes.map((note) => ({
        id: note.id,
        date: note.date,
        detectedPatterns: extractPatternsFromNote(note),
        mood: note.mood,
        createdAt: note.createdAt,
      }));
    }
  };

  // Función para extraer patrones de las notas (esta iría en el backend)
  const extractPatternsFromNote = (note: {
    content?: string;
    customComment?: string;
  }): string[] => {
    const patterns: string[] = [];
    const content = note.content?.toLowerCase() || "";
    const customComment = note.customComment?.toLowerCase() || "";
    const allText = `${content} ${customComment}`;

    // Detectar patrones básicos basados en palabras clave
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

  const interests = [
    "desarrollo personal",
    "productividad",
    "ciencia",
    "tecnología",
    "salud",
    "bienestar",
    "meditación",
    "ejercicio",
    "nutrición",
    "creatividad",
    "arte",
    "historia",
    "filosofía",
    "negocios",
  ];

  const moodOptions = [
    { value: "motivacional", label: "Motivacional", emoji: "⚡" },
    { value: "relajante", label: "Relajante", emoji: "🧘" },
    { value: "educativo", label: "Educativo", emoji: "📚" },
    { value: "inspirador", label: "Inspirador", emoji: "✨" },
    { value: "técnico", label: "Técnico", emoji: "🔧" },
  ];

  useEffect(() => {
    if (isOpen) {
      generateRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, availableTime, preferredMood, selectedInterests]);

  const generateRecommendations = async () => {
    // En un entorno de producción, esto se conectaría con una API real
    // Por ahora, filtraremos las recomendaciones de muestra

    const filtered = SAMPLE_RECOMMENDATIONS.filter((rec) => {
      // Filtrar por tiempo disponible
      const recDuration = parseDuration(rec.duration);
      const availableDuration = parseInt(availableTime);

      if (recDuration > availableDuration * 1.5) return false;

      // Filtrar por mood si coincide
      if (rec.mood === preferredMood) return true;

      // Filtrar por intereses seleccionados
      if (
        selectedInterests.some((interest) =>
          rec.tags.some((tag) =>
            tag.toLowerCase().includes(interest.toLowerCase())
          )
        )
      )
        return true;

      return selectedInterests.length === 0; // Si no hay intereses seleccionados, mostrar todo
    });

    // Agregar recomendaciones basadas en el estado emocional reciente
    const recentAnalyses = await getRecentAnalysis(7);
    if (recentAnalyses.length > 0) {
      const patterns = recentAnalyses.flatMap(
        (analysis: Analysis) => analysis.detectedPatterns
      );

      if (patterns.includes("sleep_issues")) {
        filtered.unshift(SAMPLE_RECOMMENDATIONS[1]); // Artículo sobre sueño
      }

      if (patterns.includes("stress_pattern")) {
        filtered.unshift(SAMPLE_RECOMMENDATIONS[2]); // Podcast de meditación
      }

      if (patterns.includes("organization_issues")) {
        filtered.unshift(SAMPLE_RECOMMENDATIONS[3]); // Newsletter de productividad
      }
    }

    // Eliminar duplicados y limitar a 6 recomendaciones
    const unique = filtered
      .filter(
        (rec, index, self) => index === self.findIndex((r) => r.id === rec.id)
      )
      .slice(0, 6);

    setRecommendations(unique);
  };

  const parseDuration = (duration: string): number => {
    // Convertir duración a minutos para comparación
    if (duration.includes("min")) {
      return parseInt(duration.match(/\d+/)?.[0] || "0");
    }
    if (duration.includes("hora")) {
      return parseInt(duration.match(/\d+/)?.[0] || "0") * 60;
    }
    return 30; // default
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const getTypeIcon = (type: ReadingRecommendation["type"]) => {
    switch (type) {
      case "book":
        return <Book className="h-4 w-4" />;
      case "article":
        return <ExternalLink className="h-4 w-4" />;
      case "newsletter":
        return <TrendingUp className="h-4 w-4" />;
      case "podcast":
        return <Heart className="h-4 w-4" />;
      default:
        return <Book className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "fácil":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      case "intermedio":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20";
      case "avanzado":
        return "text-red-600 bg-red-100 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  if (!hasReadingHabit) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Asistente de Lectura
            </DialogTitle>
          </DialogHeader>

          <div className="text-center py-8">
            <Book className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              ¡Activa el hábito de lectura!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Para recibir recomendaciones personalizadas, primero agrega un
              hábito de lectura a tu rutina.
            </p>
            <Button onClick={handleAddReadingHabit}>
              Agregar hábito de lectura
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Asistente de Lectura Personalizado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configuración de preferencias */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tiempo disponible */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 font-medium">
                <Clock className="h-4 w-4" />
                ¿Cuánto tiempo tienes?
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {availableTime === "5" && "5 minutos"}
                    {availableTime === "15" && "15 minutos"}
                    {availableTime === "30" && "30 minutos"}
                    {availableTime === "60" && "1 hora"}
                    {availableTime === "120" && "2+ horas"}
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuRadioGroup
                    value={availableTime}
                    onValueChange={setAvailableTime}
                  >
                    <DropdownMenuRadioItem value="5">
                      5 minutos
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="15">
                      15 minutos
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="30">
                      30 minutos
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="60">
                      1 hora
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="120">
                      2+ horas
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Estado de ánimo */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 font-medium">
                <Heart className="h-4 w-4" />
                ¿Cómo te sientes hoy?
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {
                      moodOptions.find(
                        (option) => option.value === preferredMood
                      )?.emoji
                    }{" "}
                    {
                      moodOptions.find(
                        (option) => option.value === preferredMood
                      )?.label
                    }
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuRadioGroup
                    value={preferredMood}
                    onValueChange={setPreferredMood}
                  >
                    {moodOptions.map((option) => (
                      <DropdownMenuRadioItem
                        key={option.value}
                        value={option.value}
                      >
                        <span className="flex items-center gap-2">
                          <span>{option.emoji}</span>
                          <span>{option.label}</span>
                        </span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Intereses */}
          <div className="space-y-3">
            <label className="font-medium">Temas de interés</label>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <Button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedInterests.includes(interest)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {interest}
                </Button>
              ))}
            </div>
          </div>

          {/* Recomendaciones */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Recomendaciones Personalizadas
            </h3>

            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Ajusta tus preferencias para ver recomendaciones
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(rec.type)}
                        <span className="font-medium">{rec.title}</span>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: rec.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>

                    {rec.author && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        por {rec.author}
                      </p>
                    )}

                    <p className="text-sm mb-3">{rec.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded">
                        {rec.duration}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${getDifficultyColor(
                          rec.difficulty
                        )}`}
                      >
                        {rec.difficulty}
                      </span>
                      <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 rounded">
                        {rec.mood}
                      </span>
                    </div>

                    <div className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                      💡 {rec.reasonForRecommendation}
                    </div>

                    {rec.url && (
                      <Button size="sm" variant="outline" className="w-full">
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Leer ahora
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
