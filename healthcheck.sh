#!/bin/bash

# NaviTracker Health Check Script
# ===============================

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
APP_URL="http://localhost:3000"
DB_CONTAINER="navitracker-mysql"
APP_CONTAINER="navitracker-app"

echo "🏥 NaviTracker Health Check"
echo "=========================="

# Función para verificar estado
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        return 0
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

# 1. Verificar contenedores Docker
echo "📦 Verificando contenedores..."

# MySQL
docker ps | grep $DB_CONTAINER > /dev/null 2>&1
check_status $? "MySQL container está corriendo"

# Aplicación
docker ps | grep $APP_CONTAINER > /dev/null 2>&1
check_status $? "NaviTracker container está corriendo"

# 2. Verificar conectividad de base de datos
echo ""
echo "🗄️ Verificando base de datos..."

docker-compose exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null
check_status $? "MySQL responde a ping"

# 3. Verificar aplicación web
echo ""
echo "🌐 Verificando aplicación web..."

# Verificar que responde HTTP
curl -f -s $APP_URL > /dev/null 2>&1
check_status $? "Aplicación responde HTTP"

# Verificar tiempo de respuesta
response_time=$(curl -o /dev/null -s -w '%{time_total}' $APP_URL 2>/dev/null)
if (( $(echo "$response_time < 5.0" | bc -l) )); then
    echo -e "${GREEN}✅ Tiempo de respuesta: ${response_time}s${NC}"
else
    echo -e "${YELLOW}⚠️ Tiempo de respuesta lento: ${response_time}s${NC}"
fi

# 4. Verificar uso de recursos
echo ""
echo "📊 Verificando recursos..."

# Memoria
memory_usage=$(docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}" | grep $APP_CONTAINER | awk '{print $2}' | cut -d'/' -f1)
echo "💾 Uso de memoria: $memory_usage"

# CPU
cpu_usage=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}" | grep $APP_CONTAINER | awk '{print $2}')
echo "🖥️ Uso de CPU: $cpu_usage"

# Espacio en disco
disk_usage=$(df -h | grep -E '^/dev/' | awk '{print $5}' | head -1)
echo "💿 Uso de disco: $disk_usage"

# 5. Verificar logs recientes
echo ""
echo "📋 Verificando logs recientes..."

# Buscar errores en logs
error_count=$(docker-compose logs --tail=100 navitracker 2>/dev/null | grep -i error | wc -l)
if [ $error_count -eq 0 ]; then
    echo -e "${GREEN}✅ Sin errores en logs recientes${NC}"
else
    echo -e "${YELLOW}⚠️ $error_count errores encontrados en logs${NC}"
fi

# 6. Verificar conectividad externa (si aplica)
echo ""
echo "🌍 Verificando conectividad externa..."

# Test de DNS
nslookup google.com > /dev/null 2>&1
check_status $? "Resolución DNS funcionando"

# Test de conectividad a internet
curl -f -s --max-time 5 https://httpbin.org/status/200 > /dev/null 2>&1
check_status $? "Conectividad a internet"

# Resumen
echo ""
echo "📋 RESUMEN"
echo "=========="

# Verificar estado general
if docker ps | grep -E "(navitracker-mysql|navitracker-app)" | wc -l | grep -q "2"; then
    echo -e "${GREEN}🎉 Sistema funcionando correctamente${NC}"
    exit 0
else
    echo -e "${RED}🚨 Sistema con problemas${NC}"
    echo ""
    echo "Para más información ejecuta:"
    echo "  docker-compose logs"
    echo "  docker-compose ps"
    exit 1
fi 