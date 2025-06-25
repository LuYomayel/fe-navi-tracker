# 🚀 **GUÍA COMPLETA DE DEPLOYMENT - NAVITRACKER**

## 📋 **ÍNDICE**

1. [Requisitos del Servidor](#requisitos-del-servidor)
2. [Instalación Rápida](#instalación-rápida)
3. [Instalación Manual](#instalación-manual)
4. [Configuración de Dominio](#configuración-de-dominio)
5. [Certificados SSL](#certificados-ssl)
6. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
7. [Troubleshooting](#troubleshooting)

---

## 🖥️ **REQUISITOS DEL SERVIDOR**

### **Mínimos Recomendados**

- **CPU**: 2 cores
- **RAM**: 4GB
- **Almacenamiento**: 20GB SSD
- **SO**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Puertos**: 80, 443, 3000, 3306

### **Software Necesario**

- Docker 20.10+
- Docker Compose 2.0+
- Git
- Curl

---

## ⚡ **INSTALACIÓN RÁPIDA**

### **1. Clonar el Repositorio**

```bash
git clone https://github.com/tu-usuario/navitracker.git
cd navitracker
```

### **2. Configurar Variables de Entorno**

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar configuraciones (¡IMPORTANTE!)
nano .env
```

**Variables críticas a cambiar:**

```env
# Cambiar TODAS las contraseñas por valores seguros
MYSQL_ROOT_PASSWORD=tu_password_super_seguro_2024
MYSQL_PASSWORD=otro_password_seguro_2024
NEXTAUTH_SECRET=secreto_jwt_muy_largo_y_aleatorio
JWT_SECRET=otro_secreto_diferente_y_seguro

# Configurar tu dominio
NEXTAUTH_URL=https://tu-dominio.com

# Agregar tu API key de Anthropic
ANTHROPIC_API_KEY=tu_api_key_aqui
```

### **3. Ejecutar Deployment Automático**

```bash
# Hacer script ejecutable
chmod +x deploy.sh

# Ejecutar deployment
./deploy.sh
```

### **4. Verificar Instalación**

- Abrir: `http://tu-servidor:3000`
- Login demo: `demo@navitracker.com` / `demo123`

---

## 🔧 **INSTALACIÓN MANUAL**

### **1. Instalar Docker (Ubuntu/Debian)**

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Agregar clave GPG de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Agregar repositorio
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
```

### **2. Instalar Docker (CentOS/RHEL)**

```bash
# Instalar Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io

# Iniciar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### **3. Clonar y Configurar**

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/navitracker.git
cd navitracker

# Configurar variables de entorno
cp env.example .env
nano .env  # Editar configuraciones

# Crear directorios necesarios
mkdir -p uploads mysql-init ssl
```

### **4. Construir y Ejecutar**

```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Verificar estado
docker-compose ps
docker-compose logs -f
```

---

## 🌐 **CONFIGURACIÓN DE DOMINIO**

### **1. Configurar DNS**

Apuntar tu dominio al servidor:

```
A    tu-dominio.com        -> IP_DEL_SERVIDOR
A    www.tu-dominio.com    -> IP_DEL_SERVIDOR
```

### **2. Configurar Nginx**

```bash
# Editar configuración de Nginx
nano nginx.conf

# Cambiar todas las instancias de 'tu-dominio.com' por tu dominio real
sed -i 's/tu-dominio.com/tudominio.com/g' nginx.conf
```

### **3. Actualizar Variables de Entorno**

```bash
# Editar .env
nano .env

# Cambiar NEXTAUTH_URL
NEXTAUTH_URL=https://tudominio.com
```

### **4. Reiniciar Servicios**

```bash
docker-compose restart navitracker nginx
```

---

## 🔒 **CERTIFICADOS SSL**

### **Opción 1: Let's Encrypt (Recomendado)**

```bash
# Instalar Certbot
sudo apt install -y certbot

# Parar Nginx temporalmente
docker-compose stop nginx

# Obtener certificados
sudo certbot certonly --standalone -d tudominio.com -d www.tudominio.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/tudominio.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/tudominio.com/privkey.pem ./ssl/key.pem
sudo chown $USER:$USER ./ssl/*.pem

# Editar nginx.conf y descomentar líneas SSL
nano nginx.conf

# Reiniciar Nginx
docker-compose up -d nginx
```

### **Opción 2: Certificados Propios**

```bash
# Generar certificado autofirmado (solo para testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./ssl/key.pem \
  -out ./ssl/cert.pem \
  -subj "/C=ES/ST=State/L=City/O=Organization/CN=tudominio.com"

# Descomentar líneas SSL en nginx.conf
nano nginx.conf

# Reiniciar Nginx
docker-compose restart nginx
```

### **Renovación Automática de Let's Encrypt**

```bash
# Crear script de renovación
cat > renew-ssl.sh << 'EOF'
#!/bin/bash
docker-compose stop nginx
certbot renew --quiet
cp /etc/letsencrypt/live/tudominio.com/fullchain.pem ./ssl/cert.pem
cp /etc/letsencrypt/live/tudominio.com/privkey.pem ./ssl/key.pem
docker-compose start nginx
EOF

chmod +x renew-ssl.sh

# Agregar a crontab (renovar cada 2 meses)
echo "0 3 1 */2 * /path/to/navitracker/renew-ssl.sh" | crontab -
```

---

## 📊 **MONITOREO Y MANTENIMIENTO**

### **Comandos Útiles**

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f navitracker
docker-compose logs -f mysql

# Reiniciar servicios
docker-compose restart
docker-compose restart navitracker

# Parar todos los servicios
docker-compose down

# Actualizar aplicación
git pull
docker-compose build --no-cache
docker-compose up -d

# Backup de base de datos
docker-compose exec mysql mysqldump -u root -p navitracker > backup_$(date +%Y%m%d).sql

# Restaurar base de datos
docker-compose exec -i mysql mysql -u root -p navitracker < backup_20241201.sql
```

### **Monitoreo de Recursos**

```bash
# Ver uso de recursos de contenedores
docker stats

# Ver espacio en disco
df -h
docker system df

# Limpiar imágenes no utilizadas
docker system prune -a
```

### **Logs del Sistema**

```bash
# Ver logs de aplicación
docker-compose logs navitracker | tail -100

# Ver logs de MySQL
docker-compose logs mysql | tail -100

# Ver logs de Nginx
docker-compose logs nginx | tail -100
```

---

## 🔧 **TROUBLESHOOTING**

### **Problema: Aplicación no inicia**

```bash
# Verificar logs
docker-compose logs navitracker

# Verificar variables de entorno
docker-compose exec navitracker env | grep DATABASE_URL

# Reiniciar contenedor
docker-compose restart navitracker
```

### **Problema: No conecta a la base de datos**

```bash
# Verificar que MySQL esté corriendo
docker-compose ps mysql

# Probar conexión manual
docker-compose exec mysql mysql -u root -p

# Verificar configuración de red
docker network ls
docker network inspect navitracker_navitracker-network
```

### **Problema: Nginx no funciona**

```bash
# Verificar configuración de Nginx
docker-compose exec nginx nginx -t

# Ver logs de Nginx
docker-compose logs nginx

# Verificar certificados SSL
openssl x509 -in ./ssl/cert.pem -text -noout
```

### **Problema: Puertos ocupados**

```bash
# Ver qué está usando el puerto
sudo netstat -tulpn | grep :3000
sudo lsof -i :3000

# Cambiar puerto en docker-compose.yml
nano docker-compose.yml
# Cambiar "3000:3000" por "3001:3000"
```

### **Problema: Falta espacio en disco**

```bash
# Limpiar Docker
docker system prune -a -f

# Limpiar logs de Docker
sudo truncate -s 0 /var/lib/docker/containers/*/*-json.log

# Ver archivos más grandes
du -h --max-depth=1 | sort -hr
```

---

## 🔄 **ACTUALIZACIÓN**

### **Actualización Simple**

```bash
# Parar servicios
docker-compose down

# Actualizar código
git pull

# Reconstruir y reiniciar
docker-compose build --no-cache
docker-compose up -d
```

### **Actualización con Backup**

```bash
# Hacer backup de base de datos
docker-compose exec mysql mysqldump -u root -p navitracker > backup_antes_actualizacion.sql

# Actualizar
git pull
docker-compose build --no-cache
docker-compose up -d

# Verificar que todo funciona
curl http://localhost:3000
```

---

## 📞 **SOPORTE**

### **Información del Sistema**

```bash
# Generar reporte de estado
echo "=== ESTADO DE NAVITRACKER ===" > status_report.txt
echo "Fecha: $(date)" >> status_report.txt
echo "" >> status_report.txt
echo "Docker version:" >> status_report.txt
docker --version >> status_report.txt
echo "" >> status_report.txt
echo "Docker Compose version:" >> status_report.txt
docker-compose --version >> status_report.txt
echo "" >> status_report.txt
echo "Contenedores:" >> status_report.txt
docker-compose ps >> status_report.txt
echo "" >> status_report.txt
echo "Logs recientes:" >> status_report.txt
docker-compose logs --tail=50 >> status_report.txt
```

### **Contacto**

- 📧 Email: tu-email@dominio.com
- 🐛 Issues: https://github.com/tu-usuario/navitracker/issues
- 📖 Documentación: https://github.com/tu-usuario/navitracker/wiki

---

## ✅ **CHECKLIST DE DEPLOYMENT**

- [ ] Servidor configurado con Docker y Docker Compose
- [ ] Repositorio clonado
- [ ] Variables de entorno configuradas (.env)
- [ ] Contraseñas cambiadas por valores seguros
- [ ] API key de Anthropic configurada
- [ ] Aplicación desplegada y funcionando
- [ ] Base de datos MySQL funcionando
- [ ] Dominio apuntando al servidor (si aplica)
- [ ] Certificados SSL configurados (si aplica)
- [ ] Nginx configurado como proxy reverso (si aplica)
- [ ] Backup automático configurado
- [ ] Monitoreo básico configurado

---

**¡Deployment completado! 🎉**

Tu aplicación NaviTracker está lista para producción.
