# Migración al Backend NestJS

## ✅ Estado Actual

Todas las rutas API del frontend Next.js han sido configuradas para redireccionar al backend NestJS.

## 🔄 Rutas Migradas

| Endpoint Frontend                | Endpoint Backend      | Estado                  |
| -------------------------------- | --------------------- | ----------------------- |
| `/api/activities`                | `/api/activities`     | ✅ Migrado              |
| `/api/chat`                      | `/api/chat`           | ✅ Migrado              |
| `/api/completions`               | `/api/completions`    | ✅ Migrado              |
| `/api/nutrition`                 | `/api/nutrition`      | ✅ Migrado              |
| `/api/body-analysis`             | `/api/body-analysis`  | ✅ Migrado              |
| `/api/body-analyses`             | `/api/body-analysis`  | ✅ Migrado (redirigido) |
| `/api/ai-suggestions`            | `/api/ai-suggestions` | ✅ Migrado              |
| `/api/analyze-food`              | `/api/analyze-food`   | ✅ Migrado              |
| `/api/auth/login`                | `/api/auth/login`     | ✅ Migrado              |
| `/api/auth/logout`               | `/api/auth/logout`    | ✅ Migrado              |
| `/api/nutrition-recommendations` | `/api/nutrition`      | ✅ Migrado (redirigido) |

## 🚀 Para Arrancar

### 1. Backend (NestJS)

```bash
cd be-habit-tracker/backend
npm run start:dev  # Puerto 3001
```

### 2. Frontend (Next.js)

```bash
cd habit-tracker
npm run dev  # Puerto 3000
```

## ⚙️ Configuración

### Variables de Entorno

```env
# Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Backend (.env)
DATABASE_URL="mysql://root:password@localhost:3306/habit_tracker"
OPENAI_API_KEY=your-openai-api-key-here  # Opcional
```

## 🏗️ Arquitectura

```
┌─────────────────┐     HTTP     ┌─────────────────┐
│  Frontend       │ ──────────► │  Backend        │
│  Next.js :3000  │             │  NestJS :3001   │
│                 │             │                 │
│  API Routes     │             │  8 Modules      │
│  (Proxy)        │             │  - activities   │
│                 │             │  - chat         │
│                 │             │  - nutrition    │
│                 │             │  - completions  │
│                 │             │  - analyze-food │
│                 │             │  - body-analysis│
│                 │             │  - ai-suggestions│
│                 │             │  - auth         │
└─────────────────┘             └─────────────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │   MySQL DB      │
                                │   Prisma ORM    │
                                └─────────────────┘
```

## 🔧 Funcionalidades Implementadas

### ✅ Completamente Funcional

- **Activities**: CRUD completo
- **Chat**: Mensajes + limpieza
- **Completions**: Toggle de actividades
- **Auth**: Login/logout básico

### ⚠️ Con Fallbacks Mock

- **Nutrition**: Análisis nutricional (requiere OpenAI)
- **Body Analysis**: Análisis corporal (requiere OpenAI)
- **Analyze Food**: Análisis de fotos (requiere OpenAI)
- **AI Suggestions**: Sugerencias inteligentes (requiere OpenAI)

## 🚀 Producción

### 1. Variables de Entorno Producción

```env
# Frontend
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com

# Backend
DATABASE_URL="mysql://user:password@host:3306/habit_tracker_prod"
OPENAI_API_KEY=your-production-openai-key
NODE_ENV=production
```

### 2. Deployment Sugerido

- **Frontend**: Vercel
- **Backend**: Railway, Heroku, DigitalOcean
- **Base de Datos**: PlanetScale, Railway MySQL

### 3. Optimizaciones Producción

- [ ] Rate limiting en endpoints
- [ ] CORS configurado correctamente
- [ ] Logging estructurado
- [ ] Health checks
- [ ] Monitoreo y métricas

## 🛠️ Próximos Pasos

1. **Configurar OpenAI API Keys** para funcionalidades IA
2. **Configurar base de datos** en producción
3. **Deploy backend** en servicio cloud
4. **Actualizar variables** de entorno frontend
5. **Testing** end-to-end completo

## 📝 Notas Técnicas

- Todas las rutas mantienen la misma interfaz de respuesta: `{success: boolean, data?: any, error?: string}`
- El proxy maneja automáticamente query parameters
- Headers de autorización se pasan automáticamente
- Fallbacks locales cuando el backend no está disponible
