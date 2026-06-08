"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// "Inicio" se fusionó en "Hoy" (rediseño: nav 11→5).
export default function DashboardRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/hoy");
  }, [router]);
  return null;
}
