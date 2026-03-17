"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function NaviError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Navi error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-lg font-semibold">Algo salio mal</h2>
      <p className="text-sm text-muted-foreground">
        No se pudo cargar a Navi.
      </p>
      <Button onClick={reset} variant="outline">
        Reintentar
      </Button>
    </div>
  );
}
