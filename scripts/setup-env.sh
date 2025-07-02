#!/usr/bin/env bash

# ---------------------------------------------------------------------------
#  setup-env.sh
#  Configura las variables de entorno necesarias para ejecutar el proyecto
#  en entorno local / entorno de pruebas de Codex.
# ---------------------------------------------------------------------------
#  Uso:
#     source scripts/setup-env.sh   # Linux / macOS
#  ó  . scripts/setup-env.sh        # alternativa POSIX
# ---------------------------------------------------------------------------

# Directorio raíz del proyecto
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Variables de ejemplo -------------------------------------------------------
# Ajusta los valores según tu entorno. Si ya existen en tu shell se respetarán.
# ---------------------------------------------------------------------------

export NODE_ENV=${NODE_ENV:-development}
export DATABASE_URL=${DATABASE_URL:-"mysql://root:root@localhost:3306/navitracker"}
export NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL:-"http://localhost:4000"}
export BACKEND_URL=${BACKEND_URL:-"http://localhost:4000"}

# Prisma --------------------------------------------------------------------
export PRISMA_MIGRATION_SKIP_GENERATE=true

# Mensaje final -------------------------------------------------------------
echo "✅ Variables de entorno cargadas."
echo "   NODE_ENV=$NODE_ENV"
echo "   DATABASE_URL=$DATABASE_URL"
echo "   BACKEND_URL=$BACKEND_URL" 