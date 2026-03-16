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
  SavedMeal,
  AICostStats,
  WeightAnalysis,
  WeightEntry,
  CreateWeightEntryManualDto,
  WeightStats,
  NutritionistPlan,
  MealPrep,
  ImportNutritionistPlanDto,
  UpdateNutritionistPlanDto,
  GenerateMealPrepDto,
  CreateMealPrepDto,
  UpdateMealPrepDto,
  UpdateSlotDto,
  MarkSlotEatenDto,
  Task,
  CalendarEvent,
  GoogleCalendarStatus,
  DayScore,
  MonthlyStats,
  WinStreak,
  HydrationLog,
  HydrationGoal,
  ShoppingList,
  ShoppingItem,
} from "@/types";
import { ApiError, statusToErrorCode } from "@/lib/api-error";

// Configuración de la API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-navi-tracker.luciano-yomayel.com";

// Función helper para obtener el token desde el store
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return null;

    const parsed = JSON.parse(authStorage);
    return parsed?.state?.tokens?.accessToken || null;
  } catch {
    return null;
  }
}

/**
 * Parse the backend error response and throw a typed ApiError.
 *
 * Backend shapes:
 *  - HttpExceptionFilter: { success: false, data: null, message: string, errors?: string[] }
 *  - Soft error (200):    { success: false, error: string }
 */
async function throwApiError(response: Response): Promise<never> {
  const status = response.status;
  let body: Record<string, unknown> = {};

  try {
    body = await response.json();
  } catch {
    // Could not parse JSON — use status text
    throw new ApiError({
      message: response.statusText || `Error HTTP ${status}`,
      code: statusToErrorCode(status),
      status,
    });
  }

  // Backend HttpExceptionFilter format: { success, data, message, errors? }
  const message =
    (body.message as string) ||
    (body.error as string) ||
    `Error HTTP ${status}`;
  const errors = Array.isArray(body.errors) ? (body.errors as string[]) : [];
  const code = statusToErrorCode(status);

  throw new ApiError({
    message,
    code,
    status,
    validationErrors: errors,
    rawBody: body,
  });
}

/**
 * Check for soft errors: HTTP 200 with { success: false, error: "..." }
 * Many backend controllers return this shape instead of throwing.
 */
function checkSoftError<T>(data: T, status: number): T {
  if (
    data &&
    typeof data === "object" &&
    "success" in data &&
    (data as Record<string, unknown>).success === false
  ) {
    const raw = data as Record<string, unknown>;
    const message =
      (raw.error as string) ||
      (raw.message as string) ||
      "Error desconocido del servidor";

    throw new ApiError({
      message,
      code: "SOFT_ERROR",
      status,
      rawBody: raw,
    });
  }
  return data;
}

