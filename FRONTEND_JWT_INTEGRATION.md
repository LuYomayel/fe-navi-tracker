# 🔐 Integración JWT - Frontend Next.js

## ✅ Migración Completa del Sistema de Autenticación

El frontend ha sido completamente migrado para usar el sistema JWT del backend NestJS.

---

## 🏗️ Arquitectura de Autenticación

### **Frontend → Backend**

```
Next.js (Puerto 3000) → NestJS (Puerto 4000) → MySQL
```

### **Flujo de Autenticación**

1. **Login/Register**: Usuario ingresa credenciales
2. **JWT**: Backend genera tokens (access + refresh)
3. **Storage**: Tokens se guardan en localStorage
4. **Requests**: Cliente incluye automáticamente Bearer token
5. **Refresh**: Auto-renovación de tokens antes de expirar

---

## 🔄 Cambios Implementados

### **1. Tipos Actualizados** (`src/modules/auth/types.ts`)

```typescript
// Nuevos tipos JWT
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
```

### **2. Store Renovado** (`src/modules/auth/store.ts`)

```typescript
// Funciones principales del store
login: (credentials: LoginCredentials) => Promise<boolean>;
register: (data: RegisterData) => Promise<boolean>;
logout: () => Promise<void>;
refreshToken: () => Promise<boolean>;
getAccessToken: () => string | null;
isTokenExpired: () => boolean;
```

**Características:**

- ✅ Autenticación real con backend
- ✅ Auto-renovación de tokens
- ✅ Gestión de errores
- ✅ Persistencia en localStorage
- ✅ Validación de expiración

### **3. LoginForm Simplificado** (`src/modules/auth/components/LoginForm.tsx`)

```typescript
// Antes: Lógica manual de fetch
const handleSubmit = async (e) => {
  const response = await fetch(/*...*/);
  // 50+ líneas de código
};

// Ahora: Una línea
const handleSubmit = async (e) => {
  const success = await login({ email, password });
  if (success) router.push("/habits");
};
```

### **4. Cliente API Mejorado** (`src/lib/api-client.ts`)

```typescript
// Auto-inclusión de JWT
function getAuthToken(): string | null {
  // Obtiene token automáticamente del localStorage
}

// Auto-renovación de tokens
if (response.status === 401 && token) {
  await refreshAuthToken();
  // Reintenta petición con nuevo token
}

// Headers automáticos
headers: {
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` }),
}
```

**Características:**

- ✅ Token JWT automático en todas las peticiones
- ✅ Auto-renovación cuando token expira
- ✅ Redirección automática al login si falla
- ✅ Manejo robusto de errores
- ✅ Logging detallado

### **5. Configuración Actualizada**

```typescript
// src/config/api.ts
BACKEND_URL: "http://localhost:4000";

// src/lib/api-client.ts
BACKEND_URL: "http://localhost:4000";
```

---

## 🧪 Pruebas Realizadas ✅

### **Backend JWT (Puerto 4000)**

```bash
# Registro exitoso
curl -X POST http://localhost:4000/api/auth/register \
  -d '{"email": "test@ejemplo.com", "password": "123456", "name": "Usuario Test"}'
✅ Token generado

# Login exitoso
curl -X POST http://localhost:4000/api/auth/login \
  -d '{"email": "test@ejemplo.com", "password": "123456"}'
✅ Token generado

# Acceso protegido con token
curl -X GET http://localhost:4000/api/activities \
  -H "Authorization: Bearer <token>"
✅ Datos de actividades obtenidos

# Acceso sin token
curl -X GET http://localhost:4000/api/activities
✅ Error 401 - Unauthorized
```

### **Frontend Integrado**

- ✅ LoginForm usa el nuevo store
- ✅ Store conecta con backend JWT
- ✅ Cliente API incluye token automáticamente
- ✅ Auto-renovación de tokens
- ✅ Redirección al login cuando expira

---

## 🔒 Seguridad Implementada

### **Tokens JWT**

- **Access Token**: 15 minutos
- **Refresh Token**: 7 días
- **Auto-renovación**: 5 minutos antes de expirar
- **Algoritmo**: HS256
- **Issuer/Audience**: Validación adicional

### **Almacenamiento Seguro**

- **localStorage**: Persistencia entre sesiones
- **Hidratación**: Verificación al cargar página
- **Limpieza**: Auto-limpieza en logout/error

### **Protección de Rutas**

- **Guard Global**: Todas las rutas protegidas por defecto
- **Decorador @Public()**: Para rutas públicas específicas
- **Middleware**: Verificación automática de autenticación

---

## 🚀 Estado Actual del Sistema

| Componente         | Estado | Descripción                 |
| ------------------ | ------ | --------------------------- |
| **Backend NestJS** | ✅     | JWT completo en puerto 4000 |
| **Frontend Store** | ✅     | Migrado a JWT               |
| **LoginForm**      | ✅     | Usa nuevo sistema           |
| **API Client**     | ✅     | Auto-inclusión de tokens    |
| **Config**         | ✅     | Puerto 4000 configurado     |
| **Types**          | ✅     | Tipos JWT actualizados      |
| **Auto-refresh**   | ✅     | Renovación automática       |
| **Error Handling** | ✅     | Manejo robusto de errores   |

---

## 🔧 Uso en el Frontend

### **Login**

```typescript
import { useAuthStore } from "@/modules/auth/store";

const { login, isLoading, error } = useAuthStore();

const handleLogin = async () => {
  const success = await login({ email, password });
  if (success) {
    // Redirigir a dashboard
  }
};
```

### **Peticiones API**

```typescript
import { apiClient } from "@/lib/api-client";

// Automáticamente incluye JWT
const activities = await apiClient.get("/activities");
const newActivity = await apiClient.post("/activities", data);
```

### **Verificar Autenticación**

```typescript
const { isAuthenticated, user, logout } = useAuthStore();

if (!isAuthenticated) {
  // Redirigir al login
}

// Información del usuario
console.log(user?.name, user?.email);

// Logout
await logout();
```

---

## 🎯 Próximos Pasos

1. **Middleware de Next.js**: Protección a nivel de rutas
2. **Interceptors**: Manejo global de errores 401
3. **React Query**: Cache inteligente con JWT
4. **SSR**: Autenticación server-side
5. **Roles**: Sistema RBAC
6. **2FA**: Autenticación de dos factores

---

## 🔄 Migración de Componentes

Todos los componentes que usaban la API anterior necesitan actualizarse:

### **Antes (API antigua)**

```typescript
const response = await fetch("/api/activities");
const data = await response.json();
```

### **Después (JWT automático)**

```typescript
const data = await apiClient.get("/activities");
// Token JWT incluido automáticamente
```

---

## ✨ Características Destacadas

### **🔄 Auto-renovación Inteligente**

- Detecta tokens próximos a expirar
- Renueva automáticamente en segundo plano
- Reintenta peticiones fallidas con nuevo token

### **🛡️ Manejo Robusto de Errores**

- Error 401: Auto-renovación o redirección
- Token inválido: Limpieza y redirección
- Network errors: Reintentos automáticos

### **💾 Persistencia Inteligente**

- Hidratación segura en SSR
- Validación de tokens al cargar
- Limpieza automática de tokens expirados

### **🔍 Logging Detallado**

- Todas las operaciones loggeadas
- Debugging fácil en desarrollo
- Visibilidad completa del flujo

---

**🎉 ¡Sistema JWT Completamente Integrado y Funcional!**

El frontend ahora se comunica seamlessly con el backend JWT, proporcionando una experiencia de autenticación profesional y segura.
