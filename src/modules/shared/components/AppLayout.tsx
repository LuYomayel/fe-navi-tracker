"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Apple,
  LogOut,
  Moon,
  Sun,
  Calendar,
  Target,
  Heart,
} from "lucide-react";
import { useAuthStore } from "../../auth/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

export default function AppLayout({ children }: AppLayoutProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  // Inicializar tema
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark =
      savedTheme === "dark" ||
      (!savedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newDarkMode);
  };

  const handleLogout = () => {
    logout();
    setSheetOpen(false);
  };

  const menuItems = [
    {
      icon: Calendar,
      label: "Dashboard",
      path: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      icon: Target,
      label: "Hábitos",
      path: "/habits",
      active: pathname === "/habits",
    },
    {
      icon: Apple,
      label: "Nutrición",
      path: "/nutrition",
      active: pathname === "/nutrition",
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            {/* Menú móvil */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle>NaviTracker</SheetTitle>
                  <SheetDescription>
                    Navega por las diferentes secciones de la aplicación
                  </SheetDescription>
                </SheetHeader>

                {/* XP en menú móvil */}
                <div className="mt-4 mb-4">
                  <XpGlobalIndicator />
                </div>
                <nav className="flex flex-col space-y-2 mt-4">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setSheetOpen(false)}
                        className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                          item.active
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
                <div className="mt-6 pt-6 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Cerrar Sesión
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <div className="mr-4 hidden md:flex">
              <Link
                href="/dashboard"
                className="mr-6 flex items-center space-x-2"
              >
                <span className="hidden font-bold sm:inline-block">
                  NaviTracker
                </span>
              </Link>
            </div>

            {/* Navegación desktop */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center space-x-2 transition-colors hover:text-foreground/80 ${
                      item.active ? "text-foreground" : "text-foreground/60"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
              <div className="w-full flex-1 md:w-auto md:flex-none">
                {/* Aquí podrías agregar un search input en el futuro */}
              </div>

              {/* Controles del header */}
              <nav className="flex items-center space-x-2">
                {/* Indicador XP Global */}
                <XpGlobalIndicator compact className="hidden sm:flex" />

                {/* Toggle tema */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                      {darkMode ? (
                        <Sun className="h-[1.2rem] w-[1.2rem]" />
                      ) : (
                        <Moon className="h-[1.2rem] w-[1.2rem]" />
                      )}
                      <span className="sr-only">Cambiar tema</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{darkMode ? "Modo claro" : "Modo oscuro"}</p>
                  </TooltipContent>
                </Tooltip>

                <Link href="/navi">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Heart className="h-4 w-4" />
                    Ver a Navi
                  </Button>
                </Link>
                {/* Usuario */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={user.name} />
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar sesión</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </nav>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </TooltipProvider>
  );
}
