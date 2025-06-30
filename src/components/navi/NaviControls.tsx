"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Eye, EyeOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function NaviControls() {
  const [isNaviVisible, setIsNaviVisible] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoMessagesEnabled, setAutoMessagesEnabled] = useState(true);

  // Cargar preferencias desde localStorage
  useEffect(() => {
    const naviVisible = localStorage.getItem("navi-visible");
    const notifications = localStorage.getItem("navi-notifications");
    const autoMessages = localStorage.getItem("navi-auto-messages");

    if (naviVisible !== null) setIsNaviVisible(JSON.parse(naviVisible));
    if (notifications !== null)
      setNotificationsEnabled(JSON.parse(notifications));
    if (autoMessages !== null) setAutoMessagesEnabled(JSON.parse(autoMessages));
  }, []);

  // Guardar preferencias
  const savePreference = (key: string, value: boolean) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const handleNaviVisibilityChange = (checked: boolean) => {
    setIsNaviVisible(checked);
    savePreference("navi-visible", checked);

    toast({
      title: checked ? "Navi está visible" : "Navi está oculto",
      description: checked
        ? "Navi aparecerá en la esquina de la pantalla"
        : "Navi no aparecerá hasta que lo actives de nuevo",
      duration: 3000,
    });
  };

  const handleNotificationsChange = (checked: boolean) => {
    setNotificationsEnabled(checked);
    savePreference("navi-notifications", checked);

    toast({
      title: checked
        ? "Notificaciones activadas"
        : "Notificaciones desactivadas",
      description: checked
        ? "Navi te enviará notificaciones sobre tu progreso"
        : "Navi no enviará notificaciones",
      duration: 3000,
    });
  };

  const handleAutoMessagesChange = (checked: boolean) => {
    setAutoMessagesEnabled(checked);
    savePreference("navi-auto-messages", checked);

    toast({
      title: checked
        ? "Mensajes automáticos activados"
        : "Mensajes automáticos desactivados",
      description: checked
        ? "Navi te hablará de vez en cuando"
        : "Navi solo hablará cuando interactúes con él",
      duration: 3000,
    });
  };

  const resetNaviSettings = () => {
    setIsNaviVisible(true);
    setNotificationsEnabled(true);
    setAutoMessagesEnabled(true);

    savePreference("navi-visible", true);
    savePreference("navi-notifications", true);
    savePreference("navi-auto-messages", true);

    toast({
      title: "Configuración restablecida",
      description:
        "Todas las preferencias de Navi han vuelto a los valores por defecto",
      duration: 3000,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración de Navi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Visibilidad de Navi */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isNaviVisible ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            <Label htmlFor="navi-visible">Mostrar a Navi</Label>
          </div>
          <Switch
            id="navi-visible"
            checked={isNaviVisible}
            onCheckedChange={handleNaviVisibilityChange}
          />
        </div>

        {/* Notificaciones */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {notificationsEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
            <Label htmlFor="navi-notifications">
              Notificaciones de progreso
            </Label>
          </div>
          <Switch
            id="navi-notifications"
            checked={notificationsEnabled}
            onCheckedChange={handleNotificationsChange}
            disabled={!isNaviVisible}
          />
        </div>

        {/* Mensajes automáticos */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">💬</span>
            <Label htmlFor="navi-auto-messages">Mensajes automáticos</Label>
          </div>
          <Switch
            id="navi-auto-messages"
            checked={autoMessagesEnabled}
            onCheckedChange={handleAutoMessagesChange}
            disabled={!isNaviVisible}
          />
        </div>

        {/* Descripción */}
        <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
          <p className="mb-2">
            <strong>Navi es tu compañero emocional</strong> que reacciona a tu
            progreso diario.
          </p>
          <ul className="space-y-1 text-xs">
            <li>• Se pone feliz cuando completas hábitos</li>
            <li>• Celebra cuando subes de nivel</li>
            <li>• Se entristece si rompes rachas</li>
            <li>• Te extraña si no tienes actividad</li>
          </ul>
        </div>

        {/* Botón para restablecer */}
        <Button
          variant="outline"
          onClick={resetNaviSettings}
          className="w-full"
        >
          Restablecer configuración
        </Button>
      </CardContent>
    </Card>
  );
}
