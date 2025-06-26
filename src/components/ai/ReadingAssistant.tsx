"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  BookOpen,
  Clock,
  Brain,
  Sparkles,
  Search,
  ExternalLink,
  Tag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";

interface ContentRecommendation {
  title: string;
  author: string;
  description: string;
  reason: string;
  category: string;
  estimatedTime: string;
  difficulty: "Principiante" | "Intermedio" | "Avanzado";
  type: "libro" | "artículo" | "podcast" | "blog" | "estudio" | "informe";
  link?: string;
  platform?: string; // Para podcasts: "Spotify", "Apple Podcasts", etc.
  source?: string; // Para artículos: "Nature", "Harvard Business Review", etc.
  tags: string[];
}

const ReadingAssistant: React.FC = () => {
  const [availableTime, setAvailableTime] = useState("30 min");
  const [preferredMood, setPreferredMood] = useState("⚡ Motivacional");
  const [contentType, setContentType] = useState("Cualquiera");
  const [topic, setTopic] = useState("");
  const [genre, setGenre] = useState("Cualquiera");
  const [recommendations, setRecommendations] = useState<
    ContentRecommendation[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const timeOptions = ["5 min", "15 min", "30 min", "1 hora", "2+ horas"];
  const moodOptions = [
    "⚡ Motivacional",
    "🧘 Relajante",
    "📚 Educativo",
    "✨ Inspirador",
    "🔧 Técnico",
  ];

  const contentTypeOptions = [
    "Cualquiera",
    "📚 Libros",
    "📄 Artículos",
    "🎧 Podcasts",
    "📝 Blogs",
    "🔬 Estudios científicos",
    "📊 Informes técnicos",
  ];

  const genreOptions = [
    "Cualquiera",
    "🤖 Inteligencia Artificial",
    "🧬 Biociencia y Medicina",
    "💼 Negocios y Emprendimiento",
    "🧠 Psicología y Desarrollo Personal",
    "💻 Tecnología y Programación",
    "🌍 Ciencia y Naturaleza",
    "📈 Finanzas e Inversión",
    "🎨 Creatividad y Arte",
    "⚖️ Filosofía y Ética",
    "🏃‍♂️ Salud y Bienestar",
  ];

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      console.log("🔍 Solicitando recomendaciones con filtros...", {
        availableTime,
        preferredMood,
        contentType,
        topic,
        genre,
      });

      const response = await apiClient.post<ContentRecommendation[]>(
        "/reading-recommendations",
        {
          availableTime,
          preferredMood,
          contentType,
          topic,
          genre,
        }
      );

      if (response.success && response.data) {
        setRecommendations(response.data);
        toast({
          title: "✨ Recomendaciones generadas",
          description: `Se encontraron ${response.data.length} recomendaciones perfectas para ti 📚`,
        });

        console.log("✅ Recomendaciones recibidas:", response.data);
      } else {
        throw new Error(
          (response as any).error || "Error obteniendo recomendaciones"
        );
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast({
        title: "❌ Error",
        description:
          "No se pudieron obtener las recomendaciones. Intenta de nuevo.",
        variant: "destructive",
      });

      // Fallback con recomendaciones básicas en caso de error
      setRecommendations([
        {
          title: "Hábitos Atómicos",
          author: "James Clear",
          description:
            "Estrategias prácticas para formar buenos hábitos y romper los malos.",
          reason: "Perfecto para optimizar tu sistema de hábitos",
          category: "Desarrollo Personal",
          estimatedTime: "6-8 horas",
          difficulty: "Principiante",
          type: "libro",
          tags: ["hábitos", "productividad", "desarrollo personal"],
        },
      ] as ContentRecommendation[]);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Principiante":
        return "text-green-600 bg-green-50 border-green-200";
      case "Intermedio":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Avanzado":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "libro":
        return "📚";
      case "artículo":
        return "📄";
      case "podcast":
        return "🎧";
      case "blog":
        return "📝";
      case "estudio":
        return "🔬";
      case "informe":
        return "📊";
      default:
        return "📕";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "libro":
        return "border-l-blue-500";
      case "artículo":
        return "border-l-green-500";
      case "podcast":
        return "border-l-purple-500";
      case "blog":
        return "border-l-orange-500";
      case "estudio":
        return "border-l-red-500";
      case "informe":
        return "border-l-indigo-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          Asistente de Lectura IA Avanzado
        </CardTitle>
        <p className="text-gray-600">
          Obtén recomendaciones personalizadas de contenido (libros, artículos,
          podcasts, blogs, estudios) basadas en tus preferencias y tiempo
          disponible
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Controles de preferencias mejorados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tiempo disponible
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {availableTime}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuRadioGroup
                  value={availableTime}
                  onValueChange={setAvailableTime}
                >
                  {timeOptions.map((time) => (
                    <DropdownMenuRadioItem key={time} value={time}>
                      {time}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Estado de ánimo
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {preferredMood}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuRadioGroup
                  value={preferredMood}
                  onValueChange={setPreferredMood}
                >
                  {moodOptions.map((mood) => (
                    <DropdownMenuRadioItem key={mood} value={mood}>
                      {mood}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tipo de contenido
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {contentType}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuRadioGroup
                  value={contentType}
                  onValueChange={setContentType}
                >
                  {contentTypeOptions.map((type) => (
                    <DropdownMenuRadioItem key={type} value={type}>
                      {type}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Segunda fila de filtros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Género/Tema
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {genre}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                <DropdownMenuRadioGroup value={genre} onValueChange={setGenre}>
                  {genreOptions.map((genreOption) => (
                    <DropdownMenuRadioItem
                      key={genreOption}
                      value={genreOption}
                    >
                      {genreOption}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Búsqueda específica (opcional)
            </label>
            <Input
              placeholder="ej: machine learning, biohacking, startups..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Botón para generar recomendaciones */}
        <Button
          onClick={fetchRecommendations}
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generando recomendaciones con IA...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Obtener Recomendaciones Personalizadas
            </>
          )}
        </Button>

        {/* Lista de recomendaciones */}
        {recommendations.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              ✨ Recomendaciones para ti ({recommendations.length} resultados)
            </h3>
            <div className="grid gap-4">
              {recommendations.map((content, index) => (
                <Card
                  key={index}
                  className={`border-l-4 ${getTypeColor(
                    content.type
                  )} hover:shadow-md transition-shadow`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg flex items-center gap-2 mb-1">
                          {getTypeIcon(content.type)}
                          {content.title}
                          {content.link && (
                            <a
                              href={content.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </h4>
                        <p className="text-gray-600 font-medium">
                          por {content.author}
                          {content.source && (
                            <span className="text-sm text-gray-500 ml-2">
                              • {content.source}
                            </span>
                          )}
                          {content.platform && (
                            <span className="text-sm text-gray-500 ml-2">
                              • {content.platform}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
                            content.difficulty
                          )}`}
                        >
                          {content.difficulty}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {content.estimatedTime}
                        </span>
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {content.type}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-3">{content.description}</p>

                    <div className="bg-blue-50 p-3 rounded-lg mb-3">
                      <p className="text-sm text-blue-800">
                        <strong>¿Por qué es perfecto para ti?</strong>{" "}
                        {content.reason}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {content.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Botón de acceso */}
                    {content.link && (
                      <Button
                        asChild
                        variant="default"
                        size="sm"
                        className="w-full"
                      >
                        <a
                          href={content.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          {content.type === "podcast"
                            ? "🎧 Escuchar"
                            : content.type === "libro"
                            ? "📚 Ver detalles"
                            : "📖 Leer ahora"}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {recommendations.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">
              ¡Descubre contenido personalizado para ti!
            </p>
            <p className="text-sm">
              Ajusta los filtros y haz clic en "Obtener Recomendaciones" para
              encontrar libros, artículos, podcasts y más contenido adaptado a
              tus intereses
            </p>
          </div>
        )}

        {/* Mensaje cuando no hay resultados después de filtrar */}
        {recommendations.length === 0 &&
          !isLoading &&
          (topic.trim() ||
            contentType !== "Cualquiera" ||
            genre !== "Cualquiera") && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <p className="text-yellow-800 text-sm">
                💡 <strong>Tip:</strong> Si no encuentras resultados, intenta:
              </p>
              <ul className="text-yellow-700 text-sm mt-2 list-disc list-inside">
                <li>Ampliar el tiempo disponible</li>
                <li>Cambiar el tipo de contenido a "Cualquiera"</li>
                <li>Usar términos de búsqueda más generales</li>
                <li>Seleccionar un género diferente</li>
              </ul>
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default ReadingAssistant;
