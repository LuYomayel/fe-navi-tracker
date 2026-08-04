"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BellOff } from "lucide-react";
import { isNative } from "@/lib/native/platform";
import {
  ensureNotificationPermissions,
  scheduleDailyReminders,
  scheduleHydrationRecurringReminders,
} from "@/lib/native/notifications";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";

/**
 * Los recordatorios fallan en silencio si el permiso está denegado: la app
 * agenda, iOS descarta y nadie se entera. Este banner lo hace visible y
 * permite activarlos de una. Solo aparece en la app nativa y sin permiso.
 */
export default function NotificationsOffBanner() {
  const [show, setShow] = useState(false);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!isNative()) return;
    (async () => {
      try {
        const { LocalNotifications } = await import(
          "@capacitor/local-notifications"
        );
        const status = await LocalNotifications.checkPermissions();
        setShow(status.display !== "granted");
      } catch {
        /* plugin no disponible */
      }
    })();
  }, []);

  const activar = async () => {
    setAsking(true);
    try {
      const ok = await ensureNotificationPermissions();
      if (!ok) {
        toast.error(
          "Siguen apagadas",
          "Activalas desde Ajustes del teléfono → NaviTracker → Notificaciones"
        );
        return;
      }
      await scheduleDailyReminders();
      try {
        const res = await api.hydration.getPace();
        if (res?.success && res.data) {
          await scheduleHydrationRecurringReminders(
            (res.data as { blocks: never[] }).blocks
          );
        }
      } catch {
        /* sin ritmo: los recordatorios de agua se agendan al entrar a Agua */
      }
      setShow(false);
      toast.success("Recordatorios activados", "Ya te van a llegar los avisos");
    } finally {
      setAsking(false);
    }
  };

  if (!show) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/8 p-3">
      <BellOff className="h-5 w-5 shrink-0 text-warning" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Recordatorios apagados</p>
        <p className="text-xs text-muted-foreground">
          No te van a llegar los avisos de agua, comidas ni hábitos.
        </p>
      </div>
      <Button size="sm" onClick={activar} disabled={asking}>
        {asking ? "…" : "Activar"}
      </Button>
    </div>
  );
}
