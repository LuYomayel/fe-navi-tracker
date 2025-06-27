#!/bin/bash

echo "🚨 SCRIPT DE EMERGENCIA - NaviTracker Deployment Fix"
echo "=================================================="

# Función para mostrar el estado actual
show_status() {
    echo "📊 Estado Actual:"
    echo "- Node.js: $(node --version 2>/dev/null || echo 'No disponible')"
    echo "- npm: $(npm --version 2>/dev/null || echo 'No disponible')"
    echo "- Directorio: $(pwd)"
    echo "- PM2 Status:"
    pm2 status 2>/dev/null || echo "  PM2 no disponible"
    echo ""
}

# Mostrar estado inicial
show_status

# 1. ACTUALIZAR NODE.JS (CRÍTICO)
echo "🔧 PASO 1: Actualizando Node.js..."

if command -v nvm &> /dev/null; then
    echo "✅ nvm encontrado, actualizando..."
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    nvm install 20
    nvm use 20
    nvm alias default 20
    echo "✅ Node.js actualizado: $(node --version)"
else
    echo "❌ nvm no encontrado, instalando..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    nvm install 20
    nvm use 20
    nvm alias default 20
    echo "✅ Node.js instalado: $(node --version)"
fi

# 2. LIMPIAR TODO
echo "🧹 PASO 2: Limpiando instalaciones previas..."
rm -rf node_modules package-lock.json .next || true
npm cache clean --force || true

# 3. CONFIGURAR NPM PARA CONEXIONES LENTAS
echo "⚙️ PASO 3: Configurando npm..."
npm config set timeout 300000
npm config set fetch-timeout 300000
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
npm config set fetch-retries 5

# 4. INSTALAR DEPENDENCIAS CON REINTENTOS
echo "📦 PASO 4: Instalando dependencias..."
INSTALL_SUCCESS=false

for attempt in 1 2 3; do
    echo "🔄 Intento $attempt..."
    
    if npm install --legacy-peer-deps --engine-strict=false --timeout=300000; then
        INSTALL_SUCCESS=true
        echo "✅ Instalación exitosa"
        break
    else
        echo "❌ Falló intento $attempt"
        rm -rf node_modules package-lock.json || true
        sleep 10
    fi
done

if [ "$INSTALL_SUCCESS" = false ]; then
    echo "❌ ERROR: No se pudo instalar dependencias"
    exit 1
fi

# 5. BUILD DEL PROYECTO
echo "🔨 PASO 5: Building proyecto..."
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

if npx next build; then
    echo "✅ Build exitoso"
else
    echo "❌ ERROR: Build falló"
    exit 1
fi

# 6. VERIFICAR STANDALONE
echo "🔍 PASO 6: Verificando archivos standalone..."
if [ -f ".next/standalone/server.js" ]; then
    echo "✅ Archivo standalone encontrado"
    SERVER_SCRIPT=".next/standalone/server.js"
else
    echo "⚠️ Creando servidor alternativo..."
    cat > start-server.js << 'EOF'
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3150

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
EOF
    SERVER_SCRIPT="start-server.js"
fi

# 7. CONFIGURAR PM2
echo "⚙️ PASO 7: Configurando PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'navi-tracker-frontend',
    script: '$SERVER_SCRIPT',
    cwd: '$(pwd)',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3150
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M'
  }]
};
EOF

mkdir -p logs

# 8. REINICIAR PM2
echo "🔄 PASO 8: Reiniciando PM2..."
pm2 delete navi-tracker-frontend 2>/dev/null || true
pm2 start ecosystem.config.js

# 9. REINICIAR APACHE
echo "🔄 PASO 9: Reiniciando Apache..."
sudo systemctl restart apache2

# 10. VERIFICACIÓN FINAL
echo "🔍 PASO 10: Verificación final..."
sleep 10

show_status

if curl -f http://localhost:3150 > /dev/null 2>&1; then
    echo "✅ ¡ÉXITO! Aplicación funcionando en puerto 3150"
else
    echo "❌ Aplicación no responde, verificando logs..."
    pm2 logs navi-tracker-frontend --lines 20 || true
fi

echo ""
echo "🎉 Script de emergencia completado"
echo "📝 Para ejecutar manualmente:"
echo "   chmod +x scripts/emergency-fix.sh"
echo "   ./scripts/emergency-fix.sh"
echo ""
echo "📋 Próximos pasos si aún falla:"
echo "1. Verificar que Node.js >= 18.18.0: node --version"
echo "2. Verificar PM2: pm2 status"
echo "3. Verificar logs: pm2 logs navi-tracker-frontend"
echo "4. Test manual: curl http://localhost:3150" 