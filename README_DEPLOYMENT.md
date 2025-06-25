# 🚀 NaviTracker - Deployment en Servidor

## ⚡ **INSTALACIÓN RÁPIDA**

### 1. Preparar Servidor

```bash
# Instalar Docker y Docker Compose (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reiniciar sesión para aplicar cambios de grupo
```

### 2. Clonar y Configurar

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/navitracker.git
cd navitracker

# Configurar variables de entorno
cp env.example .env
nano .env  # ¡IMPORTANTE: Cambiar contraseñas y secretos!
```

### 3. Deploy Automático

```bash
# Ejecutar script de deployment
chmod +x deploy.sh
./deploy.sh
```

### 4. Verificar

- Abrir: `http://tu-servidor:3000`
- Login: `demo@navitracker.com` / `demo123`

---

## 🔧 **CONFIGURACIÓN MANUAL**

### Variables de Entorno Críticas

```env
# Cambiar TODAS estas contraseñas
MYSQL_ROOT_PASSWORD=tu_password_super_seguro_2024
MYSQL_PASSWORD=otro_password_seguro_2024
NEXTAUTH_SECRET=secreto_jwt_muy_largo_y_aleatorio
JWT_SECRET=otro_secreto_diferente_y_seguro

# Tu dominio
NEXTAUTH_URL=https://tu-dominio.com

# API Key de Anthropic
ANTHROPIC_API_KEY=tu_api_key_aqui
```

### Comandos Docker

```bash
# Construir y ejecutar
docker-compose build
docker-compose up -d

# Ver logs
docker-compose logs -f

# Reiniciar
docker-compose restart

# Parar
docker-compose down
```

---

## 🌐 **CONFIGURAR DOMINIO**

### 1. DNS

```
A    tu-dominio.com        -> IP_DEL_SERVIDOR
A    www.tu-dominio.com    -> IP_DEL_SERVIDOR
```

### 2. SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot

# Parar Nginx
docker-compose stop nginx

# Obtener certificados
sudo certbot certonly --standalone -d tudominio.com -d www.tudominio.com

# Copiar certificados
sudo cp /etc/letsencrypt/live/tudominio.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/tudominio.com/privkey.pem ./ssl/key.pem
sudo chown $USER:$USER ./ssl/*.pem

# Editar nginx.conf (descomentar líneas SSL)
nano nginx.conf

# Reiniciar Nginx
docker-compose up -d nginx
```

---

## 📊 **MONITOREO**

### Health Check

```bash
# Verificar estado del sistema
./healthcheck.sh
```

### Comandos Útiles

```bash
# Estado de contenedores
docker-compose ps

# Logs en tiempo real
docker-compose logs -f navitracker

# Uso de recursos
docker stats

# Backup de base de datos
./backup.sh
```

---

## 🔄 **ACTUALIZACIÓN**

```bash
# Actualización simple
docker-compose down
git pull
docker-compose build --no-cache
docker-compose up -d

# Verificar que funciona
curl http://localhost:3000
```

---

## 🆘 **TROUBLESHOOTING**

### Aplicación no inicia

```bash
# Ver logs
docker-compose logs navitracker

# Verificar variables de entorno
docker-compose exec navitracker env | grep DATABASE_URL

# Reiniciar
docker-compose restart navitracker
```

### Base de datos no conecta

```bash
# Verificar MySQL
docker-compose ps mysql
docker-compose logs mysql

# Probar conexión
docker-compose exec mysql mysql -u root -p
```

### Puertos ocupados

```bash
# Ver qué usa el puerto
sudo netstat -tulpn | grep :3000

# Cambiar puerto en docker-compose.yml
nano docker-compose.yml
# Cambiar "3000:3000" por "3001:3000"
```

---

## 📋 **ARCHIVOS IMPORTANTES**

- `docker-compose.yml` - Configuración de servicios
- `Dockerfile` - Imagen de la aplicación
- `nginx.conf` - Configuración del proxy reverso
- `.env` - Variables de entorno (¡NO subir a Git!)
- `deploy.sh` - Script de deployment automático
- `backup.sh` - Script de backup
- `healthcheck.sh` - Verificación de estado

---

## 🔐 **SEGURIDAD**

### Cambiar Contraseñas por Defecto

```bash
# Generar contraseñas seguras
openssl rand -base64 32  # Para NEXTAUTH_SECRET
openssl rand -base64 32  # Para JWT_SECRET
openssl rand -base64 24  # Para MySQL passwords
```

### Firewall Básico

```bash
# Ubuntu/Debian
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable
```

---

## 📞 **SOPORTE**

### Generar Reporte de Estado

```bash
echo "=== ESTADO DE NAVITRACKER ===" > status_report.txt
docker-compose ps >> status_report.txt
docker-compose logs --tail=50 >> status_report.txt
```

### Contacto

- 📧 Email: soporte@navitracker.com
- 🐛 Issues: https://github.com/tu-usuario/navitracker/issues

---

## ✅ **CHECKLIST**

- [ ] Docker y Docker Compose instalados
- [ ] Repositorio clonado
- [ ] Variables de entorno configuradas
- [ ] Contraseñas cambiadas
- [ ] API key de Anthropic configurada
- [ ] Aplicación funcionando
- [ ] Base de datos conectada
- [ ] Dominio configurado (opcional)
- [ ] SSL configurado (opcional)
- [ ] Backup programado

**¡Listo para producción! 🎉**
