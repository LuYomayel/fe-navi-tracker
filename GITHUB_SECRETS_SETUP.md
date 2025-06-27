# 🔐 **Configuración de GitHub Secrets - Paso a Paso**

## ⚠️ **IMPORTANTE: Debes configurar estos secrets ANTES del próximo deployment**

El error `missing server host` indica que GitHub Actions no puede conectarse a tu servidor porque faltan los secrets de configuración.

---

## 📋 **Secrets Requeridos**

Ve a tu repositorio en GitHub y configura estos secrets:

### **1. Ir a GitHub Secrets**

```
1. Ve a tu repositorio en GitHub
2. Click en "Settings" (arriba derecha)
3. En el menú izquierdo: "Secrets and variables" → "Actions"
4. Click en "New repository secret"
```

### **2. Configurar cada Secret**

#### **HOST** (Requerido)

- **Name:** `HOST`
- **Value:** La IP o dominio de tu servidor
- **Ejemplo:** `192.168.1.100` o `mi-servidor.com`

#### **USERNAME** (Requerido)

- **Name:** `USERNAME`
- **Value:** Tu usuario SSH
- **Ejemplo:** `ubuntu`, `root`, `admin`, etc.

#### **SSH_KEY** (Requerido)

- **Name:** `SSH_KEY`
- **Value:** Tu clave SSH privada COMPLETA
- **Formato:** Debe incluir `-----BEGIN` y `-----END`

#### **PROJECT_PATH** (Opcional)

- **Name:** `PROJECT_PATH`
- **Value:** Ruta completa del proyecto en el servidor
- **Default:** `/var/www/navitracker`
- **Ejemplo:** `/home/usuario/navitracker`

#### **PORT** (Opcional)

- **Name:** `PORT`
- **Value:** Puerto SSH
- **Default:** `22`

---

## 🔑 **Cómo obtener tu SSH_KEY**

### **Opción 1: Usar tu clave SSH existente**

```bash
# Ver tus claves SSH
ls -la ~/.ssh/

# Mostrar tu clave privada (normalmente id_rsa o id_ed25519)
cat ~/.ssh/id_rsa
# O
cat ~/.ssh/id_ed25519
```

### **Opción 2: Crear nueva clave SSH específica**

```bash
# Generar nueva clave SSH
ssh-keygen -t ed25519 -C "navitracker-deploy" -f ~/.ssh/navitracker_deploy

# Copiar clave pública al servidor
ssh-copy-id -i ~/.ssh/navitracker_deploy.pub usuario@tu-servidor.com

# Mostrar clave privada para GitHub
cat ~/.ssh/navitracker_deploy
```

### **Formato correcto de SSH_KEY:**

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAFwAAAAdzc2gtcn
...
(muchas líneas de texto)
...
AAAAECC+gQ4TQvQzVGGhHhHhHhHhHhHhHhHhHhHhHhHhHhHhHhHhHhHhHhHhHhHhHhHhHhHh
-----END OPENSSH PRIVATE KEY-----
```

---

## 🧪 **Verificar Conexión SSH**

Antes de configurar GitHub Actions, verifica que puedes conectarte:

```bash
# Probar conexión SSH
ssh usuario@tu-servidor.com

# Si usas clave específica
ssh -i ~/.ssh/navitracker_deploy usuario@tu-servidor.com

# Verificar que puedes acceder al proyecto
ssh usuario@tu-servidor.com "cd /var/www/navitracker && pwd && ls -la"
```

---

## ⚙️ **Configuración en el Servidor**

### **1. Permisos del directorio**

```bash
# En tu servidor
sudo chown -R tu-usuario:tu-usuario /var/www/navitracker
chmod -R 755 /var/www/navitracker
```

### **2. Permisos sudo para Apache**

```bash
# Permitir reiniciar Apache sin password
echo "tu-usuario ALL=(ALL) NOPASSWD: /bin/systemctl restart apache2, /bin/systemctl status apache2" | sudo tee -a /etc/sudoers
```

### **3. Verificar PM2**

```bash
# Instalar PM2 si no lo tienes
npm install -g pm2

# Ver procesos actuales
pm2 list

# Si tu proceso no se llama "navitracker", puedes renombrarlo:
pm2 delete 5  # o el número que sea
pm2 start npm --name "navitracker" -- start
pm2 save
```

---

## 🔍 **Ejemplo de Configuración Completa**

```bash
# Secrets en GitHub:
HOST=192.168.1.100
USERNAME=ubuntu
SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAA...
-----END OPENSSH PRIVATE KEY-----
PROJECT_PATH=/var/www/navitracker
PORT=22
```

---

## ✅ **Checklist de Verificación**

- [ ] **HOST** configurado correctamente
- [ ] **USERNAME** es el usuario SSH correcto
- [ ] **SSH_KEY** es la clave privada COMPLETA
- [ ] **PROJECT_PATH** apunta al directorio correcto
- [ ] Puedes conectarte por SSH manualmente
- [ ] El directorio del proyecto existe
- [ ] Tienes permisos de escritura en el directorio
- [ ] PM2 está instalado y funcionando
- [ ] Puedes reiniciar Apache con sudo

---

## 🚨 **Troubleshooting**

### **Error: "missing server host"**

- ✅ Verifica que el secret `HOST` esté configurado
- ✅ El valor no debe tener espacios ni caracteres especiales

### **Error: "Permission denied (publickey)"**

- ✅ Verifica que el secret `SSH_KEY` sea la clave privada completa
- ✅ Asegúrate de que la clave pública esté en el servidor
- ✅ Verifica que el `USERNAME` sea correcto

### **Error: "No such file or directory"**

- ✅ Verifica que `PROJECT_PATH` sea correcto
- ✅ El directorio debe existir y tener los archivos del proyecto

---

## 🎯 **Próximo Paso**

Una vez configurados todos los secrets:

1. **Commit y push** tus cambios actuales
2. **Ve a GitHub Actions** para ver el deployment
3. **Verifica** que todo funcione correctamente

```bash
git add .
git commit -m "fix: actualizar sharp y mejorar deployment workflow"
git push origin main
```

¡El deployment debería funcionar correctamente! 🚀
