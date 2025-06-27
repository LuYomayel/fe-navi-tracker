# 🚀 Deployment en Netlify - Habit Tracker

## 📋 **Guía Paso a Paso**

### **1. Preparación del Proyecto**

```bash
# Verificar que el build funciona localmente
npm run build:fast

# Debe completar en ~2-4 segundos sin errores
✓ Compiled successfully in 2000ms
```

### **2. Configuración en Netlify**

#### **A. Conectar Repositorio**

1. Ve a [netlify.com](https://netlify.com) y haz login
2. Click en "New site from Git"
3. Conecta tu repositorio de GitHub
4. Selecciona el branch `main`

#### **B. Configuración de Build**

```toml
# netlify.toml (ya configurado)
[build]
  command = "npm run build:fast"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NODE_OPTIONS = "--max-old-space-size=2048"
  NODE_ENV = "production"
  SKIP_TYPE_CHECK = "true"
```

#### **C. Variables de Entorno**

En el dashboard de Netlify, ve a **Site settings > Environment variables** y agrega:

```bash
# Producción
NEXT_PUBLIC_API_URL=https://api-navi-tracker.luciano-yomayel.com
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=2048
NEXT_TELEMETRY_DISABLED=1
```

### **3. Configuración de Dominios**

#### **Dominio Custom (Opcional)**

```bash
# En Netlify dashboard
Site settings > Domain management > Custom domains
# Agregar: habit-tracker.tu-dominio.com
```

#### **HTTPS Automático**

- Netlify proporciona SSL/TLS automático
- Se configura automáticamente al agregar dominio custom

### **4. Optimizaciones Específicas de Netlify**

#### **A. Headers de Seguridad y Performance**

```toml
# Ya configurado en netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Cache-Control = "public, max-age=31536000, immutable"
```

#### **B. Redirects para SPA**

```toml
# Para manejar rutas de Next.js
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### **C. Funciones Serverless (Si las necesitas)**

```javascript
// netlify/functions/api.js
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Netlify!" }),
  };
};
```

### **5. Deploy Automático**

#### **A. Configuración de Branch**

```bash
# Producción: main branch
# Staging: develop branch (opcional)
# Preview: cualquier PR
```

#### **B. Build Hooks (Opcional)**

```bash
# Para rebuilds automáticos desde el backend
curl -X POST -d {} https://api.netlify.com/build_hooks/YOUR_HOOK_ID
```

### **6. Monitoreo y Debugging**

#### **A. Logs de Build**

```bash
# En Netlify dashboard
Site overview > Production deploys > View deploy logs
```

#### **B. Analytics**

```bash
# Habilitar en Netlify dashboard
Site settings > Analytics
```

#### **C. Performance**

```bash
# Lighthouse automático
Site settings > Performance
```

### **7. Ventajas de Netlify vs VPS**

| Característica     | Netlify     | VPS Actual               |
| ------------------ | ----------- | ------------------------ |
| **Setup**          | 5 minutos   | 2+ horas                 |
| **Escalabilidad**  | Automática  | Manual                   |
| **SSL/HTTPS**      | Automático  | Manual                   |
| **CDN Global**     | Incluido    | No                       |
| **Deploy Preview** | Automático  | No                       |
| **Rollback**       | 1 click     | Manual                   |
| **Costo**          | Gratis/Bajo | Servidor + Mantenimiento |
| **Uptime**         | 99.9%+      | Depende                  |

### **8. Comandos Útiles**

#### **Deploy Manual (si es necesario)**

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy manual
netlify deploy --prod --dir=.next
```

#### **Preview Local con Netlify**

```bash
# Simular entorno de Netlify
netlify dev
```

### **9. Troubleshooting**

#### **Build Fails**

```bash
# Verificar Node.js version
NODE_VERSION = "20" en netlify.toml

# Verificar memoria
NODE_OPTIONS = "--max-old-space-size=2048"

# Verificar comando
command = "npm run build:fast"
```

#### **404 en Rutas**

```bash
# Verificar redirects en netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### **API No Funciona**

```bash
# Verificar variable de entorno
NEXT_PUBLIC_API_URL=https://api-navi-tracker.luciano-yomayel.com

# Test desde browser console
fetch(process.env.NEXT_PUBLIC_API_URL + '/health')
```

### **10. Migración desde VPS**

#### **A. Backup del VPS**

```bash
# Hacer backup de configuraciones
scp user@server:/path/to/configs ./backup/
```

#### **B. Actualizar DNS**

```bash
# Cambiar registros A/CNAME a Netlify
# Netlify te dará las IPs/dominios específicos
```

#### **C. Verificar Funcionalidad**

```bash
# Test completo en staging
# Verificar todas las funciones
# Monitorear por 24-48h
```

## 🎯 **Resultado Final**

### **Performance Esperado en Netlify:**

- **Build Time**: 1-3 minutos (vs 30+ min en VPS)
- **Deploy Time**: 30-60 segundos
- **Cold Start**: < 100ms
- **Global CDN**: < 50ms worldwide
- **Uptime**: 99.9%+

### **Costos:**

- **Starter (Gratis)**: 100GB bandwidth, 300 build minutes
- **Pro ($19/mes)**: 1TB bandwidth, 25,000 build minutes
- **Business ($99/mes)**: Ilimitado + features enterprise

## 🚀 **Deploy Now!**

```bash
# 1. Push código a GitHub
git add .
git commit -m "Optimized for Netlify deployment"
git push origin main

# 2. Conectar en Netlify dashboard
# 3. ¡Listo en 5 minutos!
```

**¡Tu aplicación estará disponible globalmente con CDN en minutos!** 🌍
