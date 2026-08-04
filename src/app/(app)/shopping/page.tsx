"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// La lista de compras se fusiono en Plan -> tab "Compras" (rediseno).
// Redirect de cortesia para URLs viejas.
export default function ShoppingRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/plan?tab=compras");
  }, [router]);
  return null;
}
