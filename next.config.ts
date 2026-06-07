import type { NextConfig } from "next";
import path from "path";

// Target de build:
//  - "capacitor" => export estatico (SPA) para empaquetar en la app mobile
//  - default     => web (standalone en VPS / Netlify)
const isCapacitor = process.env.NEXT_PUBLIC_BUILD_TARGET === "capacitor";

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
    ignoreDuringBuilds: process.env.NODE_ENV === "production",
  },

  // Configuración de salida segun target:
  //  - capacitor => "export" (genera /out con HTML/CSS/JS estatico)
  //  - VPS       => "standalone"
  //  - Netlify   => default
  ...(isCapacitor
    ? { output: "export" as const, trailingSlash: true }
    : process.env.NETLIFY
      ? {}
      : { output: "standalone" as const }),

  // Configuración para builds rápidos en producción
  productionBrowserSourceMaps: false, // ahorra RAM
  compress: true,

  // Configuración de imágenes optimizada
  images: {
    // En export estatico no hay servidor que optimice => unoptimized.
    unoptimized: isCapacitor,
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Optimizaciones de webpack
  webpack: (config, { dev, isServer }) => {
    // Asegurar que el alias @ resuelve a src/ (fix para Netlify)
    config.resolve = {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias || {}),
        "@": path.resolve(__dirname, "src"),
      },
    };

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

  // headers() y redirects() son features de servidor: NO se aplican en
  // export estatico (Capacitor). Solo se incluyen en el build web.
  ...(isCapacitor
    ? {}
    : {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "DENY" },
                { key: "X-XSS-Protection", value: "1; mode=block" },
              ],
            },
          ];
        },
        async redirects() {
          return [
            { source: "/dashboard", destination: "/", permanent: false },
          ];
        },
      }),
};

export default nextConfig;
