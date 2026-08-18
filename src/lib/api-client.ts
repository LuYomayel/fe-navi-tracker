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
  Goal,
  GoalContribution,
  GoalProgress,
} from "@/types";
import { useAuthStore } from "@/modules/auth/store";

// Configuración de la API
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-navi-tracker.luciano-yomayel.com";

/** URL absoluta de un archivo subido (fotos del catalogo 3D, etc.). */
export function uploadUrl(relative: string): string {
  return relative.startsWith("http") ? relative : `${API_BASE_URL}${relative}`;
}
// Función helper para obtener el token desde el store.
// Fuente de verdad: el auth store en memoria (ya rehidratado), NO localStorage.
// En nativo (Capacitor) el persist vive en @capacitor/preferences; leer
// localStorage acá dejaba las requests sin Authorization en iOS/Android y
// disparaba 401 -> reload en loop.
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return useAuthStore.getState().getAccessToken();
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
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }

          return await retryResponse.json();
        }
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Token inválido o expirado definitivamente
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
          throw new Error(errorMessage);
        }

        // Fallback al formato anterior
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      } catch (_jsonError) {
        // Si no se puede parsear el JSON, usar el formato anterior
        throw new Error((_jsonError as Error).message);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

// Función para refrescar el token.
// Delegar al auth store: hace el refresh y persiste los nuevos tokens en el
// storage correcto de cada plataforma (Capacitor Preferences en nativo,
// localStorage en web). Antes esto escribía localStorage a mano y no tocaba la
// sesión nativa.
async function refreshAuthToken(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  return useAuthStore.getState().refreshToken();
}

// Función para limpiar autenticación y redirigir.
// Limpiar vía el store para que borre el storage correcto (Preferences en
// nativo). El AppLayout, al ver isAuthenticated=false, redirige a /auth/login
// con router.push (sin reload duro: evita el loop de recarga en iOS nativo).
function clearAuthAndRedirect(): void {
  if (typeof window === "undefined") return;
  useAuthStore.getState().clearAuth();
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
    data?: Record<string, any>,
    headers?: Record<string, string>
  ) =>
    fetchAPI<ApiResponse<T>>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      headers,
    }),

  put: <T = unknown>(
    endpoint: string,
    data?: Record<string, any>,
    headers?: Record<string, string>
  ) =>
    fetchAPI<ApiResponse<T>>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      headers,
    }),

  patch: <T = unknown>(
    endpoint: string,
    data?: Record<string, any>,
    headers?: Record<string, string>
  ) =>
    fetchAPI<ApiResponse<T>>(endpoint, {
      method: "PATCH",
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
      data?: Record<string, any>,
      headers?: Record<string, string>
    ) => apiClient.post<T>(endpoint, data, headers),
    put: <T = unknown>(
      endpoint: string,
      data?: Record<string, any>,
      headers?: Record<string, string>
    ) => apiClient.put<T>(endpoint, data, headers),
    delete: <T = unknown>(endpoint: string, headers?: Record<string, string>) =>
      apiClient.delete<T>(endpoint, headers),
  },
};

