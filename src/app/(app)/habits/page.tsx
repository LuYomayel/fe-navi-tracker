"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// La vieja pantalla de Hábitos (inglés) se migró a "/habitos". Redirect.
export default function HabitsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/habitos");
  }, [router]);
  return null;
}
