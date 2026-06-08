"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// "Conectar con Claude" se movió a Ajustes (rediseño: fuera del nav principal).
export default function ConnectClaudeRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/ajustes");
  }, [router]);
  return null;
}
