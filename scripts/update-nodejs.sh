#!/bin/bash

# Script para actualizar Node.js en el servidor
# =============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log "🚀 Iniciando actualización de Node.js..."

# Verificar versión actual
log "🔍 Versión actual de Node.js: $(node --version)"

# Verificar si nvm está instalado
if command -v nvm &> /dev/null; then
    log "✅ nvm encontrado, actualizando Node.js..."
    
    # Cargar nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    # Instalar Node.js 20 LTS
    log "📦 Instalando Node.js 20 LTS..."
    nvm install 20
    nvm use 20
    nvm alias default 20
    
    success "✅ Node.js actualizado a: $(node --version)"
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    log "🐧 Sistema Linux detectado, instalando Node.js 20..."
    
    # Actualizar repositorios
    log "📦 Actualizando repositorios..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    
    # Instalar Node.js
    log "📦 Instalando Node.js 20..."
    sudo apt-get install -y nodejs
    
    success "✅ Node.js actualizado a: $(node --version)"
    
else
    warning "⚠️  No se pudo determinar el método de instalación"
    warning "⚠️  Por favor, actualiza Node.js manualmente a >= 18.18.0"
    exit 1
fi

# Verificar npm
log "🔍 Versión de npm: $(npm --version)"

# Actualizar npm si es necesario
log "📦 Actualizando npm..."
npm install -g npm@latest

log "🔍 Nueva versión de npm: $(npm --version)"

# Verificar que la versión es suficiente
NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1,2)
REQUIRED_VERSION="18.18"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
    success "✅ Node.js $(node --version) es compatible con las dependencias"
else
    error "❌ Node.js $(node --version) sigue siendo incompatible. Se requiere >= 18.18.0"
fi

# Si estamos en el directorio del proyecto, reinstalar dependencias
if [ -f "package.json" ]; then
    log "📁 Proyecto detectado, reinstalando dependencias..."
    
    # Limpiar instalación anterior
    rm -rf node_modules package-lock.json
    npm cache clean --force
    
    # Reinstalar dependencias
    npm install --legacy-peer-deps
    
    success "✅ Dependencias reinstaladas exitosamente"
    
    # Probar build
    log "🔨 Probando build..."
    npm run build
    
    if [ -d ".next" ]; then
        success "✅ Build exitoso"
    else
        error "❌ Build falló"
    fi
else
    log "ℹ️  No se detectó package.json. Ejecuta este script desde el directorio del proyecto para reinstalar dependencias."
fi

success "🎉 Actualización de Node.js completada exitosamente!"

echo
echo "=================================="
log "Información final:"
echo "  - Node.js: $(node --version)"
echo "  - npm: $(npm --version)"
echo "  - Directorio: $(pwd)"
echo
log "Próximos pasos:"
echo "  1. Verificar que PM2 funciona: pm2 restart navi-tracker-frontend"
echo "  2. Probar la aplicación: curl -I http://localhost:3150"
echo "  3. Hacer push para probar CI/CD automático"
echo "==================================" 