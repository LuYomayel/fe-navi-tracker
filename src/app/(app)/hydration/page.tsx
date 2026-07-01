"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// La hidratación se fusionó en Salud → tab "Agua" (rediseño). Redirect de cortesía.
export default function HydrationRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/salud?tab=agua");
  }, [router]);
  return null;
}
