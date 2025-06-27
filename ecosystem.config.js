module.exports = {
  apps: [
    {
      name: "navi-tracker-frontend",
      script: ".next/standalone/server.js",
      cwd: "/home/fe-navi-tracker",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3150,
        HOSTNAME: "0.0.0.0",
        NEXT_PUBLIC_BACKEND_URL: "https://api-navi-tracker.luciano-yomayel.com",
        NEXT_PUBLIC_API_URL: "https://api-navi-tracker.luciano-yomayel.com",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3150,
        HOSTNAME: "0.0.0.0",
        NEXT_PUBLIC_BACKEND_URL: "https://api-navi-tracker.luciano-yomayel.com",
        NEXT_PUBLIC_API_URL: "https://api-navi-tracker.luciano-yomayel.com",
      },
      log_date_format: "YYYY-MM-DD HH:mm Z",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      // Configuración de reinicio
      min_uptime: "10s",
      max_restarts: 10,
      // Configuración de recursos
      node_args: "--max_old_space_size=1024",
      // Configuración de cluster (opcional)
      exec_mode: "fork", // o 'cluster' para múltiples instancias
      // Health check
      health_check_grace_period: 3000,
      // Configuración de deployment
      post_update: ["npm install", "npm run build"],
    },
  ],

  // Configuración de deployment (opcional)
  deploy: {
    production: {
      user: "ubuntu", // Cambiar por tu usuario
      host: "tu-servidor.com", // Cambiar por tu servidor
      ref: "origin/main",
      repo: "git@github.com:tu-usuario/fe-navi-tracker.git", // Cambiar por tu repo
      path: "/home/fe-navi-tracker",
      "pre-deploy-local": "",
      "post-deploy":
        "npm install && npm run build && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
      env: {
        NODE_ENV: "production",
      },
    },
  },
};
