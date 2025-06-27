ssh -i "$SSH_KEY_PATH" "$SERVER_USER@$SERVER_HOST" << EOF
    set -e

    echo "🚀 Iniciando despliegue en producción..."

    # Navegar al directorio del proyecto
    cd $SERVER_PATH
    echo "📂 Directorio actual: \$(pwd)"
    rm -rf .next node_modules
    
    echo "🔻 Deteniendo servicios para liberar RAM..."
    sudo systemctl stop apache2 || true
    echo "💾 Saving PM2 snapshot…"
    pm2 save

    pm2 stop all || true
    echo "🔻 Stopping all PM2 apps…"
    pm2 stop all || true

    echo "📥 Descargando últimos cambios..."
    git pull origin main

    echo "📦 Instalando dependencias..."
    npm ci --production=false

    echo "🔧 Generando cliente de Prisma..."
    npx prisma generate

    echo "🗃️ Ejecutando migraciones de base de datos..."
    npx prisma db push

    echo "🔻 Deteniendo MySQL antes del build..."
    sudo systemctl stop mysql || true

    echo "🏗️ Construyendo proyecto..."
    export NODE_OPTIONS="--max-old-space-size=1800"
    npm run build

    echo "🔺 Arrancando servicios detenidos..."
    sudo systemctl start mysql
    sudo systemctl start apache2

    echo "🔺 Restoring PM2 apps…"
    pm2 resurrect 

    echo "🔄 Reiniciando aplicación con PM2..."
    pm2 restart $PM2_APP_ID

    echo "✅ Despliegue completado exitosamente!"

    echo "📊 Estado de la aplicación:"
    pm2 show $PM2_APP_ID

    echo "🎉 Aplicación desplegada y funcionando correctamente!"
EOF