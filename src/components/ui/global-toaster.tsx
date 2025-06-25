"use client";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import type { ToastData } from "@/lib/toast-helper";

export function GlobalToaster() {
  const { toast } = useToast();

  useEffect(() => {
    // Escuchar eventos personalizados de toast
    const handleToastEvent = (event: CustomEvent<ToastData>) => {
      const { title, description, variant } = event.detail;
      toast({
        title,
        description,
        variant,
      });
    };

    // Agregar el event listener
    window.addEventListener("show-toast", handleToastEvent as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener(
        "show-toast",
        handleToastEvent as EventListener
      );
    };
  }, [toast]);

  return <Toaster />;
}
