# 🚀 **CI/CD Setup - NaviTracker**

## 📋 **Resumen**

Este proyecto incluye un sistema de CI/CD automático que se ejecuta cada vez que haces push a la rama `main`. El sistema:

1. **Ejecuta tests y linting** automáticamente
2. **Despliega a producción** si los tests pasan
3. **Reinicia servicios** (PM2 y Apache2)
4. **Verifica que la aplicación** esté funcionando

---

## ⚙️ **Configuración en GitHub**

### **1. Secrets Requeridos**

Ve a tu repositorio en GitHub → Settings → Secrets and variables → Actions y agrega:

```bash
HOST=tu-servidor.com              # IP o dominio de tu servidor
USERNAME=tu-usuario               # Usuario SSH (ej: ubuntu, root)
SSH_KEY=-----BEGIN PRIVATE KEY... # Tu clave SSH privada completa
PORT=22                          # Puerto SSH (opcional, default: 22)
PROJECT_PATH=/var/www/navitracker # Ruta del proyecto en el servidor
```

### **2. Generar Clave SSH (si no la tienes)**

En tu máquina local:

```bash
# Generar nueva clave SSH
ssh-keygen -t ed25519 -C "navitracker-deploy" -f ~/.ssh/navitracker_deploy

# Copiar clave pública al servidor
ssh-copy-id -i ~/.ssh/navitracker_deploy.pub usuario@tu-servidor.com

# Mostrar clave privada para GitHub Secrets
cat ~/.ssh/navitracker_deploy
```

### **3. Configurar Servidor**

En tu servidor de producción:

```bash
# Instalar PM2 globalmente si no lo tienes
npm install -g pm2

# Configurar PM2 para inicio automático
pm2 startup
pm2 save

# Verificar que el usuario puede ejecutar sudo sin password para systemctl
echo "tu-usuario ALL=(ALL) NOPASSWD: /bin/systemctl restart apache2, /bin/systemctl status apache2" | sudo tee -a /etc/sudoers

# Verificar permisos del directorio del proyecto
sudo chown -R tu-usuario:tu-usuario /var/www/navitracker
```

---

## 🔄 **Workflows Disponibles**

### **1. Test and Lint** (`.github/workflows/test.yml`)

Se ejecuta en:

- Push a `main` o `develop`
- Pull requests a `main`

**Funciones:**

- ✅ Instala dependencias
- ✅ Ejecuta linting
- ✅ Verifica tipos TypeScript
- ✅ Construye el proyecto
- ✅ Verifica artefactos del build
- ✅ Auditoría de seguridad

### **2. Deploy to Production** (`.github/workflows/deploy.yml`)

Se ejecuta en:

- Push a `main` (automático)
- Manualmente desde GitHub Actions

**Funciones:**

- 🚀 Conecta al servidor vía SSH
- 📥 Hace git pull de main
- 📦 Instala dependencias
- 🔨 Construye el proyecto
- 🔄 Reinicia PM2 (proceso 5)
- 🔄 Reinicia Apache2
- ✅ Verifica que la app funcione

---

## 📝 **Scripts Locales**

### **Deployment Manual**

```bash
# Deployment local sin reiniciar servicios
./scripts/deploy.sh

# Deployment completo con reinicio de servicios
./scripts/deploy.sh --production
```

### **Testing Local**

```bash
# Ejecutar tests y linting
npm run lint
npm run build

# Verificar tipos
npx tsc --noEmit

# Auditoría de seguridad
npm audit
```

---

## 🔍 **Monitoreo y Debugging**

### **Ver Estado de Deployment**

```bash
# En GitHub
# Ve a: tu-repo → Actions → Ver el último workflow

# En el servidor
tail -f /var/www/navitracker/deployment.log
pm2 logs navitracker
sudo systemctl status apache2
```

### **Comandos Útiles en Servidor**

```bash
# Estado de PM2
pm2 status
pm2 logs navitracker --lines 50

# Estado de Apache2
sudo systemctl status apache2
sudo journalctl -u apache2 -f

# Estado de la aplicación
curl -I http://localhost:3000
netstat -tlnp | grep 3000

# Espacio en disco
df -h
du -sh /var/www/navitracker
```

### **Rollback Manual**

```bash
# En el servidor
cd /var/www/navitracker

# Volver al commit anterior
git reset --hard HEAD~1
npm ci
npm run build
pm2 restart 5
sudo systemctl restart apache2
```

---

## 🚨 **Troubleshooting**

### **Error: Permission denied**

```bash
# Verificar permisos SSH
ssh -T git@github.com

# Verificar permisos del directorio
ls -la /var/www/navitracker
sudo chown -R tu-usuario:tu-usuario /var/www/navitracker
```

### **Error: PM2 process not found**

```bash
# Listar procesos PM2
pm2 list

# Iniciar aplicación manualmente
cd /var/www/navitracker
pm2 start npm --name "navitracker" -- start

# Guardar configuración PM2
pm2 save
```

### **Error: Build failed**

```bash
# Verificar logs del build
npm run build

# Limpiar cache y reinstalar
rm -rf node_modules .next
npm ci
npm run build
```

### **Error: Apache2 not starting**

```bash
# Verificar configuración
sudo apache2ctl configtest

# Ver logs detallados
sudo journalctl -u apache2 -n 50

# Verificar puertos
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443
```

---

## 📊 **Configuración Avanzada**

### **Notificaciones (Opcional)**

Agrega a `.github/workflows/deploy.yml`:

```yaml
- name: Notify deployment
  if: always()
  run: |
    curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🚀 NaviTracker deployed to production"}' \
    ${{ secrets.SLACK_WEBHOOK_URL }}
```

### **Deployment Staging**

Crea `.github/workflows/deploy-staging.yml`:

```yaml
on:
  push:
    branches: [develop]
# ... resto similar pero apuntando a servidor de staging
```

### **Scheduled Backups**

Agrega a crontab del servidor:

```bash
# Backup diario a las 2 AM
0 2 * * * cd /var/www/navitracker && tar -czf ../backups/navitracker-$(date +\%Y\%m\%d).tar.gz . && find ../backups -name "*.tar.gz" -mtime +7 -delete
```

---

## ✅ **Checklist de Configuración**

- [ ] Secrets configurados en GitHub
- [ ] Clave SSH configurada
- [ ] PM2 instalado y configurado
- [ ] Permisos sudo configurados
- [ ] Directorio del proyecto con permisos correctos
- [ ] Apache2 configurado
- [ ] Primer deployment manual exitoso
- [ ] Workflow de GitHub Actions funcionando

---

## 🎯 **Flujo de Trabajo Recomendado**

1. **Desarrollo local** → commit y push a `develop`
2. **Testing automático** → verifica que los tests pasen
3. **Pull request** → de `develop` a `main`
4. **Review y merge** → el merge a `main` dispara deployment automático
5. **Verificación** → confirma que la aplicación funciona en producción

---

¡Con esta configuración tendrás un CI/CD completamente automatizado! 🚀
