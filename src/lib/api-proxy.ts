import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api";

// Función helper para hacer proxy de requests al backend NestJS
export async function proxyToBackend(request: NextRequest, endpoint: string) {
  const url = `${API_CONFIG.API_BASE}${endpoint}`;

  try {
    // Obtener query parameters si los hay
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const finalUrl = queryString ? `${url}?${queryString}` : url;

    const response = await fetch(finalUrl, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        // Pasar headers adicionales si es necesario
        ...Object.fromEntries(
          Array.from(request.headers.entries()).filter(
            ([key]) => key.startsWith("x-") || key === "authorization"
          )
        ),
      },
      body:
        request.method !== "GET" && request.method !== "DELETE"
          ? await request.text()
          : undefined,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error(`Error proxying to backend (${endpoint}):`, error);
    return NextResponse.json(
      { success: false, error: "Backend connection failed" },
      { status: 500 }
    );
  }
}

// Helper para crear handlers de proxy rápidamente
export function createProxyHandlers(endpoint: string) {
  return {
    GET: (request: NextRequest) => proxyToBackend(request, endpoint),
    POST: (request: NextRequest) => proxyToBackend(request, endpoint),
    PUT: (request: NextRequest) => proxyToBackend(request, endpoint),
    DELETE: (request: NextRequest) => proxyToBackend(request, endpoint),
    PATCH: (request: NextRequest) => proxyToBackend(request, endpoint),
  };
}
