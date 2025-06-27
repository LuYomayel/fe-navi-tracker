import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      activities: _activities,
      completions: _completions,
      preferences: _preferences,
    } = body;

    // Aquí iría la lógica de AI suggestions
    // Por ahora retornamos un mock
    const suggestions = [
      {
        id: "1",
        title: "Mantén la consistencia",
        description: "Has completado tus hábitos 5 días seguidos. ¡Sigue así!",
        type: "encouragement",
        priority: "high",
      },
      {
        id: "2",
        title: "Nuevo hábito sugerido",
        description:
          "Basado en tus patrones, te recomendamos agregar 'Meditación'",
        type: "suggestion",
        priority: "medium",
      },
    ];

    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error generating suggestions",
      },
      { status: 500 }
    );
  }
}
