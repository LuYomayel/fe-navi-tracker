// Configuración de la API
export const API_CONFIG = {
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000",
  get API_BASE() {
    return `${this.BACKEND_URL}/api`;
  },

  // Endpoints
  ENDPOINTS: {
    ACTIVITIES: "/activities",
    COMPLETIONS: "/completions",
    NUTRITION: "/nutrition",
    BODY_ANALYSIS: "/body-analysis",
    CHAT: "/chat",
    AI_SUGGESTIONS: "/ai-suggestions",
    ANALYZE_FOOD: "/analyze-food",
    AUTH: "/auth",
  },

  // Configuración de timeouts
  DEFAULT_TIMEOUT: 10000,

  // Headers por defecto
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },

  // Configuración de desarrollo
  isDevelopment: process.env.NODE_ENV === "development",

  // Timeout para requests
  REQUEST_TIMEOUT: 30000, // 30 segundos
};

export default API_CONFIG;
