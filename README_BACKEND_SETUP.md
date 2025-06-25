# 🚀 Setup Backend para Producción

## ✅ Lo que ya está listo

### Backend NestJS (be-habit-tracker/backend/)

- ✅ 8 módulos implementados con toda la funcionalidad
- ✅ Estructura modular y escalable
- ✅ Prisma ORM configurado
- ✅ Tipos TypeScript consistentes
- ✅ Fallbacks mock para funcionalidades IA

### Frontend Next.js (habit-tracker/)

- ✅ Todas las rutas API redirigen al backend
- ✅ Cliente API actualizado para usar backend
- ✅ Configuración de proxy centralizada
- ✅ Compatibilidad 100% mantenida

## 🔧 Setup Rápido para Producción

### 1. Configurar Backend

```bash
cd be-habit-tracker/backend

# Instalar dependencias (ya hecho)
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración
```

### 2. Variables Backend (.env)

```env
# Base de datos
DATABASE_URL="mysql://user:password@host:3306/habit_tracker"

# OpenAI (opcional, tiene fallbacks)
OPENAI_API_KEY=your-openai-api-key

# Puerto
PORT=3001

# CORS
CORS_ORIGIN=https://your-frontend-domain.com
```

### 3. Configurar Frontend

```bash
cd habit-tracker

# Variables de entorno
# Crear .env.local:
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
```

### 4. Deploy Backend (Railway/Heroku/DigitalOcean)

```bash
# Desde be-habit-tracker/backend/
npm run build
npm run start:prod
```

### 5. Deploy Frontend (Vercel)

```bash
# Desde habit-tracker/
vercel --prod
```

## 🎯 URLs de Producción

- **Frontend**: `https://habit-tracker.vercel.app`
- **Backend**: `https://habit-tracker-api.railway.app`
- **API Base**: `https://habit-tracker-api.railway.app/api`

## 📋 Checklist Producción

### Backend

- [ ] Base de datos MySQL/PostgreSQL configurada
- [ ] Variables de entorno configuradas
- [ ] `npx prisma db push` ejecutado
- [ ] OpenAI API key configurada (opcional)
- [ ] Deploy en Railway/Heroku
- [ ] Health check funcionando

### Frontend

- [ ] `NEXT_PUBLIC_BACKEND_URL` apuntando a producción
- [ ] Deploy en Vercel
- [ ] Domain configurado
- [ ] Funcionamiento end-to-end verificado

## 🚨 Troubleshooting

### Backend no arranca

```bash
# Verificar variables de entorno
cat .env

# Verificar conexión DB
npx prisma db push

# Verificar puerto
curl http://localhost:3001/api/activities
```

### Frontend no conecta

```bash
# Verificar variables
cat .env.local

# Verificar en browser network tab
# Debe hacer requests a: NEXT_PUBLIC_BACKEND_URL/api/*
```

## 🔥 Demo Rápido Local

```bash
# Terminal 1 - Backend
cd be-habit-tracker/backend
npm run start:dev

# Terminal 2 - Frontend
cd habit-tracker
npm run dev

# Abrir: http://localhost:3000
# Backend: http://localhost:3001/api
```

## 💡 Notas Importantes

1. **Base de Datos**: El backend necesita una base de datos MySQL configurada
2. **OpenAI**: Sin API key, usa fallbacks mock (funciona igual)
3. **CORS**: Ya configurado para desarrollo, ajustar para producción
4. **Tipos**: Compartidos entre frontend y backend para consistencia
5. **Fallbacks**: Todo funciona aunque falle algún servicio externo
