import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalToaster } from "@/components/ui/global-toaster";
import NetworkStatus from "@/components/NetworkStatus";
import UnregisterSW from "@/components/UnregisterSW";
import CapacitorProvider from "@/components/native/CapacitorProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NaviTracker - Tu Compañero de Bienestar",
  description:
    "Aplicación integral para seguimiento de hábitos, nutrición y bienestar personal",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    viewportFit: "cover", // respeta safe-areas (notch / home indicator) en mobile
    themeColor: "#3b82f6",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <CapacitorProvider />
        <GlobalToaster />
        <NetworkStatus />
        <UnregisterSW />
      </body>
    </html>
  );
}
