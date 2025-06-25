export interface User {
  id: string;
  email: string;
  name: string;
  plan: "free" | "basic" | "premium";
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  avatar?: string;
  // Preferencias del usuario
  preferences?: UserPreferences;
  // Suscripción/Plan
  planExpiresAt?: Date;
}

export interface UserPreferences {
  // Configuración general
  language: "es" | "en";
  darkMode: boolean;
  notifications: boolean;
  timezone: string;

  // Datos personales para cálculos
  height?: number; // cm
  currentWeight?: number; // kg
  age?: number;
  gender?: "male" | "female" | "other";
  activityLevel?: ActivityLevel;

  // Objetivos nutricionales
  dailyCalorieGoal?: number;
  proteinGoal?: number; // gramos
  carbsGoal?: number; // gramos
  fatGoal?: number; // gramos

  // Objetivos corporales
  bodyFatGoal?: number; // porcentaje
  muscleMassGoal?: number; // kg
  targetWeight?: number; // kg

  // Configuración de módulos
  enabledModules: ModuleName[];
  defaultModule: ModuleName;
}

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type ModuleName = "habits" | "nutrition" | "fitness" | "wellness";

// Tipos JWT del backend
export interface JWTTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    message: string;
    user: User;
    tokens: JWTTokens;
    expiresAt: string;
  };
}

export interface AuthSession {
  user: User;
  tokens: JWTTokens;
  expiresAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface RefreshTokenData {
  refreshToken: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

// Respuesta de perfil
export interface ProfileResponse {
  success: boolean;
  data: {
    user: User;
  };
}

// Respuesta de verificación de token
export interface VerifyTokenResponse {
  success: boolean;
  data: {
    message: string;
    user: {
      sub: string;
      email: string;
      name: string;
      plan: string;
    };
  };
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}
