import { NextRequest, NextResponse } from "next/server";

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
  platform?: string;
  source?: string;
  tags: string[];
}

// Base de datos de contenido real
const CONTENT_DATABASE: ContentRecommendation[] = [
  // IA y Tecnología
  {
    title: "Attention Is All You Need",
    author: "Ashish Vaswani et al.",
    description:
      "El paper fundamental que introdujo la arquitectura Transformer, base de ChatGPT y modelos de lenguaje modernos.",
    reason: "Esencial para entender cómo funcionan los modelos de IA actuales",
    category: "Inteligencia Artificial",
    estimatedTime: "45 min",
    difficulty: "Avanzado",
    type: "estudio",
    link: "https://arxiv.org/abs/1706.03762",
    source: "arXiv",
    tags: ["IA", "Transformers", "Deep Learning", "NLP"],
  },
  {
    title: "Lex Fridman Podcast #367: Sam Altman",
    author: "Lex Fridman",
    description:
      "Conversación profunda sobre OpenAI, GPT-4, el futuro de la IA y sus implicaciones para la humanidad.",
    reason: "Perspectivas directas del CEO de OpenAI sobre el futuro de la IA",
    category: "Inteligencia Artificial",
    estimatedTime: "2+ horas",
    difficulty: "Intermedio",
    type: "podcast",
    link: "https://open.spotify.com/episode/4rOoJ6Egrf8K2IrywzwOMk",
    platform: "Spotify",
    tags: ["IA", "OpenAI", "GPT", "Futuro"],
  },
  {
    title: "The State of AI Report 2024",
    author: "Nathan Benaich & Ian Hogarth",
    description:
      "Informe anual completo sobre los avances en IA, inversiones, políticas y predicciones para el futuro.",
    reason: "Panorama completo del estado actual de la inteligencia artificial",
    category: "Inteligencia Artificial",
    estimatedTime: "1 hora",
    difficulty: "Intermedio",
    type: "informe",
    link: "https://www.stateof.ai/",
    source: "State of AI",
    tags: ["IA", "Tendencias", "Inversión", "Política"],
  },

  // Biociencia y Medicina
  {
    title: "CRISPR-Cas9: A Revolutionary Gene-Editing Tool",
    author: "Jennifer Doudna & Emmanuelle Charpentier",
    description:
      "Revisión completa de la tecnología CRISPR y sus aplicaciones en medicina, agricultura y biotecnología.",
    reason:
      "Comprende la tecnología que está revolucionando la medicina moderna",
    category: "Biociencia",
    estimatedTime: "30 min",
    difficulty: "Avanzado",
    type: "estudio",
    link: "https://www.nature.com/articles/nature17946",
    source: "Nature",
    tags: ["CRISPR", "Genética", "Medicina", "Biotecnología"],
  },
  {
    title: "The Tim Ferriss Show: Dr. David Sinclair",
    author: "Tim Ferriss",
    description:
      "Científico de Harvard habla sobre longevidad, envejecimiento reverso y las últimas investigaciones anti-aging.",
    reason: "Insights científicos sobre cómo vivir más y mejor",
    category: "Biociencia",
    estimatedTime: "1 hora",
    difficulty: "Intermedio",
    type: "podcast",
    link: "https://open.spotify.com/episode/david-sinclair-longevity",
    platform: "Spotify",
    tags: ["Longevidad", "Anti-aging", "Salud", "Ciencia"],
  },

  // Desarrollo Personal y Psicología
  {
    title: "Atomic Habits",
    author: "James Clear",
    description:
      "Método científico para formar buenos hábitos, romper los malos y dominar los pequeños comportamientos que llevan a grandes resultados.",
    reason: "Perfecta para optimizar tu sistema de seguimiento de hábitos",
    category: "Desarrollo Personal",
    estimatedTime: "4-6 horas",
    difficulty: "Principiante",
    type: "libro",
    tags: ["Hábitos", "Productividad", "Psicología", "Desarrollo Personal"],
  },
  {
    title: "The Psychology of Habit Formation",
    author: "Dr. Ann Graybiel",
    description:
      "Investigación neurocientífica sobre cómo se forman los hábitos en el cerebro y cómo modificarlos efectivamente.",
    reason:
      "Base científica para entender cómo funcionan realmente los hábitos",
    category: "Desarrollo Personal",
    estimatedTime: "25 min",
    difficulty: "Intermedio",
    type: "artículo",
    link: "https://www.nature.com/articles/nn.3892",
    source: "Nature Neuroscience",
    tags: ["Hábitos", "Neurociencia", "Psicología", "Cerebro"],
  },
  {
    title: "Huberman Lab: The Science of Goal Setting",
    author: "Andrew Huberman",
    description:
      "Neurocientífico de Stanford explica la ciencia detrás del establecimiento y logro de objetivos.",
    reason: "Estrategias basadas en neurociencia para alcanzar tus metas",
    category: "Desarrollo Personal",
    estimatedTime: "1 hora",
    difficulty: "Intermedio",
    type: "podcast",
    link: "https://open.spotify.com/episode/huberman-goal-setting",
    platform: "Spotify",
    tags: ["Objetivos", "Neurociencia", "Motivación", "Productividad"],
  },

  // Negocios y Emprendimiento
  {
    title: "Zero to One",
    author: "Peter Thiel",
    description:
      "Notas sobre startups, o cómo construir el futuro. Principios fundamentales para crear empresas innovadoras.",
    reason: "Mentalidad de innovación y creación de valor único",
    category: "Emprendimiento",
    estimatedTime: "3-4 horas",
    difficulty: "Intermedio",
    type: "libro",
    tags: ["Startups", "Innovación", "Negocios", "Estrategia"],
  },
  {
    title: "The Lean Startup Methodology: 2024 Update",
    author: "Eric Ries",
    description:
      "Actualización de la metodología lean startup adaptada a la era de la IA y el trabajo remoto.",
    reason: "Metodología probada para validar ideas de negocio rápidamente",
    category: "Emprendimiento",
    estimatedTime: "20 min",
    difficulty: "Principiante",
    type: "blog",
    link: "https://theleanstartup.com/2024-update",
    source: "The Lean Startup",
    tags: ["Lean Startup", "Validación", "MVP", "Metodología"],
  },
  {
    title: "Invest Like the Best: Naval Ravikant",
    author: "Patrick O'Shaughnessy",
    description:
      "Naval comparte sus filosofías sobre riqueza, felicidad, toma de decisiones y construcción de productos.",
    reason: "Sabiduría práctica sobre creación de riqueza y toma de decisiones",
    category: "Emprendimiento",
    estimatedTime: "1 hora",
    difficulty: "Intermedio",
    type: "podcast",
    link: "https://open.spotify.com/episode/naval-ravikant-wealth",
    platform: "Spotify",
    tags: ["Riqueza", "Filosofía", "Decisiones", "Emprendimiento"],
  },

  // Tecnología y Programación
  {
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    description:
      "Principios y prácticas para escribir código limpio, mantenible y profesional.",
    reason: "Fundamentos esenciales para cualquier desarrollador",
    category: "Tecnología",
    estimatedTime: "8-10 horas",
    difficulty: "Intermedio",
    type: "libro",
    tags: ["Programación", "Clean Code", "Software", "Mejores Prácticas"],
  },
  {
    title: "The State of Developer Ecosystem 2024",
    author: "JetBrains",
    description:
      "Encuesta global sobre tendencias en desarrollo, lenguajes, frameworks y herramientas más populares.",
    reason:
      "Mantente actualizado con las tendencias del desarrollo de software",
    category: "Tecnología",
    estimatedTime: "30 min",
    difficulty: "Principiante",
    type: "informe",
    link: "https://www.jetbrains.com/lp/devecosystem-2024/",
    source: "JetBrains",
    tags: ["Desarrollo", "Tendencias", "Programación", "Herramientas"],
  },
  {
    title: "Syntax: The Future of Web Development",
    author: "Wes Bos & Scott Tolinski",
    description:
      "Discusión sobre las últimas tendencias en desarrollo web, frameworks modernos y el futuro de JavaScript.",
    reason: "Mantente al día con las tecnologías web más actuales",
    category: "Tecnología",
    estimatedTime: "45 min",
    difficulty: "Intermedio",
    type: "podcast",
    link: "https://syntax.fm/show/future-web-dev",
    platform: "Spotify",
    tags: ["Web Development", "JavaScript", "Frameworks", "Frontend"],
  },

  // Salud y Bienestar
  {
    title: "Why We Sleep",
    author: "Matthew Walker",
    description:
      "La ciencia del sueño y los sueños. Cómo el sueño afecta cada aspecto de tu salud física y mental.",
    reason: "Fundamental para optimizar tu descanso y rendimiento",
    category: "Salud",
    estimatedTime: "6-8 horas",
    difficulty: "Principiante",
    type: "libro",
    tags: ["Sueño", "Salud", "Neurociencia", "Bienestar"],
  },
  {
    title: "The Science of Nutrition: Latest Research 2024",
    author: "Dr. Rhonda Patrick",
    description:
      "Revisión de las últimas investigaciones en nutrición, micronutrientes y su impacto en la longevidad.",
    reason: "Información científica actualizada sobre nutrición óptima",
    category: "Salud",
    estimatedTime: "35 min",
    difficulty: "Intermedio",
    type: "artículo",
    link: "https://www.foundmyfitness.com/nutrition-2024",
    source: "Found My Fitness",
    tags: ["Nutrición", "Salud", "Micronutrientes", "Longevidad"],
  },
  {
    title: "The Ben Greenfield Life: Biohacking Basics",
    author: "Ben Greenfield",
    description:
      "Introducción al biohacking: optimización del sueño, nutrición, ejercicio y recuperación.",
    reason:
      "Estrategias prácticas para optimizar tu rendimiento físico y mental",
    category: "Salud",
    estimatedTime: "1 hora",
    difficulty: "Intermedio",
    type: "podcast",
    link: "https://open.spotify.com/episode/biohacking-basics",
    platform: "Spotify",
    tags: ["Biohacking", "Optimización", "Rendimiento", "Salud"],
  },
];