// Función helper para hacer peticiones HTTP
async function fetchAPI<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;

  // Obtener token automáticamente
  const token = getAuthToken();

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  let response: Response;

  try {
    response = await fetch(url, config);
  } catch (networkError) {
    // fetch() itself failed — network error, DNS failure, offline, etc.
    throw new ApiError({
      message:
        networkError instanceof Error
          ? networkError.message
          : "Error de conexión",
      code: "NETWORK_ERROR",
      status: 0,
    });
  }

  // --- 401: attempt token refresh once ---
  if (response.status === 401 && token) {
    const refreshSuccess = await refreshAuthToken();

    if (refreshSuccess) {
      const newToken = getAuthToken();
      if (newToken && newToken !== token) {
        const retryConfig: RequestInit = {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
            ...options.headers,
          },
        };

        const retryResponse = await fetch(url, retryConfig);

        if (!retryResponse.ok) {
          await throwApiError(retryResponse);
        }

        const retryData = await retryResponse.json();
        return checkSoftError<T>(retryData, retryResponse.status);
      }
    }

    // Refresh failed or no new token — clear auth and redirect
    clearAuthAndRedirect();
    throw new ApiError({
      message: "Sesión expirada",
      code: "UNAUTHORIZED",
      status: 401,
    });
  }

  // --- Non-OK responses ---
  if (!response.ok) {
    await throwApiError(response);
  }

  // --- Parse successful response ---
  const data = await response.json();

  // Detect soft errors (200 OK with success: false)
  return checkSoftError<T>(data, response.status);
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
      apiClient.put("/notes", { id, ...data }),
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
    restore: (id: string) => apiClient.put(`/activities/restore/${id}`),
  },

  // Chat
  chat: {
    getMessages: () => apiClient.get("/chat"),
    sendMessage: (data: Record<string, unknown>) =>
      apiClient.post("/chat", data),
    clearMessages: () => apiClient.delete("/chat"),
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
    analyzeImage: (data: { image: string; mealType: MealType; context?: string }) =>
      apiClient.post<FoodAnalysisResponse>("/analyze-food/image", data),
    analyzeManualFood: (data: {
      ingredients: string;
      servings: number;
      mealType: MealType;
      context?: string;
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
    analyzePdf: (data: { images: string[] }) =>
      apiClient.post("/skin-fold/analyze-pdf", data),
  },

  // Tasks - Deprecado (ya no usa cola de tareas, las llamadas son sincrónicas)
  // tasks: {
  //   getStatus: (taskId: string) => apiClient.get(`/tasks/${taskId}/status`),
  //   getResult: (taskId: string) => apiClient.get(`/tasks/${taskId}/result`),
  //   getJobInfo: (taskId: string) => apiClient.get(`/tasks/${taskId}`),
  // },

  // XP System
  xp: {
    getStats: () => apiClient.get("/xp/stats"),
    getStreaks: () =>
      apiClient.get<{
        habits: { streak: number; lastDate: string | null };
        nutrition: { streak: number; lastDate: string | null };
        activity: { streak: number; lastDate: string | null };
      }>("/xp/streaks"),
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

  // Saved Meals
  savedMeals: {
    getAll: () => apiClient.get<SavedMeal[]>("/saved-meals"),
    create: (data: Omit<SavedMeal, "id" | "userId" | "timesUsed" | "lastUsedAt" | "createdAt" | "updatedAt">) =>
      apiClient.post("/saved-meals", data as any),
    use: (id: string) => apiClient.post(`/saved-meals/${id}/use`),
    update: (id: string, data: { name?: string; description?: string }) =>
      apiClient.put(`/saved-meals/${id}`, data),
    delete: (id: string) => apiClient.delete(`/saved-meals/${id}`),
  },

  // AI Cost Tracking
  aiCost: {
    getStats: () => apiClient.get<AICostStats>("/ai-cost/stats"),
  },

  // Meal Prep
  mealPrep: {
    // Nutritionist Plans
    importPlan: (data: ImportNutritionistPlanDto) =>
      apiClient.post<NutritionistPlan>("/meal-prep/nutritionist-plan/import", data as any),
    getAllPlans: () =>
      apiClient.get<NutritionistPlan[]>("/meal-prep/nutritionist-plan"),
    getActivePlan: () =>
      apiClient.get<NutritionistPlan | null>("/meal-prep/nutritionist-plan/active"),
    updatePlan: (id: string, data: UpdateNutritionistPlanDto) =>
      apiClient.put<NutritionistPlan>(`/meal-prep/nutritionist-plan/${id}`, data as any),
    deletePlan: (id: string) =>
      apiClient.delete(`/meal-prep/nutritionist-plan/${id}`),

    // Meal Preps
    getAll: () => apiClient.get<MealPrep[]>("/meal-prep"),
    getActive: () => apiClient.get<MealPrep | null>("/meal-prep/active"),
    getById: (id: string) => apiClient.get<MealPrep>(`/meal-prep/${id}`),
    generate: (data: GenerateMealPrepDto) =>
      apiClient.post<MealPrep>("/meal-prep/generate", data as any),
    create: (data: CreateMealPrepDto) =>
      apiClient.post<MealPrep>("/meal-prep", data as any),
    update: (id: string, data: UpdateMealPrepDto) =>
      apiClient.put<MealPrep>(`/meal-prep/${id}`, data as any),
    updateSlot: (id: string, data: UpdateSlotDto) =>
      apiClient.put<MealPrep>(`/meal-prep/${id}/slot`, data as any),
    eatSlot: (id: string, data: MarkSlotEatenDto) =>
      apiClient.post(`/meal-prep/${id}/eat`, data as any),
    delete: (id: string) => apiClient.delete(`/meal-prep/${id}`),
  },

  // TASKS
  tasks: {
    getAll: (params?: {
      date?: string;
      status?: string;
      category?: string;
      from?: string;
      to?: string;
    }) => {
      const query = params
        ? new URLSearchParams(
            Object.entries(params).filter(([, v]) => v) as [
              string,
              string,
            ][],
          ).toString()
        : "";
      return apiClient.get<Task[]>(`/tasks${query ? `?${query}` : ""}`);
    },
    getById: (id: string) => apiClient.get<Task>(`/tasks/${id}`),
    create: (data: Partial<Task>) => apiClient.post<Task>("/tasks", data),
    update: (id: string, data: Partial<Task>) =>
      apiClient.put<Task>(`/tasks/${id}`, data),
    delete: (id: string) => apiClient.delete(`/tasks/${id}`),
    toggle: (id: string) => apiClient.post<Task>(`/tasks/${id}/toggle`),
    reorder: (taskIds: string[]) =>
      apiClient.put("/tasks/reorder", { taskIds }),
  },

  // CALENDAR
  calendar: {
    getEvents: (from: string, to: string) =>
      apiClient.get<CalendarEvent[]>(
        `/calendar/events?from=${from}&to=${to}`,
      ),
    createEvent: (data: Partial<CalendarEvent>) =>
      apiClient.post<CalendarEvent>("/calendar/events", data),
    updateEvent: (id: string, data: Partial<CalendarEvent>) =>
      apiClient.put<CalendarEvent>(`/calendar/events/${id}`, data),
    deleteEvent: (id: string) =>
      apiClient.delete(`/calendar/events/${id}`),
    google: {
      getAuthUrl: () =>
        apiClient.get<{ url: string }>("/calendar/google/auth-url"),
      callback: (code: string) =>
        apiClient.post("/calendar/google/callback", { code }),
      sync: () => apiClient.post("/calendar/google/sync"),
      disconnect: () => apiClient.delete("/calendar/google/disconnect"),
      getStatus: () =>
        apiClient.get<GoogleCalendarStatus>("/calendar/google/status"),
    },
  },

  // DAY SCORE
  dayScore: {
    getByDate: (date: string) =>
      apiClient.get<DayScore>(`/day-score/${date}`),
    getRange: (from: string, to: string) =>
      apiClient.get<DayScore[]>(`/day-score/range/${from}/${to}`),
    recalculate: (date: string) =>
      apiClient.post<DayScore>(`/day-score/${date}/recalculate`),
    getMonthlyStats: (month: string) =>
      apiClient.get<MonthlyStats>(
        `/day-score/stats/monthly?month=${month}`,
      ),
    getWinStreak: () =>
      apiClient.get<WinStreak>("/day-score/stats/streak"),
  },

  // HYDRATION
  hydration: {
    getByDate: (date?: string) =>
      apiClient.get<HydrationLog>(
        `/hydration${date ? `?date=${date}` : ""}`,
      ),
    getRange: (from: string, to: string) =>
      apiClient.get<HydrationLog[]>(
        `/hydration/range?from=${from}&to=${to}`,
      ),
    adjust: (data: { date: string; delta: number }) =>
      apiClient.post<HydrationLog>("/hydration/adjust", data),
    set: (data: { date: string; glasses: number }) =>
      apiClient.put<HydrationLog>("/hydration", data),
    getGoal: () => apiClient.get<HydrationGoal>("/hydration/goal"),
    setGoal: (data: HydrationGoal) =>
      apiClient.put<void>("/hydration/goal", data),
  },

  // SHOPPING LIST
  shoppingList: {
    getAll: () => apiClient.get<ShoppingList[]>("/shopping-list"),
    getById: (id: string) =>
      apiClient.get<ShoppingList>(`/shopping-list/${id}`),
    create: (data: { name: string; notes?: string }) =>
      apiClient.post<ShoppingList>("/shopping-list", data),
    generate: (data: { mealPrepId?: string; name?: string }) =>
      apiClient.post<ShoppingList>("/shopping-list/generate", data),
    update: (
      id: string,
      data: Partial<{ name: string; status: string; notes: string }>,
    ) => apiClient.put<ShoppingList>(`/shopping-list/${id}`, data),
    delete: (id: string) => apiClient.delete(`/shopping-list/${id}`),
    addItem: (listId: string, data: Partial<ShoppingItem>) =>
      apiClient.post<ShoppingItem>(
        `/shopping-list/${listId}/items`,
        data as any,
      ),
    updateItem: (
      listId: string,
      itemId: string,
      data: Partial<ShoppingItem>,
    ) =>
      apiClient.put<ShoppingItem>(
        `/shopping-list/${listId}/items/${itemId}`,
        data as any,
      ),
    deleteItem: (listId: string, itemId: string) =>
      apiClient.delete(`/shopping-list/${listId}/items/${itemId}`),
    bulkCheck: (
      listId: string,
      data: { itemIds: string[]; checked: boolean },
    ) =>
      apiClient.post<ShoppingItem[]>(
        `/shopping-list/${listId}/items/bulk-check`,
        data,
      ),
    uncheckAll: (listId: string) =>
      apiClient.post(`/shopping-list/${listId}/uncheck-all`),
  },
};

export default apiClient;
