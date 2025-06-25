"use client";

import React, { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNaviTrackerStore } from "@/store";

export function ThemeToggle() {
  const { preferences, updatePreferences } = useNaviTrackerStore();

  const toggleDarkMode = () => {
    updatePreferences({ darkMode: !preferences.darkMode });
  };

  useEffect(() => {
    // Aplicar el tema al documento
    const root = document.documentElement;
    if (preferences.darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [preferences.darkMode]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleDarkMode}
      className="flex items-center gap-2"
      title={
        preferences.darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
      }
    >
      {preferences.darkMode ? (
        <>
          <Sun className="h-4 w-4" />
          <span className="hidden sm:inline">Claro</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span className="hidden sm:inline">Oscuro</span>
        </>
      )}
    </Button>
  );
}
