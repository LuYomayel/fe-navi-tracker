"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, X } from "lucide-react";

export default function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(
    null
  );

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                setWaitingWorker(newWorker);
                setShowUpdatePrompt(true);
              }
            });
          }
        });
      });

      // Escuchar mensajes del service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "SKIP_WAITING") {
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setShowUpdatePrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-blue-500 text-white rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5" />
            <div>
              <h3 className="font-semibold text-sm">
                Actualización disponible
              </h3>
              <p className="text-xs opacity-90">
                Una nueva versión de NaviTracker está lista
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6 text-white hover:bg-blue-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleUpdate}
            size="sm"
            className="flex-1 text-xs bg-white text-blue-500 hover:bg-blue-50"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Actualizar
          </Button>
          <Button
            variant="ghost"
            onClick={handleDismiss}
            size="sm"
            className="text-xs text-white hover:bg-blue-600"
          >
            Después
          </Button>
        </div>
      </div>
    </div>
  );
}
