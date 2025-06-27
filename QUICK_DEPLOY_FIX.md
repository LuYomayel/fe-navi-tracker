# 🚀 **Solución Rápida - Errores de Deployment**

## ✅ **Problemas Identificados y Solucionados**

1. **Sharp version conflict** - ✅ Resuelto
2. **Directorio incorrecto** - ✅ Corregido a `/home/fe-navi-tracker`
3. **Puerto incorrecto** - ✅ Cambiado a `3150`
4. **Nombre de proceso PM2** - ✅ Actualizado a `navi-tracker-frontend`
5. **Deployment workflow mejorado** - ✅ Listo

---

## ⚠️ **LO QUE NECESITAS HACER AHORA**

### **Paso 1: Configurar GitHub Secrets**

**Ve inmediatamente a tu repositorio en GitHub:**

```
1. GitHub.com → Tu repositorio
2. Settings → Secrets and variables → Actions
3. New repository secret
```

**Configura estos secrets con TU CONFIGURACIÓN REAL:**

| Secret         | Valor                         | Tu Configuración        |
| -------------- | ----------------------------- | ----------------------- |
| `HOST`         | IP o dominio de tu servidor   | Tu servidor             |
| `USERNAME`     | Tu usuario SSH                | Tu usuario              |
| `SSH_KEY`      | Tu clave SSH privada completa | `-----BEGIN OPENSSH...` |
| `PROJECT_PATH` | **`/home/fe-navi-tracker`**   | ✅ Corregido            |

### **Paso 2: Obtener tu SSH_KEY**

```bash
# En tu máquina local, ejecuta:
cat ~/.ssh/id_rsa
# O si usas ed25519:
cat ~/.ssh/id_ed25519
```

**Copia TODO el contenido** (incluyendo `-----BEGIN` y `-----END`)

### **Paso 3: Verificar conexión SSH**

```bash
# Prueba que puedes conectarte:
ssh tu-usuario@tu-servidor.com

# Verifica el directorio del proyecto (CORREGIDO):
ssh tu-usuario@tu-servidor.com "ls -la /home/fe-navi-tracker"
```

---

## 🔧 **Configuración Actualizada**

### **Directorio del Proyecto:**

- ❌ **Anterior:** `/var/www/navitracker`
- ✅ **Correcto:** `/home/fe-navi-tracker`

### **Puerto de la Aplicación:**

- ❌ **Anterior:** `3000`
- ✅ **Correcto:** `3150`

### **Nombre del Proceso PM2:**

- ❌ **Anterior:** `navitracker`
- ✅ **Correcto:** `navi-tracker-frontend`

### **Script de PM2:**

- ❌ **Anterior:** `npm start`
- ✅ **Correcto:** `.next/standalone/server.js`

---

## 🚀 **Hacer el Deployment**

Una vez configurados los secrets:

```bash
# Commit y push los cambios
git add .
git commit -m "fix: corregir configuración de deployment - directorio y puerto"
git push origin main
```

**¡El deployment se ejecutará automáticamente con la configuración correcta!**

---

## 📊 **Verificar que Funciona**

1. **Ve a GitHub Actions:** `tu-repo → Actions`
2. **Verifica el workflow:** Debería encontrar el proyecto en `/home/fe-navi-tracker`
3. **Revisa los logs:** Para confirmar que se conecta al puerto 3150

---

## 🔧 **Si Aún Tienes Problemas**

### **Error: "Permission denied"**

```bash
# En tu servidor:
sudo chown -R tu-usuario:tu-usuario /home/fe-navi-tracker
```

### **Error: "sudo: no tty present"**

```bash
# En tu servidor, edita sudoers:
sudo visudo
# Agrega esta línea:
tu-usuario ALL=(ALL) NOPASSWD: /bin/systemctl restart apache2
```

### **Error: "PM2 not found"**

```bash
# En tu servidor:
npm install -g pm2
pm2 list
```

### **Verificar configuración actual:**

```bash
# En tu servidor:
cd /home/fe-navi-tracker
pm2 list
pm2 show navi-tracker-frontend
curl -I http://localhost:3150
```

---

## 💡 **Resumen de Cambios Realizados**

✅ **Sharp actualizado** a versión 0.34.2  
✅ **Directorio corregido** a `/home/fe-navi-tracker`  
✅ **Puerto corregido** a `3150`  
✅ **Proceso PM2 corregido** a `navi-tracker-frontend`  
✅ **Script PM2 corregido** a `.next/standalone/server.js`  
✅ **Workflow mejorado** con configuración real  
✅ **Ecosystem.config.js actualizado** con tu configuración

---

## 🎯 **Próximos Pasos**

1. ✅ Configurar secrets en GitHub (5 minutos)
2. ✅ Push a main
3. ✅ Ver el deployment automático funcionando
4. ✅ ¡Disfrutar del CI/CD automático!

**¡Ahora el deployment debería encontrar tu proyecto y funcionar correctamente!** 🚀

### **Configuración de Secrets Correcta:**

```
HOST=tu-servidor.com
USERNAME=tu-usuario
SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----...
PROJECT_PATH=/home/fe-navi-tracker
```

**Una vez configurados los secrets, el deployment automático:**

1. Se conectará a `/home/fe-navi-tracker`
2. Ejecutará git pull, npm install, npm run build
3. Reiniciará `navi-tracker-frontend` en PM2
4. Verificará que responda en puerto `3150`
5. Reiniciará Apache2

¡Todo listo para funcionar! 🎉
