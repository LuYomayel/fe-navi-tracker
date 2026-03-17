"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function HabitsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Habits error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-lg font-semibold">Algo salio mal</h2>
      <p className="text-sm text-muted-foreground">
        No se pudieron cargar los habitos.
      </p>
      <Button onClick={reset} variant="outline">
        Reintentar
      </Button>
    </div>
  );
}
