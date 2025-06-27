import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic: _topic, preferences: _preferences } = body;

    // Aquí iría la lógica de reading recommendations
    // Por ahora retornamos un mock
    const recommendations = [
      {
        id: "1",
        title: "Atomic Habits",
        author: "James Clear",
        description:
          "Un enfoque probado para crear buenos hábitos y romper los malos",
        category: "habits",
        rating: 4.8,
        url: "https://example.com/atomic-habits",
      },
      {
        id: "2",
        title: "The Power of Now",
        author: "Eckhart Tolle",
        description: "Una guía para la iluminación espiritual",
        category: "mindfulness",
        rating: 4.6,
        url: "https://example.com/power-of-now",
      },
    ];

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Error generating reading recommendations:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error generating recommendations",
      },
      { status: 500 }
    );
  }
}
