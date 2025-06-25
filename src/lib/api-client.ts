// Configuración del backend
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
const API_BASE = `${BACKEND_URL}/api`;

// Función helper para obtener el token desde el store
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return null;

    const parsed = JSON.parse(authStorage);
    return parsed?.state?.tokens?.accessToken || null;
  } catch (error) {
    console.warn("Error al obtener token:", error);
    return null;
  }
}

// Función helper para hacer peticiones HTTP
async function fetchAPI(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE}${endpoint}`;

  // Obtener token automáticamente
  const token = getAuthToken();

  // Construir headers base - SIEMPRE definidos
  const baseHeaders = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // Combinar con headers adicionales
  const finalHeaders = {
    ...baseHeaders,
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers: finalHeaders,
  };

  console.log(`🌐 Petición a: ${url}`, {
    method: config.method || "GET",
    hasToken: !!token,
    headerKeys: Object.keys(finalHeaders),
  });

  try {
    const response = await fetch(url, config);

    // Si el token ha expirado, intentar refrescar
    if (response.status === 401 && token) {
      console.log("🔄 Token expirado, intentando renovar...");
      const refreshSuccess = await refreshAuthToken();

      if (refreshSuccess) {
        // Reintentar la petición con el nuevo token
        const newToken = getAuthToken();
        if (newToken && newToken !== token) {
          // Reconstruir headers completamente para el reintento
          const retryHeaders = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
            ...options.headers, // Preservar headers originales
          };

          const newConfig: RequestInit = {
            ...options,
            headers: retryHeaders,
          };

          console.log("🔄 Reintentando petición con nuevo token...", {
            hasNewToken: !!newToken,
            retryHeaderKeys: Object.keys(retryHeaders),
          });

          const retryResponse = await fetch(url, newConfig);

          if (!retryResponse.ok) {
            console.error(
              `❌ Error en reintento: ${retryResponse.status} ${retryResponse.statusText}`
            );

            // Capturar el texto del error para debugging
            try {
              const errorText = await retryResponse.text();
              console.error(`📄 Error body:`, errorText);
            } catch (e) {
              console.error(`❌ No se pudo leer el error body:`, e);
            }

            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }

          return await retryResponse.json();
        }
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Token inválido o expirado definitivamente
        console.warn("🚪 Sesión expirada, redirigiendo al login...");
        clearAuthAndRedirect();
        throw new Error("Sesión expirada");
      }
      console.error(`❌ Error HTTP: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ Error en petición a ${url}:`, error);
    throw error;
  }
}

// Función para refrescar el token
async function refreshAuthToken(): Promise<boolean> {
  try {
    if (typeof window === "undefined") return false;

    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return false;

    const parsed = JSON.parse(authStorage);
    const refreshToken = parsed?.state?.tokens?.refreshToken;

    if (!refreshToken) return false;

    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();

    if (data.success) {
      // Actualizar el localStorage con los nuevos tokens
      const currentState = parsed.state;
      const newState = {
        ...currentState,
        tokens: data.data.tokens,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };

      localStorage.setItem(
        "auth-storage",
        JSON.stringify({
          ...parsed,
          state: newState,
        })
      );

      console.log("✅ Token renovado exitosamente");
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ Error al renovar token:", error);
    return false;
  }
}

// Función para limpiar autenticación y redirigir
function clearAuthAndRedirect(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem("auth-storage");
  window.location.href = "/auth/login";
}

// Exportar las funciones de API
export const apiClient = {
  get: (endpoint: string, headers?: Record<string, string>) =>
    fetchAPI(endpoint, { method: "GET", headers }),

  post: (endpoint: string, data?: any, headers?: Record<string, string>) =>
    fetchAPI(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      headers,
    }),

  put: (endpoint: string, data?: any, headers?: Record<string, string>) =>
    fetchAPI(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      headers,
    }),

  delete: (endpoint: string, headers?: Record<string, string>) =>
    fetchAPI(endpoint, { method: "DELETE", headers }),

  // Función helper para peticiones autenticadas explícitas
  authenticated: {
    get: (endpoint: string, headers?: Record<string, string>) =>
      apiClient.get(endpoint, headers),
    post: (endpoint: string, data?: any, headers?: Record<string, string>) =>
      apiClient.post(endpoint, data, headers),
    put: (endpoint: string, data?: any, headers?: Record<string, string>) =>
      apiClient.put(endpoint, data, headers),
    delete: (endpoint: string, headers?: Record<string, string>) =>
      apiClient.delete(endpoint, headers),
  },
};

// Funciones de conveniencia para endpoints específicos
export const api = {
  // Actividades
  activities: {
    getAll: () => apiClient.get("/activities"),
    getById: (id: string) => apiClient.get(`/activities/${id}`),
    create: (data: any) => apiClient.post("/activities", data),
    update: (id: string, data: any) =>
      apiClient.put("/activities", { id, ...data }),
    delete: (id: string) => apiClient.delete(`/activities?id=${id}`),
  },

  // Chat
  chat: {
    getMessages: () => apiClient.get("/chat"),
    sendMessage: (data: any) => apiClient.post("/chat", data),
  },

  // Nutrición
  nutrition: {
    getAnalyses: () => apiClient.get("/nutrition"),
    createAnalysis: (data: any) => apiClient.post("/nutrition", data),
    getByDate: (date: string) => apiClient.get(`/nutrition?date=${date}`),
  },

  // Completions
  completions: {
    toggle: (data: any) => apiClient.post("/completions", data),
    update: (id: string, data: any) =>
      apiClient.put(`/completions/${id}`, data),
  },

  // Body Analysis
  bodyAnalysis: {
    create: (data: any) => apiClient.post("/body-analysis", data),
    getHistory: () => apiClient.get("/body-analysis"),
  },

  // AI Suggestions
  aiSuggestions: {
    getAll: () => apiClient.get("/ai-suggestions"),
    dismiss: (id: string) => apiClient.delete(`/ai-suggestions/${id}`),
  },

  // Analysis (nuevo endpoint)
  analysis: {
    getRecent: (days: number = 7) =>
      apiClient.get(`/analysis/recent?days=${days}`),
    create: (data: any) => apiClient.post("/analysis", data),
  },
};

export default apiClient;
