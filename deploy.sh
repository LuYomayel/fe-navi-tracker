#!/bin/bash

# NaviTracker - Script de Deployment
# ===================================

set -e  # Salir si cualquier comando falla

echo "🚀 Iniciando deployment de NaviTracker..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado. Por favor instala Docker primero."
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
fi

# Verificar que el archivo .env existe
if [ ! -f .env ]; then
    warning "No se encontró el archivo .env"
    log "Copiando env.example a .env..."
    cp env.example .env
    warning "Por favor edita el archivo .env con tus configuraciones antes de continuar."
    warning "Especialmente cambia las contraseñas y secretos por valores seguros."
    read -p "¿Has configurado el archivo .env? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Por favor configura el archivo .env primero."
    fi
fi

# Crear directorios necesarios
log "Creando directorios necesarios..."
mkdir -p uploads
mkdir -p mysql-init
mkdir -p ssl

# Parar contenedores existentes si están corriendo
log "Parando contenedores existentes..."
docker-compose down --remove-orphans || true

# Construir imágenes
log "Construyendo imágenes Docker..."
docker-compose build --no-cache

# Iniciar servicios
log "Iniciando servicios..."
docker-compose up -d mysql

# Esperar a que MySQL esté listo
log "Esperando a que MySQL esté listo..."
sleep 30

# Verificar que MySQL esté funcionando
log "Verificando conexión a MySQL..."
for i in {1..30}; do
    if docker-compose exec mysql mysqladmin ping -h localhost --silent; then
        success "MySQL está funcionando"
        break
    fi
    if [ $i -eq 30 ]; then
        error "MySQL no pudo iniciarse correctamente"
    fi
    log "Esperando MySQL... (intento $i/30)"
    sleep 2
done

# Iniciar la aplicación
log "Iniciando aplicación NaviTracker..."
docker-compose up -d navitracker

# Esperar a que la aplicación esté lista
log "Esperando a que la aplicación esté lista..."
sleep 20

# Verificar que la aplicación esté funcionando
log "Verificando que la aplicación esté funcionando..."
for i in {1..15}; do
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        success "NaviTracker está funcionando correctamente"
        break
    fi
    if [ $i -eq 15 ]; then
        error "La aplicación no pudo iniciarse correctamente"
    fi
    log "Esperando aplicación... (intento $i/15)"
    sleep 2
done

# Iniciar Nginx (opcional)
read -p "¿Quieres iniciar Nginx como proxy reverso? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Iniciando Nginx..."
    docker-compose up -d nginx
    success "Nginx iniciado"
fi

# Mostrar información de deployment
echo
echo "=================================="
success "🎉 Deployment completado exitosamente!"
echo "=================================="
echo
log "Información del deployment:"
echo "  - Aplicación: http://localhost:3000"
echo "  - Base de datos: localhost:3306"
echo "  - Usuario demo: demo@navitracker.com"
echo "  - Contraseña demo: demo123"
echo
log "Comandos útiles:"
echo "  - Ver logs: docker-compose logs -f"
echo "  - Parar servicios: docker-compose down"
echo "  - Reiniciar: docker-compose restart"
echo "  - Actualizar: git pull && docker-compose build --no-cache && docker-compose up -d"
echo
log "Para configurar un dominio personalizado:"
echo "  1. Edita nginx.conf y cambia 'tu-dominio.com' por tu dominio real"
echo "  2. Configura tus certificados SSL en la carpeta ./ssl/"
echo "  3. Descomenta las líneas SSL en nginx.conf"
echo "  4. Reinicia Nginx: docker-compose restart nginx"
echo

# Mostrar estado de los contenedores
log "Estado actual de los contenedores:"
docker-compose ps 