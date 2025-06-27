# 🚨 SOLUCIÓN DEPLOYMENT - NaviTracker

## Problemas Identificados

### 1. **CRÍTICO: Node.js Incompatible**

- **Problema**: Servidor con Node.js v18.17.1, pero se requiere >= 18.18.0
- **Síntomas**:
  - `npm WARN EBADENGINE` para @prisma/client, Next.js, ESLint
  - Build falla con `next: not found`
  - PM2 no puede encontrar `.next/standalone/server.js`

### 2. **Timeout de Red en npm**

- **Problema**: `npm ERR! network Socket timeout`
- **Causa**: Conexión lenta o inestable del servidor

### 3. **Configuración PM2 Incorrecta**

- **Problema**: Busca archivo que no existe
- **Error**: `Cannot find module '/home/fe-navi-tracker/.next/standalone/server.js'`

## ✅ SOLUCIÓN IMPLEMENTADA

### Cambios en el Workflow CI/CD

1. **Actualización Automática de Node.js**:

   - Instala/actualiza Node.js 20 LTS automáticamente
   - Múltiples métodos: nvm, apt, yum
   - Verificación de versión antes y después

2. **Instalación Robusta de npm**:

   - Timeouts largos (5 minutos)
   - 5 reintentos automáticos
   - Limpieza de cache entre intentos
   - Instalación de emergencia sin package-lock

3. **Build Inteligente**:

   - Múltiples métodos de build
   - Configuración automática de Next.js standalone
   - Servidor alternativo si standalone falla

4. **PM2 Dinámico**:
   - Configuración generada automáticamente
   - Detección del archivo de servidor correcto
   - Logs estructurados

## 🛠️ EJECUCIÓN MANUAL (Si GitHub Actions Falla)

### Opción 1: Script de Emergencia

```bash
# En el servidor (/home/fe-navi-tracker)
chmod +x scripts/emergency-fix.sh
./scripts/emergency-fix.sh
```

### Opción 2: Comandos Manuales

```bash
# 1. Actualizar Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20

# 2. Limpiar y reinstalar
cd /home/fe-navi-tracker
rm -rf node_modules package-lock.json .next
npm cache clean --force

# 3. Configurar npm
npm config set timeout 300000
npm config set fetch-retries 5

# 4. Instalar dependencias
npm install --legacy-peer-deps --engine-strict=false

# 5. Build
npx next build

# 6. Configurar PM2
pm2 delete navi-tracker-frontend || true
pm2 start .next/standalone/server.js --name navi-tracker-frontend

# 7. Reiniciar Apache
sudo systemctl restart apache2
```

## 🔍 VERIFICACIÓN

### Comandos de Diagnóstico

```bash
# Verificar Node.js
node --version  # Debe ser >= 18.18.0

# Verificar build
ls -la .next/standalone/server.js

# Verificar PM2
pm2 status
pm2 logs navi-tracker-frontend --lines 20

# Test de conectividad
curl http://localhost:3150

# Estado de Apache
sudo systemctl status apache2
```

### Estado Esperado

```
✅ Node.js: v20.x.x
✅ npm: 10.x.x
✅ Build: .next/standalone/server.js existe
✅ PM2: navi-tracker-frontend online
✅ Apache: active (running)
✅ App: responde en puerto 3150
```

## 🚨 TROUBLESHOOTING

### Si Node.js no se actualiza:

```bash
# Método manual Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Método manual CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

### Si npm sigue fallando:

```bash
# Usar mirror alternativo
npm config set registry https://registry.npmmirror.com/
# o
npm config set registry https://registry.npmjs.org/

# Limpiar completamente
rm -rf ~/.npm
npm cache clean --force
```

### Si PM2 no inicia:

```bash
# Verificar archivo
ls -la .next/standalone/server.js

# Si no existe, usar servidor alternativo
node start-server.js  # (creado automáticamente)

# Reiniciar PM2 completamente
pm2 kill
pm2 start ecosystem.config.js
```

## 📋 CHECKLIST POST-DEPLOYMENT

- [ ] Node.js >= 18.18.0
- [ ] `npm install` exitoso sin errores críticos
- [ ] `npx next build` exitoso
- [ ] Archivo `.next/standalone/server.js` existe
- [ ] PM2 proceso `navi-tracker-frontend` online
- [ ] Apache2 activo y funcionando
- [ ] App responde en `http://localhost:3150`
- [ ] Logs de PM2 sin errores críticos

## 🎯 PRÓXIMOS PASOS

1. **Push a main** para activar el deployment automático mejorado
2. **Monitorear logs** del GitHub Action
3. **Verificar funcionamiento** con los comandos de diagnóstico
4. **Si falla**, ejecutar script de emergencia manualmente

---

**Nota**: El problema principal era la diferencia mínima pero crítica entre Node.js v18.17.1 y v18.18.0. Prisma y Next.js 15 requieren estrictamente >= 18.18.0.
