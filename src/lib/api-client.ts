import {
  MealType,
  FoodAnalysisResponse,
  NutritionAnalysis,
  BodyAnalysis,
  SkinFoldRecord,
  XpAction,
  DailyNote,
  DailyNutritionBalance,
  PhysicalActivity,
  CreatePhysicalActivityDto,
  CreateWeightEntryDto,
  WeightAnalysis,
  WeightEntry,
  CreateWeightEntryManualDto,
  WeightStats,
} from "@/types";

// Configuración de la API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-navi-tracker.luciano-yomayel.com";
console.log("API_BASE_URL", API_BASE_URL);
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
async function fetchAPI<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;

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

  try {
    const response = await fetch(url, config);
    // Si el token ha expirado, intentar refrescar
    if (response.status === 401 && token) {
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

      // Leer el JSON de error formateado por HttpExceptionFilter
      try {
        const errorData = await response.json();
        //console.error(`❌ Error HTTP ${response.status}:`, errorData);

        // Si el backend devuelve el formato estructurado, usar ese mensaje
        if (errorData && !errorData.success && errorData.message) {
          const errorMessage =
            Array.isArray(errorData.errors) && errorData.errors.length > 0
              ? errorData.errors.join(", ")
              : errorData.message;
          console.log("errorMessage", errorMessage);
          throw new Error(errorMessage);
        }

        // Fallback al formato anterior
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      } catch (_jsonError) {
        // Si no se puede parsear el JSON, usar el formato anterior
        console.log((_jsonError as Error).message);
        throw new Error((_jsonError as Error).message);
      }
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

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
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
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      };

      localStorage.setItem(
        "auth-storage",
        JSON.stringify({
          ...parsed,
          state: newState,
        })
      );

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

// Tipos para las respuestas de API
type ApiResponse<T = unknown> = {
  success: boolean;
  data: T;
  message?: string;
};

// Exportar las funciones de API
export const apiClient = {
  get: <T = unknown>(endpoint: string, headers?: Record<string, string>) =>
    fetchAPI<ApiResponse<T>>(endpoint, { method: "GET", headers }),

  post: <T = unknown>(
    endpoint: string,
    data?: Record<string, unknown>,
    headers?: Record<string, string>
  ) =>
    fetchAPI<ApiResponse<T>>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      headers,
    }),

  put: <T = unknown>(
    endpoint: string,
    data?: Record<string, unknown>,
    headers?: Record<string, string>
  ) =>
    fetchAPI<ApiResponse<T>>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      headers,
    }),

  delete: <T = unknown>(endpoint: string, headers?: Record<string, string>) =>
    fetchAPI<ApiResponse<T>>(endpoint, { method: "DELETE", headers }),

  // Función helper para peticiones autenticadas explícitas
  authenticated: {
    get: <T = unknown>(endpoint: string, headers?: Record<string, string>) =>
      apiClient.get<T>(endpoint, headers),
    post: <T = unknown>(
      endpoint: string,
      data?: Record<string, unknown>,
      headers?: Record<string, string>
    ) => apiClient.post<T>(endpoint, data, headers),
    put: <T = unknown>(
      endpoint: string,
      data?: Record<string, unknown>,
      headers?: Record<string, string>
    ) => apiClient.put<T>(endpoint, data, headers),
    delete: <T = unknown>(endpoint: string, headers?: Record<string, string>) =>
      apiClient.delete<T>(endpoint, headers),
  },
};

