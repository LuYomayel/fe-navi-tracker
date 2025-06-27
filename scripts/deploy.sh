#!/bin/bash

# NaviTracker - Script de Deployment Local/Manual
# ===============================================

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración por defecto
DEFAULT_PROJECT_PATH="/home/fe-navi-tracker"
DEFAULT_PM2_NAME="navi-tracker-frontend"
DEFAULT_PORT="3150"

# Función para logging
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

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    error "No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
fi

log "🚀 Iniciando deployment de NaviTracker..."

# Verificar Git status
if [ -n "$(git status --porcelain)" ]; then
    warning "Hay cambios sin commitear en el repositorio"
    read -p "¿Continuar de todas formas? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Deployment cancelado"
    fi
fi

# Hacer backup de node_modules y .next si existen
log "💾 Creando backup..."
if [ -d "node_modules" ]; then
    mv node_modules node_modules.backup.$(date +%Y%m%d-%H%M%S) || true
fi
if [ -d ".next" ]; then
    mv .next .next.backup.$(date +%Y%m%d-%H%M%S) || true
fi

# Git pull
log "📥 Actualizando código desde Git..."
git fetch origin
git pull origin main

# Limpiar cache de npm
log "🧹 Limpiando cache de npm..."
npm cache clean --force || true

# Instalar dependencias
log "📦 Instalando dependencias..."
npm install

# Verificar dependencias críticas
log "🔍 Verificando dependencias críticas..."
npm ls next react react-dom || warning "Algunas dependencias críticas pueden tener problemas"

# Build del proyecto
log "🔨 Construyendo proyecto..."
npm run build

# Verificar que el build fue exitoso
if [ ! -d ".next" ]; then
    error "Build falló - no se encontró directorio .next"
fi

success "Build completado exitosamente"

# Verificar archivos críticos del build
log "🔍 Verificando archivos del build..."
if [ ! -f ".next/BUILD_ID" ]; then
    warning "No se encontró BUILD_ID"
fi

if [ ! -d ".next/static" ]; then
    warning "No se encontró directorio static"
fi

if [ ! -f ".next/standalone/server.js" ]; then
    warning "No se encontró server.js standalone - verifica la configuración de Next.js"
fi

# Mostrar estadísticas del build
log "📊 Estadísticas del build:"
echo "  - Build ID: $(cat .next/BUILD_ID 2>/dev/null || echo 'No disponible')"
echo "  - Tamaño total: $(du -sh .next 2>/dev/null || echo 'No disponible')"
echo "  - Archivos estáticos: $(find .next/static -type f 2>/dev/null | wc -l || echo '0') archivos"
echo "  - Standalone server: $([ -f .next/standalone/server.js ] && echo 'Disponible' || echo 'No encontrado')"

# Si estamos en producción, reiniciar servicios
if [ "$1" = "--production" ]; then
    log "🔄 Reiniciando servicios de producción..."
    
    # Reiniciar PM2
    if command -v pm2 &> /dev/null; then
        log "Reiniciando PM2 ($DEFAULT_PM2_NAME)..."
        
        # Verificar si el proceso existe
        if pm2 list | grep -q "$DEFAULT_PM2_NAME"; then
            pm2 restart $DEFAULT_PM2_NAME
        else
            warning "Proceso $DEFAULT_PM2_NAME no encontrado, intentando reiniciar por ID..."
            pm2 restart 5 || {
                warning "No se pudo reiniciar por ID, iniciando nuevo proceso..."
                pm2 start .next/standalone/server.js --name "$DEFAULT_PM2_NAME"
            }
        fi
        
        pm2 status
    else
        warning "PM2 no está instalado o no está en el PATH"
    fi
    
    # Reiniciar Apache2
    if command -v systemctl &> /dev/null; then
        log "Reiniciando Apache2..."
        sudo systemctl restart apache2
        sudo systemctl status apache2 --no-pager -l
    else
        warning "systemctl no está disponible"
    fi
    
    # Test de conectividad
    log "🔍 Verificando conectividad en puerto $DEFAULT_PORT..."
    sleep 5
    if curl -f http://localhost:$DEFAULT_PORT > /dev/null 2>&1; then
        success "Aplicación respondiendo en puerto $DEFAULT_PORT"
    else
        warning "La aplicación no responde en puerto $DEFAULT_PORT"
        if command -v pm2 &> /dev/null; then
            log "Verificando logs de PM2..."
            pm2 logs $DEFAULT_PM2_NAME --lines 10 || pm2 logs --lines 10
        fi
    fi
else
    log "ℹ️  Para reiniciar servicios en producción, usa: $0 --production"
    log "ℹ️  Configuración detectada:"
    echo "    - Directorio: $DEFAULT_PROJECT_PATH"
    echo "    - Proceso PM2: $DEFAULT_PM2_NAME"
    echo "    - Puerto: $DEFAULT_PORT"
fi

# Limpiar backups antiguos (más de 7 días)
log "🧹 Limpiando backups antiguos..."
find . -maxdepth 1 -name "*.backup.*" -mtime +7 -delete || true

# Logging del deployment
echo "$(date): Deployment exitoso desde commit $(git rev-parse --short HEAD)" >> deployment.log

success "🎉 Deployment completado exitosamente!"

# Mostrar información útil
echo
echo "=================================="
log "Información del deployment:"
echo "  - Commit: $(git rev-parse --short HEAD)"
echo "  - Branch: $(git branch --show-current)"
echo "  - Fecha: $(date)"
echo "  - Usuario: $(whoami)"
echo "  - Directorio: $(pwd)"
echo "  - Configuración:"
echo "    * Directorio proyecto: $DEFAULT_PROJECT_PATH"
echo "    * Proceso PM2: $DEFAULT_PM2_NAME"
echo "    * Puerto aplicación: $DEFAULT_PORT"
echo
log "Comandos útiles:"
echo "  - Ver logs de PM2: pm2 logs $DEFAULT_PM2_NAME"
echo "  - Ver estado de Apache: sudo systemctl status apache2"
echo "  - Ver logs de deployment: tail -f deployment.log"
echo "  - Rollback: git reset --hard HEAD~1 && $0"
echo "  - Test aplicación: curl -I http://localhost:$DEFAULT_PORT"
echo "==================================" 