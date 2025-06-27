# 🔧 **Actualizar Node.js en el Servidor - Guía Completa**

## ❌ **Problema Identificado**

Tu servidor tiene **Node.js v18.17.1** pero las dependencias requieren **Node.js >= 18.18.0**.

```
Error: Prisma only supports Node.js >= 18.18.
Please upgrade your Node.js version.
```

---

## 🚀 **Solución Rápida**

### **Opción 1: Actualizar Node.js con nvm (Recomendado)**

```bash
# Conectarte a tu servidor
ssh tu-usuario@tu-servidor.com

# Verificar si tienes nvm instalado
nvm --version

# Si tienes nvm, actualizar Node.js
nvm install 20
nvm use 20
nvm alias default 20

# Verificar la nueva versión
node --version  # Debería mostrar v20.x.x
```

### **Opción 2: Si no tienes nvm, instalarlo**

```bash
# En tu servidor, instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recargar el perfil
source ~/.bashrc

# Instalar Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verificar
node --version
npm --version
```

### **Opción 3: Actualizar Node.js directamente (Ubuntu/Debian)**

```bash
# Actualizar repositorios
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js 20
sudo apt-get install -y nodejs

# Verificar
node --version
npm --version
```

---

## 🔄 **Después de Actualizar Node.js**

### **1. Verificar en tu servidor:**

```bash
# Conectarse al servidor
ssh tu-usuario@tu-servidor.com

# Ir al directorio del proyecto
cd /home/fe-navi-tracker

# Verificar versiones
node --version  # Debe ser >= 18.18.0
npm --version

# Limpiar y reinstalar dependencias
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Verificar que se instaló correctamente
ls -la node_modules/prisma
```

### **2. Probar el build:**

```bash
# En el servidor
cd /home/fe-navi-tracker
npm run build

# Verificar que se creó .next
ls -la .next/
```

### **3. Reiniciar PM2:**

```bash
# Reiniciar el proceso
pm2 restart navi-tracker-frontend

# Verificar estado
pm2 status
pm2 logs navi-tracker-frontend
```

---

## 🚀 **Hacer Nuevo Deployment**

Una vez actualizado Node.js:

```bash
# En tu máquina local
git add .
git commit -m "fix: workflow actualizado para manejar versión de Node.js"
git push origin main
```

**El deployment automático ahora:**

1. ✅ Verificará la versión de Node.js
2. ✅ Intentará actualizar con nvm si está disponible
3. ✅ Instalará dependencias con flags para compatibilidad
4. ✅ Continuará con el build y deployment

---

## 🔍 **Verificar que Todo Funciona**

### **En el servidor:**

```bash
# Verificar versiones
node --version
npm --version

# Verificar aplicación
curl -I http://localhost:3150

# Verificar PM2
pm2 status
pm2 logs navi-tracker-frontend --lines 10
```

### **En GitHub Actions:**

Ve a tu repositorio → Actions → Ver el último workflow para confirmar que:

- ✅ Node.js se actualiza correctamente
- ✅ Las dependencias se instalan sin errores
- ✅ El build se completa exitosamente

---

## 🚨 **Si Persisten los Problemas**

### **Alternativa 1: Instalar dependencias manualmente**

```bash
# En el servidor
cd /home/fe-navi-tracker
rm -rf node_modules
npm install --force --legacy-peer-deps
```

### **Alternativa 2: Usar versiones compatibles**

Si no puedes actualizar Node.js, podemos downgrade algunas dependencias:

```bash
# Instalar versiones compatibles
npm install prisma@5.10.0 @prisma/client@5.10.0
npm install eslint@8.57.0
```

### **Alternativa 3: Deployment manual**

```bash
# En el servidor
cd /home/fe-navi-tracker
git pull origin main
npm install --legacy-peer-deps --engine-strict=false
npm run build
pm2 restart navi-tracker-frontend
sudo systemctl restart apache2
```

---

## ✅ **Checklist Post-Actualización**

- [ ] Node.js >= 18.18.0 instalado
- [ ] npm actualizado
- [ ] Dependencias instaladas sin errores
- [ ] Build exitoso
- [ ] PM2 funcionando
- [ ] Apache2 funcionando
- [ ] Aplicación respondiendo en puerto 3150
- [ ] GitHub Actions funcionando

---

## 🎯 **Próximos Pasos**

1. **Actualizar Node.js** en tu servidor
2. **Probar instalación** manual de dependencias
3. **Push a main** para probar el deployment automático
4. **Verificar** que todo funciona correctamente

¡Una vez actualizado Node.js, el CI/CD funcionará perfectamente! 🚀