// Funciones de conveniencia para endpoints específicos
export const api = {
  // Notes
  notes: {
    getAll: () => apiClient.get("/notes"),
    create: (data: Omit<DailyNote, "id" | "createdAt" | "updatedAt">) =>
      apiClient.post("/notes", data),
    update: (id: string, data: Partial<DailyNote>) =>
      apiClient.put(`/notes/${id}`, data),
    delete: (id: string) => apiClient.delete(`/notes?id=${id}`),
  },

  // Actividades
  activities: {
    getAll: () => apiClient.get("/activities"),
    getById: (id: string) => apiClient.get(`/activities/${id}`),
    create: (data: Record<string, unknown>) =>
      apiClient.post("/activities", data),
    update: (id: string, data: Record<string, unknown>) =>
      apiClient.put("/activities", { id, ...data }),
    delete: (id: string) => apiClient.delete(`/activities?id=${id}`),
    archive: (id: string) => apiClient.put(`/activities/archive/${id}`),
  },

  // Chat
  chat: {
    getMessages: () => apiClient.get("/chat"),
    sendMessage: (data: Record<string, unknown>) =>
      apiClient.post("/chat", data),
  },

  // Nutrición
  nutrition: {
    getAnalyses: () => apiClient.get<NutritionAnalysis[]>("/nutrition"),
    createAnalysis: (data: NutritionAnalysis) =>
      apiClient.post("/nutrition", data as any),
    getByDate: (date: string) => apiClient.get(`/nutrition?date=${date}`),
    updateAnalysis: (id: string, data: any) =>
      apiClient.put(`/nutrition/${id}`, data),
    deleteAnalysis: (id: string) => apiClient.delete(`/nutrition/${id}`),
    getDailyBalance: (date?: string) =>
      apiClient.get<DailyNutritionBalance>(
        `/nutrition/daily-balance${date ? `?date=${date}` : ""}`
      ),
    // Weight Entries
    // GET
    getAllWeightEntries: (date?: string) =>
      apiClient.get<WeightEntry[]>(
        `/nutrition/weight-entries${date ? `?date=${date}` : ""}`
      ),
    getWeightAnalysis: () =>
      apiClient.get<WeightAnalysis>("/nutrition/weight-analysis"),
    getWeightEntryById: (id: string) =>
      apiClient.get<WeightEntry>(`/nutrition/weight-entries/${id}`),
    getWeightStats: (timeframe?: "week" | "month" | "year") =>
      apiClient.get<WeightStats>(
        `/nutrition/weight-stats${timeframe ? `?timeframe=${timeframe}` : ""}`
      ),
    // PUT
    updateWeightEntry: (id: string, data: Partial<WeightEntry>) =>
      apiClient.put(`/nutrition/weight-entries/${id}`, data),
    // DELETE
    deleteWeightEntry: (id: string) =>
      apiClient.delete(`/nutrition/weight-entries/${id}`),
    // POST
    createWeightEntryImage: (data: { imageBase64: string }) =>
      apiClient.post("/nutrition/weight-entries/analyze-image", data),
    createWeightEntryManual: (data: CreateWeightEntryManualDto) =>
      apiClient.post("/nutrition/weight-entries/analyze-manual", data),
  },

  // Completions
  completions: {
    toggle: (data: Record<string, unknown>) =>
      apiClient.post("/completions", data),
    update: (id: string, data: Record<string, unknown>) =>
      apiClient.put(`/completions/${id}`, data),
  },

  // Body Analysis
  bodyAnalysis: {
    create: (data: {
      image: string;
      currentWeight?: number;
      targetWeight?: number;
      height?: number;
      age?: number;
      gender?: "male" | "female" | "other";
      activityLevel?:
        | "sedentary"
        | "light"
        | "moderate"
        | "active"
        | "very_active";
      goals?: string[];
      allowGeneric?: boolean;
    }) => apiClient.post("/body-analysis", data),
    saveAnalysis: (data: BodyAnalysis) =>
      apiClient.post("/body-analysis/save", data),
    getAll: (days?: number) =>
      apiClient.get(`/body-analysis${days ? `?days=${days}` : ""}`),
    getById: (id: string) => apiClient.get(`/body-analysis/${id}`),
    getLatest: () => apiClient.get("/body-analysis/latest"),
    update: (
      id: string,
      data: {
        bodyType?: string;
        measurements?: any;
        bodyComposition?: any;
        recommendations?: any;
        aiConfidence?: number;
        notes?: string;
      }
    ) => apiClient.put(`/body-analysis/${id}`, data),
    delete: (id: string) => apiClient.delete(`/body-analysis/${id}`),
    analyzeOnly: (data: {
      image: string;
      currentWeight?: number;
      targetWeight?: number;
      height?: number;
      age?: number;
      gender?: "male" | "female" | "other";
      activityLevel?:
        | "sedentary"
        | "light"
        | "moderate"
        | "active"
        | "very_active";
      goals?: string[];
      allowGeneric?: boolean;
    }) => apiClient.post("/body-analysis/analyze-only", data),
    getStatsSummary: () => apiClient.get("/body-analysis/stats/summary"),
    getStatus: () => apiClient.get("/body-analysis/status/health"),
  },

  // AI Suggestions
  aiSuggestions: {
    generate: (data: Record<string, unknown>) =>
      apiClient.post("/ai-suggestions", data),
    getAll: () => apiClient.get("/ai-suggestions"),
    dismiss: (id: string) => apiClient.delete(`/ai-suggestions/${id}`),
  },

  // Analysis
  analysis: {
    getRecent: (days: number) =>
      apiClient.get(`/ai-suggestions/analysis/recent?days=${days}`),
    getPatterns: () => apiClient.get("/analysis/patterns"),
    getBookRecommendations: (data: {
      availableTime: string;
      preferredMood: string;
      includeUserPatterns?: boolean;
    }) => apiClient.post("/analysis/book-recommendations", data),
    getContentRecommendations: (data: {
      availableTime: string;
      preferredMood: string;
      contentType: string;
      topic?: string;
      genre: string;
      includeUserPatterns?: boolean;
    }) => apiClient.post("/analysis/content-recommendations", data),
    getStatus: () => apiClient.get("/analysis/status"),
  },

  // Analyze Food
  analyzeFood: {
    analyzeRecipe: (data: { recipeLink: string; mealType: MealType }) =>
      apiClient.post<FoodAnalysisResponse>("/analyze-food/recipe", data),
    analyzeImage: (data: { image: string; mealType: MealType }) =>
      apiClient.post<FoodAnalysisResponse>("/analyze-food/image", data),
    analyzeManualFood: (data: {
      ingredients: string;
      servings: number;
      mealType: MealType;
    }) => apiClient.post<FoodAnalysisResponse>("/analyze-food/manual", data),
  },

  preferences: {
    getPreferences: () => apiClient.get("/preferences"),
    getCurrentGoals: () => apiClient.get("/preferences/goals"),
    post: (data: any) => apiClient.post("/preferences", data),
  },

  // Skin Fold
  skinFold: {
    getRecords: () => apiClient.get<SkinFoldRecord[]>("/skin-fold"),
    createRecord: (data: SkinFoldRecord) => apiClient.post("/skin-fold", data),
    updateRecord: (id: string, data: SkinFoldRecord) =>
      apiClient.put(`/skin-fold/${id}`, data),
    deleteRecord: (id: string) => apiClient.delete(`/skin-fold?id=${id}`),
    analyzeSkinFold: (data: {
      imageBase64: string;
      user: {
        age: number;
        height: number;
        weight: number;
        gender: string;
      };
    }) => apiClient.post("/body-analysis/skinfold", data),
  },

  // Tasks - Para consultar el estado de trabajos en cola
  tasks: {
    getStatus: (taskId: string) => apiClient.get(`/tasks/${taskId}/status`),
    getResult: (taskId: string) => apiClient.get(`/tasks/${taskId}/result`),
    getJobInfo: (taskId: string) => apiClient.get(`/tasks/${taskId}`),
  },

  // XP System
  xp: {
    getStats: () => apiClient.get("/xp/stats"),
    addXp: (data: {
      action: XpAction;
      xpAmount: number;
      description: string;
      metadata?: any;
    }) => apiClient.post("/xp/add", data),
    addHabitXp: (data: { habitName: string; date?: string }) =>
      apiClient.post("/xp/habit-complete", data),
    addNutritionXp: (data: { mealType: string; date?: string }) =>
      apiClient.post("/xp/nutrition-log", data),
    addDailyCommentXp: (data: { date?: string }) =>
      apiClient.post("/xp/daily-comment", data),
  },

  // Actividad Física
  physicalActivity: {
    getAll: (date?: string) =>
      apiClient.get<PhysicalActivity[]>(
        `/physical-activities${date ? `?date=${date}` : ""}`
      ),
    create: (data: CreatePhysicalActivityDto) =>
      apiClient.post("/physical-activities", data),
    update: (id: string, data: Partial<PhysicalActivity>) =>
      apiClient.put(`/physical-activities/${id}`, data),
    delete: (id: string) => apiClient.delete(`/physical-activities/${id}`),
  },
};

export default apiClient;
