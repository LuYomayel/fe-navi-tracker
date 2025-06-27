import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],

  // Configuración para deployment en producción
  output: "standalone",

  // Configuración para builds rápidos en producción
  typescript: {
    // Solo deshabilitar en producción para deployment rápido
    ignoreBuildErrors: process.env.NODE_ENV === "production",
  },
  eslint: {
    // Solo deshabilitar en producción para deployment rápido
    ignoreDuringBuilds: process.env.NODE_ENV === "production",
  },

  poweredByHeader: false,
  compress: true,

  // Configuración de imágenes
  images: {
    domains: ["localhost"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Headers de seguridad
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
