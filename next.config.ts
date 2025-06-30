import type { NextConfig } from "next";

import { join } from "path";
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";

// Detectar si estamos en Netlify
const isNetlifyBuild = process.env.NETLIFY === "true";

// Destination changes: Netlify static export -> `out`, standalone server -> `.next/standalone`
const publicDestDir = isNetlifyBuild ? "out" : ".next/standalone";

// Para standalone debemos copiar a .next/standalone/public
const copyPublicFolder = () => {
  const src = join(process.cwd(), "public");
  const dest = isNetlifyBuild
    ? join(process.cwd(), publicDestDir)
    : join(process.cwd(), publicDestDir, "public");

  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const copyRecursive = (srcDir: string, destDir: string) => {
    if (!existsSync(destDir)) {
      mkdirSync(destDir);
    }
    for (const item of readdirSync(srcDir)) {
      const srcPath = join(srcDir, item);
      const destPath = join(destDir, item);
      if (statSync(srcPath).isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    }
  };

  copyRecursive(src, dest);
};

copyPublicFolder();

const nextConfig: NextConfig = {
  // Optimizaciones de compilación
  compiler: {
    // Remover console.log en producción
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Optimizaciones de build
  typescript: {
    // Ignorar errores de TypeScript en build (para acelerar)
    ignoreBuildErrors: process.env.NODE_ENV === "production",
  },

  eslint: {
    // Ignorar errores de ESLint en build
    ignoreDuringBuilds: process.env.NODE_ENV === "production",
  },

  // Configuración de salida condicional
  output: isNetlifyBuild ? "export" : "standalone",
  trailingSlash: isNetlifyBuild ? true : false,
  skipTrailingSlashRedirect: isNetlifyBuild ? true : false,

  // Configuración para builds rápidos en producción
  productionBrowserSourceMaps: false, // ahorra RAM
  compress: true,

  // Configuración de imágenes optimizada
  images: {
    unoptimized: isNetlifyBuild, // Solo para export estático
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Optimizaciones de webpack
  webpack: (config, { dev, isServer }) => {
    // Optimizaciones de memoria
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            maxSize: 244000, // 244KB max por chunk
          },
        },
      },
    };

    // Reducir uso de memoria en development
    if (dev) {
      config.optimization.splitChunks = false;
      config.optimization.minimize = false;
    }

    // Optimizaciones para el servidor
    if (isServer) {
      config.optimization.minimize = false;
    }

    return config;
  },

  // Configuración de headers (solo para VPS)
  ...(!isNetlifyBuild && {
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "X-Content-Type-Options",
              value: "nosniff",
            },
            {
              key: "X-Frame-Options",
              value: "DENY",
            },
            {
              key: "X-XSS-Protection",
              value: "1; mode=block",
            },
          ],
        },
      ];
    },
  }),

  // Configuración de redirects (solo para VPS)
  ...(!isNetlifyBuild && {
    async redirects() {
      return [
        {
          source: "/dashboard",
          destination: "/",
          permanent: false,
        },
      ];
    },
  }),
};

export default nextConfig;