// Funciones de conveniencia para endpoints específicos
export const api = {
  // Notes
  expenses: {
    list: (month?: string) =>
      apiClient.get(`/expenses${month ? `?month=${month}` : ""}`),
    create: (data: {
      date: string;
      amount: number;
      description: string;
      categoryId?: string | null;
      goalId?: string | null;
      tarjeta?: boolean; // consumo de crédito → buffer del próximo resumen
      card?: string | null; // null = la Visa propia, texto = otra tarjeta
    }) => apiClient.post("/expenses", data),
    update: (
      id: string,
      data: Partial<{
        date: string;
        amount: number;
        description: string;
        categoryId: string | null;
        goalId: string | null;
      }>
    ) => apiClient.put(`/expenses/${id}`, data),
    delete: (id: string) => apiClient.delete(`/expenses/${id}`),
    summary: (month?: string) =>
      apiClient.get(`/expenses/summary${month ? `?month=${month}` : ""}`),
    businessSummary: () => apiClient.get("/expenses/business-summary"),
    balance: (month?: string) =>
      apiClient.get(`/expenses/balance${month ? `?month=${month}` : ""}`),
    projection: (month?: string) =>
      apiClient.get(`/expenses/projection${month ? `?month=${month}` : ""}`),
    cardStatement: {
      parse: (data: { images: string[] }) =>
        apiClient.post("/expenses/card-statement/parse", data),
      confirm: (data: {
        statementKey: string;
        dueDate: string;
        movements: {
          date?: string;
          description: string;
          amount: number;
          categoryId?: string | null;
        }[];
      }) => apiClient.post("/expenses/card-statement/confirm", data),
    },
    incomes: {
      list: (month?: string) =>
        apiClient.get(`/expenses/incomes${month ? `?month=${month}` : ""}`),
      create: (data: {
        date?: string;
        description: string;
        amount: number;
        cost?: number;
        source?: string;
        status?: "received" | "pending";
        goalId?: string | null;
        notes?: string | null;
      }) => apiClient.post("/expenses/incomes", data),
      update: (
        id: string,
        data: Partial<{
          date: string;
          description: string;
          amount: number;
          cost: number;
          source: string;
          goalId: string | null;
          notes: string | null;
        }>
      ) => apiClient.put(`/expenses/incomes/${id}`, data),
      receive: (id: string, date?: string) =>
        apiClient.patch(`/expenses/incomes/${id}/receive`, date ? { date } : {}),
      delete: (id: string) => apiClient.delete(`/expenses/incomes/${id}`),
    },
    categories: {
      list: () => apiClient.get("/expenses/categories"),
      create: (data: {
        name: string;
        icon?: string;
        color?: string;
        monthlyBudget?: number | null;
      }) => apiClient.post("/expenses/categories", data),
      update: (
        id: string,
        data: Partial<{
          name: string;
          icon: string | null;
          color: string | null;
          monthlyBudget: number | null;
        }>
      ) => apiClient.put(`/expenses/categories/${id}`, data),
      delete: (id: string) => apiClient.delete(`/expenses/categories/${id}`),
    },
    recurring: {
      list: () => apiClient.get("/expenses/recurring"),
      create: (data: {
        description: string;
        amount: number;
        dayOfMonth: number;
        kind?: "recurring" | "subscription";
        categoryId?: string | null;
        totalInstallments?: number | null;
        installmentsPaid?: number;
        startPeriod?: string | null;
        tarjeta?: boolean; // se paga con tarjeta de crédito
        card?: string | null; // null = la Visa propia, texto = otra tarjeta
      }) => apiClient.post("/expenses/recurring", data),
      update: (
        id: string,
        data: Partial<{
          description: string;
          amount: number;
          dayOfMonth: number;
          kind: "recurring" | "subscription";
          categoryId: string | null;
          active: boolean;
          totalInstallments: number | null;
          installmentsPaid: number;
          startPeriod: string | null;
        }>
      ) => apiClient.put(`/expenses/recurring/${id}`, data),
      delete: (id: string) => apiClient.delete(`/expenses/recurring/${id}`),
    },
  },

  // Negocio de impresion 3D (modulo autonomo, no depende del objetivo)
  printing: {
    settings: {
      get: () => apiClient.get("/printing/settings"),
      update: (
        data: Partial<{
          costPerGram: number;
          wastePct: number;
          powerPerHour: number;
          defaultMarkup: number;
          financingSurcharge: number;
        }>
      ) => apiClient.put("/printing/settings", data),
      regenerateToken: () =>
        apiClient.post("/printing/settings/regenerate-token"),
    },
    summary: () => apiClient.get("/printing/summary"),
    products: {
      list: () => apiClient.get("/printing/products"),
      create: (data: {
        name: string;
        author?: string;
        makerworldUrl?: string;
        grams: number;
        hours: number;
        colorsLabel: string;
        sizeMm?: string;
        licenseOk?: boolean;
        markupOverride?: number | null;
        publicPrice?: number | null;
        active?: boolean;
        notes?: string;
      }) => apiClient.post("/printing/products", data),
      update: (
        id: string,
        data: Partial<{
          name: string;
          author: string;
          makerworldUrl: string;
          grams: number;
          hours: number;
          colorsLabel: string;
          sizeMm: string;
          licenseOk: boolean;
          markupOverride: number | null;
          publicPrice: number | null;
          active: boolean;
          notes: string;
        }>
      ) => apiClient.put(`/printing/products/${id}`, data),
      delete: (id: string) => apiClient.delete(`/printing/products/${id}`),
    },
    filaments: {
      list: () => apiClient.get("/printing/filaments"),
      create: (data: {
        brand: string;
        material: string;
        color: string;
        pricePaid: number;
        grams?: number;
        purchasedAt: string;
        discarded?: boolean;
        discardReason?: string;
        gramsLeft?: number;
        notes?: string;
      }) => apiClient.post("/printing/filaments", data),
      update: (
        id: string,
        data: Partial<{
          brand: string;
          material: string;
          color: string;
          pricePaid: number;
          grams: number;
          purchasedAt: string;
          discarded: boolean;
          discardReason: string;
          gramsLeft: number;
          notes: string;
        }>
      ) => apiClient.put(`/printing/filaments/${id}`, data),
      delete: (id: string) => apiClient.delete(`/printing/filaments/${id}`),
    },
    sales: {
      list: () => apiClient.get("/printing/sales"),
      create: (data: {
        date: string;
        productId: string;
        kind?: "venta" | "muestra";
        qty?: number;
        chargedUnit?: number;
        costUnit?: number;
        status?: "a_liquidar" | "parcial" | "liquidado";
        channel?: string;
        notes?: string;
      }) => apiClient.post("/printing/sales", data),
      update: (
        id: string,
        data: Partial<{
          date: string;
          kind: "venta" | "muestra";
          qty: number;
          chargedUnit: number;
          costUnit: number;
          channel: string;
          notes: string;
        }>
      ) => apiClient.put(`/printing/sales/${id}`, data),
      delete: (id: string) => apiClient.delete(`/printing/sales/${id}`),
      liquidar: (id: string) =>
        apiClient.patch(`/printing/sales/${id}/liquidar`),
      settlements: {
        list: (saleId: string) =>
          apiClient.get(`/printing/sales/${saleId}/settlements`),
        add: (
          saleId: string,
          data: { amount?: number; qty?: number; date?: string; notes?: string }
        ) => apiClient.post(`/printing/sales/${saleId}/settlements`, data),
        delete: (id: string) => apiClient.delete(`/printing/settlements/${id}`),
      },
    },
    photos: {
      add: (productId: string, dataUrl: string) =>
        apiClient.post(`/printing/products/${productId}/photos`, { dataUrl }),
      delete: (id: string) => apiClient.delete(`/printing/photos/${id}`),
      reorder: (productId: string, ids: string[]) =>
        apiClient.put(`/printing/products/${productId}/photos/order`, { ids }),
    },
    orders: {
      list: () => apiClient.get("/printing/orders"),
      create: (data: {
        customerName?: string;
        items: { productId: string; qty: number; unitPrice?: number }[];
        notes?: string;
        status?: string;
      }) => apiClient.post("/printing/orders", data),
      update: (
        id: string,
        data: {
          customerName?: string;
          notes?: string;
          items?: { productId: string; qty: number; unitPrice?: number }[];
        }
      ) => apiClient.put(`/printing/orders/${id}`, data),
      updateStatus: (id: string, status: string) =>
        apiClient.patch(`/printing/orders/${id}/status`, { status }),
      delete: (id: string) => apiClient.delete(`/printing/orders/${id}`),
      pay: (id: string, amount?: number) =>
        apiClient.post(`/printing/orders/${id}/pay`, { amount }),
    },
    notices: {
      list: () => apiClient.get("/printing/payment-notices"),
      resolve: (id: string, status: "confirmado" | "descartado") =>
        apiClient.patch(`/printing/payment-notices/${id}`, { status }),
    },
    stock: {
      get: () => apiClient.get("/printing/stock"),
      check: (items: { productId: string; qty: number }[]) =>
        apiClient.post("/printing/stock/check", { items }),
      finishFilament: (id: string, date?: string) =>
        apiClient.post(`/printing/filaments/${id}/finish`, { date }),
    },
    jobs: {
      list: () => apiClient.get("/printing/jobs"),
      create: (data: {
        title: string;
        productId?: string;
        date?: string;
        grams?: number;
        hours?: number;
        filamentsUsed?: { color?: string; colorHex?: string; grams: number }[];
        notes?: string;
      }) => apiClient.post("/printing/jobs", data),
      delete: (id: string) => apiClient.delete(`/printing/jobs/${id}`),
      link: (id: string, productId: string | null) =>
        apiClient.patch(`/printing/jobs/${id}`, { productId }),
      learn: (id: string, units: number) =>
        apiClient.post(`/printing/jobs/${id}/learn`, { units }),
    },
    bambu: {
      status: () => apiClient.get("/printing/bambu/status"),
      connect: (token: string, region?: "global" | "china") =>
        apiClient.post("/printing/bambu/connect", { token, region }),
      disconnect: () => apiClient.delete("/printing/bambu"),
      sync: (importHistory?: boolean) =>
        apiClient.post("/printing/bambu/sync", { importHistory }),
    },
    // Catalogo publico: SIN auth, se llama tambien desde /catalogo/[token]
    // (fuera del grupo (app), sin login). fetchAPI manda el token si hay
    // sesion pero el backend lo ignora en esta ruta (@Public()).
    publicCatalog: (token: string) =>
      apiClient.get(`/printing/catalog/${token}`),
  },

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
    create: (data: Record<string, any>) =>
      apiClient.post("/activities", data),
    update: (id: string, data: Record<string, any>) =>
      apiClient.put("/activities", { id, ...data }),
    delete: (id: string) => apiClient.delete(`/activities?id=${id}`),
    archive: (id: string) => apiClient.put(`/activities/archive/${id}`),
    restore: (id: string) => apiClient.put(`/activities/restore/${id}`),
  },

  // Chat
  chat: {
    getMessages: () => apiClient.get("/chat"),
    sendMessage: (data: Record<string, any>) =>
      apiClient.post("/chat", data),
    clearMessages: () => apiClient.delete("/chat"),
  },

  // Nutrición
  nutrition: {
    getAnalyses: () => apiClient.get<NutritionAnalysis[]>("/nutrition"),
    createAnalysis: (data: Omit<NutritionAnalysis, "id" | "createdAt" | "updatedAt">) =>
      apiClient.post("/nutrition", data as any),
    getByDate: (date: string) => apiClient.get(`/nutrition?date=${date}`),
    updateAnalysis: (id: string, data: any) =>
      apiClient.put(`/nutrition/${id}`, data),
    deleteAnalysis: (id: string) => apiClient.delete(`/nutrition/${id}`),
    setCompliance: (
      id: string,
      compliance: "on_diet" | "off_diet" | null,
      note?: string
    ) =>
      apiClient.patch<NutritionAnalysis>(`/nutrition/${id}/compliance`, {
        compliance,
        note,
      }),
    getComplianceStats: (from: string, to: string) =>
      apiClient.get(`/nutrition/compliance-stats?from=${from}&to=${to}`),
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
    getAll: () => apiClient.get("/completions"),
    toggle: (data: Record<string, any>) =>
      apiClient.post("/completions", data),
    update: (id: string, data: Record<string, any>) =>
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
    generate: (data: Record<string, any>) =>
      apiClient.post("/ai-suggestions", data),
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
    updateGoals: (data: {
      dailyCalorieGoal?: number;
      proteinGoal?: number;
      carbsGoal?: number;
      fatGoal?: number;
    }) => apiClient.put("/preferences/goals", data),
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
    logPlate: (data: {
      componentIds: string[];
      mealType: string;
      date?: string;
    }) => apiClient.post("/saved-meals/log-plate", data),
    classifyComponents: () =>
      apiClient.post("/saved-meals/classify-components"),
    update: (
      id: string,
      data: Partial<
        Pick<
          SavedMeal,
          | "name"
          | "description"
          | "mealType"
          | "component"
          | "foods"
          | "totalCalories"
          | "macronutrients"
        >
      >
    ) => apiClient.put(`/saved-meals/${id}`, data),
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
    computePlanGoals: (id: string) =>
      apiClient.post<{
        planId: string;
        planName: string;
        source: "plan" | "promedio-dias" | "estimado-ia";
        goals: {
          dailyCalorieGoal?: number;
          proteinGoal?: number;
          carbsGoal?: number;
          fatGoal?: number;
        };
        rationale?: string | null;
      }>(`/meal-prep/nutritionist-plan/${id}/compute-goals`),

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
      // platform: "native" agrega un marcador en el state para que la pagina
      // de callback rebote el code a la app via deep link.
      getAuthUrl: (platform?: string) =>
        apiClient.get<{ url: string }>(
          `/calendar/google/auth-url${platform ? `?platform=${platform}` : ""}`,
        ),
      callback: (code: string) =>
        apiClient.post("/calendar/google/callback", { code }),
      sync: () => apiClient.post("/calendar/google/sync"),
      disconnect: () => apiClient.delete("/calendar/google/disconnect"),
      getStatus: () =>
        apiClient.get<GoogleCalendarStatus>("/calendar/google/status"),
    },
  },

  // DEVICE TOKENS (push notifications)
  deviceTokens: {
    register: (token: string, platform: string) =>
      apiClient.post("/device-tokens", { token, platform }),
    unregister: (token: string) =>
      apiClient.delete(`/device-tokens/${encodeURIComponent(token)}`),
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
  sleep: {
    getStats: (days = 7) => apiClient.get(`/sleep/stats?days=${days}`),
    getByDate: (date: string) => apiClient.get(`/sleep/${date}`),
    upsert: (data: {
      date: string;
      minutesAsleep: number;
      bedTime?: string | null;
      wakeTime?: string | null;
      quality?: number | null;
      notes?: string | null;
    }) => apiClient.post("/sleep", data),
    remove: (date: string) => apiClient.delete(`/sleep/${date}`),
  },

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
    getPace: (date?: string) =>
      apiClient.get(`/hydration/pace${date ? `?date=${date}` : ""}`),
    setBlocks: (blocks: unknown[]) =>
      apiClient.put("/hydration/blocks", { blocks }),
    setTrainingToday: (value: boolean | null, date?: string) =>
      apiClient.put("/hydration/training-today", { value, date }),
    set: (data: { date: string; glasses: number }) =>
      apiClient.put<HydrationLog>("/hydration", data),
    getGoal: () => apiClient.get<HydrationGoal>("/hydration/goal"),
    setGoal: (data: HydrationGoal) =>
      apiClient.put<void>("/hydration/goal", data),
  },

  // SWEAT TESTS (tasa de sudoración → meta de agua real)
  sweatTests: {
    getAll: () => apiClient.get("/sweat-tests"),
    getStats: () => apiClient.get("/sweat-tests/stats"),
    getRecommendation: (trainingHours = 2) =>
      apiClient.get(`/sweat-tests/recommendation?trainingHours=${trainingHours}`),
    create: (data: {
      date: string;
      activity?: string;
      durationMin: number;
      weightBeforeKg: number;
      weightAfterKg: number;
      fluidIntakeMl?: number;
      indoor?: boolean;
      temperatureC?: number;
      notes?: string;
    }) => apiClient.post("/sweat-tests", data),
    remove: (id: string) => apiClient.delete(`/sweat-tests/${id}`),
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

  // BRIEFING
  briefing: {
    getByDate: (date?: string) =>
      apiClient.get<any>(`/briefing${date ? `?date=${date}` : ""}`),
    getRange: (from: string, to: string) =>
      apiClient.get<any[]>(`/briefing/range?from=${from}&to=${to}`),
    generate: (data?: { date?: string; send?: boolean }) =>
      apiClient.post<{ briefing: any; emailSent: boolean }>(
        "/briefing/generate",
        data || {},
      ),
  },

  // Goals (fondo de ahorro — Objetivo NZ)
  quickActions: {
    getConfig: () => apiClient.get("/quick-actions/config"),
    setConfig: (data: {
      aguaVasosPorTap?: number;
      notaMoodDefault?: number;
      gastoCategoriaDefault?: string | null;
    }) => apiClient.put("/quick-actions/config", data),
  },
  goals: {
    getAll: () => apiClient.get<Goal[]>("/goals"),
    getProgress: () => apiClient.get<GoalProgress>("/goals/progress"),
    create: (data: {
      name: string;
      targetUsd: number;
      description?: string;
      targetDate?: string;
      currentUsd?: number;
      startDate?: string;
    }) => apiClient.post<Goal>("/goals", data),
    contribute: (
      goalId: string,
      data: { amountUsd: number; description?: string; date?: string },
    ) =>
      apiClient.post<{ goal: Goal; contribution: GoalContribution }>(
        `/goals/${goalId}/contributions`,
        data,
      ),
  },
};

export default apiClient;
