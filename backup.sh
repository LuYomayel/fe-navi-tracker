#!/bin/bash

# NaviTracker Backup Script
# =========================

set -e  # Salir si cualquier comando falla

# Configuración
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="navitracker"
MYSQL_CONTAINER="navitracker-mysql"
RETENTION_DAYS=30

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

log "🗄️ Iniciando backup de NaviTracker..."

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

# Verificar que el contenedor MySQL esté corriendo
if ! docker ps | grep $MYSQL_CONTAINER > /dev/null 2>&1; then
    error "El contenedor MySQL no está corriendo"
fi

# Crear backup de la base de datos
log "Creando backup de la base de datos..."
BACKUP_FILE="$BACKUP_DIR/navitracker_backup_$DATE.sql"

# Obtener credenciales desde variables de entorno o usar valores por defecto
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-navitracker_root_2024}

# Crear dump de la base de datos
docker-compose exec -T mysql mysqldump \
    -u root \
    -p$MYSQL_ROOT_PASSWORD \
    --single-transaction \
    --routines \
    --triggers \
    $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    success "Backup de base de datos creado: $BACKUP_FILE"
else
    error "Falló la creación del backup de base de datos"
fi

# Comprimir backup
log "Comprimiendo backup..."
gzip $BACKUP_FILE
BACKUP_FILE_GZ="$BACKUP_FILE.gz"

if [ -f $BACKUP_FILE_GZ ]; then
    success "Backup comprimido: $BACKUP_FILE_GZ"
    
    # Mostrar tamaño del archivo
    SIZE=$(du -h $BACKUP_FILE_GZ | cut -f1)
    log "Tamaño del backup: $SIZE"
else
    error "Falló la compresión del backup"
fi

# Backup de archivos de configuración
log "Creando backup de configuración..."
CONFIG_BACKUP="$BACKUP_DIR/config_backup_$DATE.tar.gz"

tar -czf $CONFIG_BACKUP \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='backups' \
    --exclude='uploads' \
    --exclude='.next' \
    .env docker-compose.yml nginx.conf 2>/dev/null || true

if [ -f $CONFIG_BACKUP ]; then
    success "Backup de configuración creado: $CONFIG_BACKUP"
else
    warning "No se pudo crear backup de configuración (archivos pueden no existir)"
fi

# Backup de uploads (si existe)
if [ -d "./uploads" ]; then
    log "Creando backup de uploads..."
    UPLOADS_BACKUP="$BACKUP_DIR/uploads_backup_$DATE.tar.gz"
    
    tar -czf $UPLOADS_BACKUP uploads/
    
    if [ -f $UPLOADS_BACKUP ]; then
        success "Backup de uploads creado: $UPLOADS_BACKUP"
        SIZE=$(du -h $UPLOADS_BACKUP | cut -f1)
        log "Tamaño del backup de uploads: $SIZE"
    fi
fi

# Limpiar backups antiguos
log "Limpiando backups antiguos (más de $RETENTION_DAYS días)..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

REMAINING_BACKUPS=$(ls -1 $BACKUP_DIR/*.sql.gz 2>/dev/null | wc -l)
log "Backups restantes: $REMAINING_BACKUPS"

# Crear script de restauración
RESTORE_SCRIPT="$BACKUP_DIR/restore_$DATE.sh"
cat > $RESTORE_SCRIPT << EOF
#!/bin/bash
# Script de restauración automática para backup del $DATE

echo "🔄 Restaurando backup de NaviTracker del $DATE..."

# Descomprimir backup
gunzip -k $BACKUP_FILE_GZ

# Restaurar base de datos
echo "Restaurando base de datos..."
docker-compose exec -i mysql mysql -u root -p\$MYSQL_ROOT_PASSWORD $DB_NAME < $BACKUP_FILE

echo "✅ Restauración completada"
echo "⚠️  Recuerda reiniciar la aplicación: docker-compose restart navitracker"
EOF

chmod +x $RESTORE_SCRIPT
success "Script de restauración creado: $RESTORE_SCRIPT"

# Resumen final
echo ""
echo "📋 RESUMEN DEL BACKUP"
echo "===================="
log "Fecha: $(date)"
log "Base de datos: $BACKUP_FILE_GZ"
if [ -f $CONFIG_BACKUP ]; then
    log "Configuración: $CONFIG_BACKUP"
fi
if [ -f $UPLOADS_BACKUP ]; then
    log "Uploads: $UPLOADS_BACKUP"
fi
log "Script de restauración: $RESTORE_SCRIPT"

# Verificar integridad del backup
log "Verificando integridad del backup..."
if gunzip -t $BACKUP_FILE_GZ 2>/dev/null; then
    success "✅ Backup íntegro y válido"
else
    error "❌ Backup corrupto"
fi

success "🎉 Backup completado exitosamente"

# Mostrar comandos útiles
echo ""
echo "📚 COMANDOS ÚTILES:"
echo "Para restaurar este backup:"
echo "  $RESTORE_SCRIPT"
echo ""
echo "Para restaurar manualmente:"
echo "  gunzip -c $BACKUP_FILE_GZ | docker-compose exec -i mysql mysql -u root -p $DB_NAME"
echo ""
echo "Para programar backups automáticos:"
echo "  crontab -e"
echo "  # Agregar línea: 0 2 * * * /path/to/navitracker/backup.sh" 