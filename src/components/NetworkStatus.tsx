"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Verificar estado inicial
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      // Ocultar después de 3 segundos
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showStatus) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-300 ${
        isOnline ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
    >
      {isOnline ? (
        <Wifi className="h-4 w-4" />
      ) : (
        <WifiOff className="h-4 w-4" />
      )}
      <span className="text-sm font-medium">
        {isOnline ? "Conexión restaurada" : "Sin conexión"}
      </span>
    </div>
  );
}
