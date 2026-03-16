"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { Suspense } from "react";

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setErrorMessage(
        error === "access_denied"
          ? "Acceso denegado. No se otorgaron permisos."
          : `Error de Google: ${error}`
      );
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMessage("No se recibio codigo de autorizacion.");
      return;
    }

    api.calendar.google
      .callback(code)
      .then(() => {
        setStatus("success");
        setTimeout(() => router.push("/calendar"), 1500);
      })
      .catch((err) => {
        setStatus("error");
        setErrorMessage(
          err?.message || "Error al conectar con Google Calendar."
        );
      });
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-card rounded-lg border p-8 max-w-sm w-full text-center">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Conectando...</h2>
            <p className="text-sm text-muted-foreground">
              Vinculando tu Google Calendar
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <h2 className="text-lg font-semibold mb-2">Conectado</h2>
            <p className="text-sm text-muted-foreground">
              Google Calendar vinculado. Redirigiendo...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-500 text-4xl mb-4">✕</div>
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {errorMessage}
            </p>
            <button
              onClick={() => router.push("/calendar")}
              className="text-sm text-primary hover:underline"
            >
              Volver al calendario
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
