"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LogOut,
  Moon,
  Sun,
  Apple,
  Target,
  CalendarCheck,
  Star,
  Plus,
  Settings,
  Plane,
} from "lucide-react";
import { useAuthStore } from "../../auth/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { XpGlobalIndicator } from "@/components/xp/XpGlobalIndicator";

interface AppLayoutProps {
  children: React.ReactNode;
}

// Navegación principal (agrupada por intención del usuario).
const SECTIONS = [
  { id: "hoy", label: "Hoy", icon: Sun, path: "/hoy" },
  { id: "salud", label: "Salud", icon: Apple, path: "/salud" },
  { id: "habitos", label: "Hábitos", icon: Target, path: "/habitos" },
  { id: "plan", label: "Plan", icon: CalendarCheck, path: "/plan" },
  { id: "objetivo", label: "Objetivo", icon: Plane, path: "/objetivo" },
  { id: "navi", label: "Navi", icon: Star, path: "/navi" },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark =
      savedTheme === "dark" ||
      (!savedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // Scroll al tope al cambiar de sección.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newDarkMode);
  };

  const isActive = (path: string) => {
    if (path === "/hoy") return pathname === "/" || pathname.startsWith("/hoy");
    return pathname.startsWith(path);
  };

  // Ajustes va fuera del nav: pantalla full con back button.
  const onAjustes = pathname.startsWith("/ajustes");

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Header: wordmark + Navi · racha/XP · tema · avatar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-3 sm:px-4">
          <Link href="/hoy" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Navi.png"
              alt=""
              width={26}
              height={26}
              className="rounded-md"
            />
            <span className="text-lg font-semibold tracking-tight">
              <span className="text-primary">Navi</span>Tracker
            </span>
          </Link>

          {/* Desktop: 5 secciones */}
          <nav className="hidden items-center gap-1 md:flex">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = isActive(s.path);
              return (
                <Link
                  key={s.id}
                  href={s.path}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "stroke-[2.5]" : ""}`} />
                  <span>{s.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <XpGlobalIndicator compact className="hidden sm:flex" />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 rounded-full"
              aria-label="Cambiar tema"
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-xl"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/ajustes">
                      <Settings className="mr-2 h-4 w-4" />
                      Ajustes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="mx-auto max-w-5xl px-3 py-3 pb-24 sm:px-4 sm:py-4 md:pb-6">
        {children}
      </main>

      {/* FAB contextual: registro rápido → Salud (Comidas). Oculto en Ajustes. */}
      {!onAjustes && (
        <Link
          href="/salud?tab=comidas&log=1"
          className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-fab transition-transform active:scale-95 md:hidden"
          aria-label="Registro rápido"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </Link>
      )}

      {/* Bottom tab bar: 5 tabs (mobile). Oculto en Ajustes. */}
      {!onAjustes && (
        <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/80 backdrop-blur-xl backdrop-saturate-150 md:hidden">
          <div className="flex h-16 items-center justify-around px-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = isActive(s.path);
              return (
                <Link
                  key={s.id}
                  href={s.path}
                  className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon
                    className="h-[22px] w-[22px]"
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span
                    className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}
                  >
                    {s.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
