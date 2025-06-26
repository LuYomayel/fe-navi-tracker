import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  "/dashboard",
  "/habits",
  "/nutrition",
  "/profile",
  "/activities",
];

// Rutas públicas (no requieren autenticación)
const PUBLIC_ROUTES = [
  "/",
  "/auth/login",
  "/auth/register",
  "/api/auth/login",
  "/api/auth/register",
];

// Middleware para verificar autenticación
export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Obtener token del header Authorization
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token de autenticación requerido" },
        { status: 401 }
      );
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
      userId: string;
      email: string;
      name: string;
    };

    // Agregar información del usuario al request
    (request as AuthenticatedRequest).user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };

    // Ejecutar el handler
    return await handler(request as AuthenticatedRequest);
  } catch (error) {
    console.error("❌ Error de autenticación:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { success: false, error: "Token expirado" },
        { status: 401 }
      );
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: "Token inválido" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Error de autenticación" },
      { status: 401 }
    );
  }
}

// Helper para extraer token del request
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  return authHeader?.replace("Bearer ", "") || null;
}

// Helper para verificar si el usuario está autenticado
export function isAuthenticated(request: NextRequest): boolean {
  const token = getTokenFromRequest(request);
  if (!token) return false;

  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si la ruta es pública
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar si la ruta está protegida
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Obtener token del localStorage (en el cliente) o de las cookies
  const authCookie = request.cookies.get("auth-token");

  // Si no hay token, redirigir al login
  if (!authCookie?.value) {
    console.log("🔒 Acceso denegado: Sin token");
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verificar token con el backend
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"
      }/auth/verify`,
      {
        headers: {
          Authorization: `Bearer ${authCookie.value}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.log("🔒 Token inválido, redirigiendo al login");
      const loginUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    const data = await response.json();

    if (!data.success) {
      console.log("🔒 Verificación de token falló");
      const loginUrl = new URL("/auth/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Token válido, continuar
    console.log("✅ Token válido, acceso permitido");
    return NextResponse.next();
  } catch (error) {
    console.error("❌ Error verificando token:", error);
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

// Función helper para verificar autenticación del lado del cliente
export function isAuthenticatedClient(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return false;

    const parsed = JSON.parse(authStorage);
    const token = parsed?.state?.tokens?.accessToken;
    const expiresAt = parsed?.state?.expiresAt;

    if (!token || !expiresAt) return false;

    // Verificar si el token ha expirado
    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    const buffer = 5 * 60 * 1000; // 5 minutos de buffer

    return currentTime < expirationTime - buffer;
  } catch (error) {
    console.error("Error verificando autenticación:", error);
    return false;
  }
}

// Función para obtener información del usuario autenticado
export function getAuthUser() {
  if (typeof window === "undefined") return null;

  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return null;

    const parsed = JSON.parse(authStorage);
    return parsed?.state?.user || null;
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    return null;
  }
}

// Función para limpiar autenticación
export function clearAuth() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("auth-storage");
  document.cookie =
    "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
