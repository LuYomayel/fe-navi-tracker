"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FOCO_FLAG, showBackToFoco } from "@/lib/foco-return";

/** Botón flotante para volver al checklist cuando saliste de /foco. */
export function BackToFoco() {
  const pathname = usePathname();
  const [fromFoco, setFromFoco] = useState(false);

  useEffect(() => {
    try {
      if (pathname.startsWith("/foco")) sessionStorage.setItem(FOCO_FLAG, "1");
      setFromFoco(sessionStorage.getItem(FOCO_FLAG) === "1");
    } catch {
      setFromFoco(false);
    }
  }, [pathname]);

  if (!showBackToFoco(pathname, fromFoco)) return null;

  return (
    <Link
      href="/foco"
      className="fixed bottom-20 left-4 z-50 flex items-center gap-1.5 rounded-full border border-primary/30 bg-background px-3.5 py-2.5 text-sm font-medium text-primary shadow-fab transition-transform active:scale-95 md:bottom-6"
    >
      <ArrowLeft size={16} />
      Volver al foco
    </Link>
  );
}
