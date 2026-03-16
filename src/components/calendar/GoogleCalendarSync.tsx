"use client";

import { useEffect } from "react";
import { useNaviTrackerStore } from "@/store";
import { Button } from "@/components/ui/button";
import { RefreshCw, Link2, Unlink } from "lucide-react";

export default function GoogleCalendarSync() {
  const {
    googleCalendarStatus,
    fetchGoogleCalendarStatus,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    syncGoogleCalendar,
  } = useNaviTrackerStore();

  useEffect(() => {
    fetchGoogleCalendarStatus();
  }, [fetchGoogleCalendarStatus]);

  const connected = googleCalendarStatus?.connected ?? false;

  return (
    <div className="bg-card rounded-lg border p-4">
      <h3 className="text-sm font-semibold mb-3">Google Calendar</h3>

      {connected ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-green-600 dark:text-green-400 font-medium">
              Conectado
            </span>
            {googleCalendarStatus?.lastSyncAt && (
              <span className="text-xs text-muted-foreground ml-auto">
                Ultima sync:{" "}
                {new Date(googleCalendarStatus.lastSyncAt).toLocaleString(
                  "es",
                  { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
                )}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => syncGoogleCalendar()}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-2" />
              Sincronizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => disconnectGoogleCalendar()}
            >
              <Unlink className="h-3.5 w-3.5 mr-2" />
              Desconectar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Conecta tu Google Calendar para ver tus eventos en la agenda.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => connectGoogleCalendar()}
          >
            <Link2 className="h-3.5 w-3.5 mr-2" />
            Conectar Google Calendar
          </Button>
        </div>
      )}
    </div>
  );
}
