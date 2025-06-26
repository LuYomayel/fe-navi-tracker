import { NextRequest, NextResponse } from "next/server";
import type { AIResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, chatHistory, context } = body;

    // Simulación de procesamiento de IA
    // En producción, aquí se conectaría con OpenAI, Claude, etc.

    const response: AIResponse = await processAIMessage(
      message,
      chatHistory,
      context
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error en AI suggestions:", error);
    return NextResponse.json(
      { error: "Error procesando mensaje de IA" },
      { status: 500 }
    );
  }
}

async function processAIMessage(
  message: string,
  chatHistory: Array<{ role: string; content: string }>,
  context: any
): Promise<AIResponse> {
  // Análisis del mensaje para diferentes tipos de respuesta
  const lowerMessage = message.toLowerCase();

  // Detectar si es una pregunta sobre hábitos específicos
  if (lowerMessage.includes("rutina") || lowerMessage.includes("ejercicio")) {
    return {
      message: `¡Excelente pregunta sobre rutinas! 💪

Basándome en tus hábitos actuales (${context.totalActivities} actividades), te recomiendo:

**Para empezar:**
• Comienza con 15-20 minutos diarios
• Elige 2-3 ejercicios básicos
• Mantén consistencia antes que intensidad

**Rutina sugerida:**
• Lunes/Miércoles/Viernes: Fuerza (flexiones, sentadillas)
• Martes/Jueves: Cardio ligero (caminar, correr)
• Fines de semana: Actividad recreativa

¿Te gustaría que agregue alguna de estas actividades a tu calendario?`,
      suggestions: [
        "Agregar rutina de fuerza 3 días/semana",
        "Incluir caminata diaria de 30 min",
        "Configurar ejercicios de flexibilidad",
        "Crear rutina de cardio ligero",
      ],
    };
  }

  // Detectar preguntas sobre constancia/motivación
  if (
    lowerMessage.includes("constante") ||
    lowerMessage.includes("motivación") ||
    lowerMessage.includes("mantener")
  ) {
    return {
      message: `🎯 **Consejos para mantener la constancia:**

**Estrategias probadas:**
• **Regla de los 2 minutos**: Si toma menos de 2 min, hazlo ahora
• **Stack de hábitos**: Conecta hábitos nuevos con existentes
• **Celebra pequeñas victorias**: Cada día completado cuenta

**Basado en tu progreso:**
• Tienes ${context.recentCompletions?.length || 0} completaciones recientes
• Enfócate en 1-2 hábitos principales primero
• Usa recordatorios visuales

**Técnicas mentales:**
• Visualiza el beneficio a largo plazo
• Encuentra tu "por qué" profundo
• Prepara el entorno para el éxito`,
      suggestions: [
        "Crear recordatorios personalizados",
        "Configurar recompensas por logros",
        "Establecer metas semanales pequeñas",
        "Analizar mis patrones de abandono",
      ],
    };
  }

  // Detectar análisis de progreso
  if (
    lowerMessage.includes("progreso") ||
    lowerMessage.includes("analiza") ||
    lowerMessage.includes("estadística")
  ) {
    const completionRate = context.recentCompletions?.length || 0;
    const totalPossible = context.totalActivities * 7; // semana
    const rateNumber =
      totalPossible > 0 ? (completionRate / totalPossible) * 100 : 0;
    const rate = rateNumber.toFixed(1);

    return {
      message: `📊 **Análisis de tu progreso semanal:**

**Estadísticas actuales:**
• Tasa de cumplimiento: ${rate}%
• Actividades completadas: ${completionRate}
• Total de hábitos activos: ${context.totalActivities}

**Observaciones:**
${
  rateNumber > 70
    ? "🎉 ¡Excelente consistencia! Estás en el camino correcto."
    : rateNumber > 40
    ? "📈 Buen progreso, pero hay espacio para mejorar."
    : "💪 Es normal empezar despacio. Enfócate en 1-2 hábitos clave."
}

**Recomendaciones:**
• ${
        rateNumber < 50
          ? "Reduce el número de hábitos y enfócate en calidad"
          : "Mantén el ritmo actual"
      }
• Identifica tu mejor día de la semana y replica esa energía
• Considera ajustar horarios según tus picos de energía`,
      suggestions: [
        "Ver reporte detallado semanal",
        "Ajustar horarios de actividades",
        "Reducir hábitos para mejor consistencia",
        "Configurar recordatorios inteligentes",
      ],
    };
  }

  // Detectar preguntas sobre organización
  if (
    lowerMessage.includes("organizar") ||
    lowerMessage.includes("planificar") ||
    lowerMessage.includes("horario")
  ) {
    return {
      message: `🗓️ **Estrategias de organización efectiva:**

**Principios clave:**
• **Agrupa por contexto**: Ejercicios juntos, lecturas juntas
• **Usa bloques de tiempo**: Dedica franjas específicas
• **Prioriza por impacto**: Los hábitos más importantes primero

**Sugerencias para tu rutina:**
• **Mañana (6-9am)**: Hábitos de alta energía (ejercicio, meditación)
• **Mediodía (12-2pm)**: Hábitos de aprendizaje (lectura, cursos)
• **Noche (7-9pm)**: Hábitos de relajación (journaling, planning)

**Técnicas de productividad:**
• Time-blocking: Asigna bloques específicos
• Batch similar: Agrupa actividades similares
• Buffer time: Deja 15 min entre actividades`,
      suggestions: [
        "Crear plantilla de horario semanal",
        "Agrupar hábitos por contexto",
        "Configurar bloques de tiempo fijos",
        "Establecer rutina matutina/nocturna",
      ],
    };
  }

  // Detectar si el usuario quiere agregar hábitos específicos
  if (
    lowerMessage.includes("agregar") ||
    lowerMessage.includes("crear") ||
    lowerMessage.includes("nuevo hábito")
  ) {
    return {
      message: `✨ **¡Perfecto! Te ayudo a crear nuevos hábitos:**

Para crear hábitos efectivos, considera:

**Características de un buen hábito:**
• **Específico**: "Leer 20 páginas" vs "Leer más"
• **Medible**: Cantidad, tiempo o frecuencia clara
• **Realista**: Empieza pequeño y crece gradualmente

**Categorías populares:**
• 💪 **Salud**: Ejercicio, agua, sueño
• 🧠 **Desarrollo**: Lectura, cursos, meditación
• 🏠 **Productividad**: Organización, planning
• 🎨 **Creatividad**: Escritura, arte, música

¿Qué tipo de hábito te gustaría agregar? Puedo sugerirte opciones específicas según tus intereses.`,
      suggestions: [
        "Sugerir hábitos de ejercicio",
        "Recomendar hábitos de lectura",
        "Crear rutina de productividad",
        "Hábitos para mejor sueño",
      ],
    };
  }

  // Respuesta general para otros casos
  return {
    message: `¡Hola! Soy tu asistente de hábitos inteligente. 🤖

Veo que tienes **${
      context.totalActivities
    } hábitos activos** y has completado **${
      context.recentCompletions?.length || 0
    } actividades** recientemente.

**Puedo ayudarte con:**
• Crear rutinas efectivas y sostenibles
• Mantener la motivación a largo plazo  
• Analizar tu progreso y patrones
• Sugerencias personalizadas de mejora
• Organizar mejor tu tiempo y hábitos

**Ejemplos de lo que puedes preguntarme:**
• "¿Cómo puedo ser más constante?"
• "Dame una rutina de ejercicios"
• "Analiza mi progreso actual"
• "¿Cómo organizo mejor mis hábitos?"

¿En qué te gustaría que te ayude hoy? 😊`,
    suggestions: [
      "Analizar mi progreso actual",
      "Crear rutinas efectivas",
      "Consejos para mantener constancia",
      "Organizar mejor mis hábitos",
      "Sugerencias de nuevos hábitos",
    ],
  };
}