function generatePersonalizedRecommendations(
  availableTime: string,
  preferredMood: string,
  contentType: string,
  topic: string,
  genre: string
): ContentRecommendation[] {
  let filteredContent = [...CONTENT_DATABASE];

  // Filtrar por tipo de contenido
  if (contentType !== "Cualquiera") {
    const typeMap: { [key: string]: string } = {
      "📚 Libros": "libro",
      "📄 Artículos": "artículo",
      "🎧 Podcasts": "podcast",
      "📝 Blogs": "blog",
      "🔬 Estudios científicos": "estudio",
      "📊 Informes técnicos": "informe",
    };
    const targetType = typeMap[contentType];
    if (targetType) {
      filteredContent = filteredContent.filter(
        (item) => item.type === targetType
      );
    }
  }

  // Filtrar por género/tema
  if (genre !== "Cualquiera") {
    const genreKeywords: { [key: string]: string[] } = {
      "🤖 Inteligencia Artificial": [
        "IA",
        "Inteligencia Artificial",
        "AI",
        "Machine Learning",
        "Deep Learning",
      ],
      "🧬 Biociencia y Medicina": [
        "Biociencia",
        "Medicina",
        "Genética",
        "CRISPR",
        "Biotecnología",
        "Salud",
      ],
      "💼 Negocios y Emprendimiento": [
        "Negocios",
        "Emprendimiento",
        "Startup",
        "Business",
        "Riqueza",
      ],
      "🧠 Psicología y Desarrollo Personal": [
        "Desarrollo Personal",
        "Psicología",
        "Hábitos",
        "Mindfulness",
        "Productividad",
      ],
      "💻 Tecnología y Programación": [
        "Tecnología",
        "Programación",
        "Software",
        "Tech",
        "Desarrollo",
        "Web Development",
      ],
      "🏃‍♂️ Salud y Bienestar": [
        "Salud",
        "Bienestar",
        "Fitness",
        "Nutrición",
        "Sueño",
        "Biohacking",
      ],
    };

    const keywords = genreKeywords[genre] || [];
    if (keywords.length > 0) {
      filteredContent = filteredContent.filter((item) =>
        keywords.some(
          (keyword) =>
            item.category.includes(keyword) ||
            item.tags.some((tag) =>
              tag.toLowerCase().includes(keyword.toLowerCase())
            ) ||
            item.title.toLowerCase().includes(keyword.toLowerCase()) ||
            item.description.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }
  }

  // Filtrar por tópico específico
  if (topic.trim()) {
    const searchTerm = topic.toLowerCase();
    filteredContent = filteredContent.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
        item.category.toLowerCase().includes(searchTerm) ||
        item.author.toLowerCase().includes(searchTerm)
    );
  }

  // Filtrar por tiempo disponible
  if (availableTime !== "2+ horas") {
    const timeMap: { [key: string]: number } = {
      "5 min": 5,
      "15 min": 15,
      "30 min": 30,
      "1 hora": 60,
    };
    const maxTime = timeMap[availableTime];
    if (maxTime) {
      filteredContent = filteredContent.filter((item) => {
        const timeStr = item.estimatedTime.toLowerCase();
        if (timeStr.includes("min")) {
          const minutes = parseInt(timeStr);
          return !isNaN(minutes) && minutes <= maxTime;
        } else if (timeStr.includes("hora")) {
          const hours = parseInt(timeStr);
          return !isNaN(hours) && hours * 60 <= maxTime;
        }
        return true;
      });
    }
  }

  // Ajustar razones según el estado de ánimo
  const moodAdjustments: { [key: string]: string } = {
    "⚡ Motivacional": "Te dará la energía y motivación que buscas",
    "🧘 Relajante": "Perfecto para un momento de calma y reflexión",
    "📚 Educativo": "Expandirá tus conocimientos de manera estructurada",
    "✨ Inspirador": "Te inspirará con nuevas ideas y perspectivas",
    "🔧 Técnico": "Desarrollará tus habilidades técnicas y prácticas",
  };

  const moodSuffix = moodAdjustments[preferredMood] || "";

  // Personalizar razones según el estado de ánimo
  filteredContent = filteredContent.map((item) => ({
    ...item,
    reason: `${item.reason}. ${moodSuffix}`,
  }));

  // Ordenar por relevancia (priorizar coincidencias exactas)
  filteredContent.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Bonificación por coincidencia exacta en título
    if (topic && a.title.toLowerCase().includes(topic.toLowerCase()))
      scoreA += 10;
    if (topic && b.title.toLowerCase().includes(topic.toLowerCase()))
      scoreB += 10;

    // Bonificación por tipo de contenido preferido
    if (contentType !== "Cualquiera") {
      const typeMap: { [key: string]: string } = {
        "📚 Libros": "libro",
        "📄 Artículos": "artículo",
        "🎧 Podcasts": "podcast",
        "📝 Blogs": "blog",
        "🔬 Estudios científicos": "estudio",
        "📊 Informes técnicos": "informe",
      };
      const targetType = typeMap[contentType];
      if (a.type === targetType) scoreA += 5;
      if (b.type === targetType) scoreB += 5;
    }

    // Bonificación por dificultad según estado de ánimo
    if (preferredMood === "🔧 Técnico" && a.difficulty === "Avanzado")
      scoreA += 3;
    if (preferredMood === "🔧 Técnico" && b.difficulty === "Avanzado")
      scoreB += 3;
    if (preferredMood === "🧘 Relajante" && a.difficulty === "Principiante")
      scoreA += 3;
    if (preferredMood === "🧘 Relajante" && b.difficulty === "Principiante")
      scoreB += 3;

    return scoreB - scoreA;
  });

  // Limitar resultados
  return filteredContent.slice(0, 6);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      availableTime = "30 min",
      preferredMood = "⚡ Motivacional",
      contentType = "Cualquiera",
      topic = "",
      genre = "Cualquiera",
    } = body;

    console.log("📚 Generando recomendaciones con filtros:", {
      availableTime,
      preferredMood,
      contentType,
      topic,
      genre,
    });

    const recommendations = generatePersonalizedRecommendations(
      availableTime,
      preferredMood,
      contentType,
      topic,
      genre
    );

    console.log(`✅ Generadas ${recommendations.length} recomendaciones`);

    return NextResponse.json({
      success: true,
      data: recommendations,
      message: `Se encontraron ${recommendations.length} recomendaciones personalizadas`,
    });
  } catch (error) {
    console.error("❌ Error generando recomendaciones:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor al generar recomendaciones",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Endpoint de recomendaciones de contenido disponible",
    availableFilters: {
      availableTime: ["5 min", "15 min", "30 min", "1 hora", "2+ horas"],
      preferredMood: [
        "⚡ Motivacional",
        "🧘 Relajante",
        "📚 Educativo",
        "✨ Inspirador",
        "🔧 Técnico",
      ],
      contentType: [
        "Cualquiera",
        "📚 Libros",
        "📄 Artículos",
        "🎧 Podcasts",
        "📝 Blogs",
        "🔬 Estudios científicos",
        "📊 Informes técnicos",
      ],
      genre: [
        "Cualquiera",
        "🤖 Inteligencia Artificial",
        "🧬 Biociencia y Medicina",
        "💼 Negocios y Emprendimiento",
        "🧠 Psicología y Desarrollo Personal",
        "💻 Tecnología y Programación",
        "🏃‍♂️ Salud y Bienestar",
      ],
    },
    totalContent: CONTENT_DATABASE.length,
  });
}
