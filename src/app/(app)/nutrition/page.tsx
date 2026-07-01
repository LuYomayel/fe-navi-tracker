"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// La vieja pantalla de Nutrición se migró a "Salud" (comidas, ejercicio,
// cuerpo/análisis corporal/pliegues, meal prep) y a Ajustes (objetivos).
// Redirect de cortesía para URLs viejas.
export default function NutritionRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/salud");
  }, [router]);
  return null;
}
