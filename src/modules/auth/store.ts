import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  User,
  JWTTokens,
  AuthSession,
  LoginCredentials,
  RegisterData,
} from "./types";

interface AuthState {
  user: User | null;
  tokens: JWTTokens | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  setAuthData: (session: AuthSession) => void;
  clearAuth: () => void;
  setHydrated: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateUser: (user: Partial<User>) => void;

  // Utils
  getAccessToken: () => string | null;
  isTokenExpired: () => boolean;
}

// Función para crear un storage seguro que funciona en SSR
const createSafeStorage = () => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return localStorage;
};

// URL del backend
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
const API_BASE = `${BACKEND_URL}/api`;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      expiresAt: null,
      isAuthenticated: false,
      isHydrated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials): Promise<boolean> => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error en el login");
          }

          const data = await response.json();

          if (data.success) {
            const session: AuthSession = {
              user: data.data.user,
              tokens: data.data.tokens,
              expiresAt: data.data.expiresAt,
            };

            get().setAuthData(session);
            set({ isLoading: false });
            return true;
          } else {
            throw new Error(data.message || "Error en el login");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Error desconocido";
          console.error("❌ Error en login:", errorMessage);
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      register: async (data: RegisterData): Promise<boolean> => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error en el registro");
          }

          const responseData = await response.json();

          if (responseData.success) {
            const session: AuthSession = {
              user: responseData.data.user,
              tokens: responseData.data.tokens,
              expiresAt: responseData.data.expiresAt,
            };

            get().setAuthData(session);
            set({ isLoading: false });
            return true;
          } else {
            throw new Error(responseData.message || "Error en el registro");
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Error desconocido";
          console.error("❌ Error en registro:", errorMessage);
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      logout: async (): Promise<void> => {
        const tokens = get().tokens;

        try {
          if (tokens) {
            await fetch(`${API_BASE}/auth/logout`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
                "Content-Type": "application/json",
              },
            });
          }
        } catch (error) {
          console.warn("⚠️ Error al hacer logout en el servidor:", error);
        } finally {
          get().clearAuth();
        }
      },

      refreshToken: async (): Promise<boolean> => {
        const tokens = get().tokens;

        if (!tokens?.refreshToken) {
          console.warn("⚠️ No hay refresh token disponible");
          get().clearAuth();
          return false;
        }

        try {
          const response = await fetch(`${API_BASE}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken: tokens.refreshToken }),
          });

          if (!response.ok) {
            throw new Error("Error al renovar token");
          }

          const data = await response.json();

          if (data.success) {
            const currentUser = get().user;
            if (currentUser) {
              const session: AuthSession = {
                user: currentUser,
                tokens: data.data.tokens,
                expiresAt: new Date(
                  Date.now() + 3 * 24 * 60 * 60 * 1000
                ).toISOString(), // 3 días
              };

              get().setAuthData(session);
              return true;
            }
          }

          throw new Error("No se pudo renovar el token");
        } catch (error) {
          console.error("❌ Error al renovar token:", error);
          get().clearAuth();
          return false;
        }
      },

      setAuthData: (session: AuthSession) => {
        set({
          user: session.user,
          tokens: session.tokens,
          expiresAt: session.expiresAt,
          isAuthenticated: true,
          error: null,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          tokens: null,
          expiresAt: null,
          isAuthenticated: false,
          error: null,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      setHydrated: () => {
        set({ isHydrated: true });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      getAccessToken: (): string | null => {
        const tokens = get().tokens;
        return tokens?.accessToken || null;
      },

      isTokenExpired: (): boolean => {
        const expiresAt = get().expiresAt;
        if (!expiresAt) return true;

        const expirationTime = new Date(expiresAt).getTime();
        const currentTime = Date.now();
        const buffer = 5 * 60 * 1000; // 5 minutos de buffer

        return currentTime >= expirationTime - buffer;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => createSafeStorage()),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        return (state: AuthState | undefined) => {
          if (state?.tokens?.accessToken) {
            // Verificar si el token ha expirado
            if (state.isTokenExpired()) {
              state.refreshToken();
            }
          } else {
            console.log("❌ No hay token en localStorage");
          }

          // Siempre marcar como hidratado
          if (state) {
            state.setHydrated();
          } else {
            const store = useAuthStore.getState();
            store.setHydrated();
          }
        };
      },
    }
  )
);
