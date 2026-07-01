"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Moon,
  Sun,
  Bell,
  Sunrise,
  Flame,
  Droplets,
  Scale,
  Sparkles,
  Check,
  Copy,
  BookOpen,
} from "lucide-react";
import { useNaviTrackerStore } from "@/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { IconWell } from "@/components/ui/icon-well";
import { SummaryRow } from "@/components/ui/summary-row";
import type { Tone } from "@/components/ui/tone";
import { SetGoalsDialog } from "@/components/nutrition/SetGoalsDialog";
import { AICostWidget } from "@/components/nutrition/AICostWidget";

// Guía de conexión del MCP (recuperada de la vieja /connect-claude).
const CONNECT_STEPS: string[] = [
  "Abrí Claude en la web o en la app (Ajustes → Conectores).",
  'Tocá "Agregar conector personalizado".',
  "Pegá la URL del connector (la de arriba).",
  "Autorizá con tu email y contraseña de NaviTracker (se abre el login).",
  "Listo: ya podés pedirle a Claude que registre y consulte tus datos.",
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-navi-tracker.luciano-yomayel.com";
const MCP_URL = `${API_BASE_URL}/mcp`;

/** Sección con título (small caps) + card contenedora. */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Fila con icon-well + título + sub + control a la derecha. */
function ToggleRow({
  icon: Icon,
  tone = "primary",
  title,
  sub,
  checked,
  onCheckedChange,
}: {
  icon: typeof Moon;
  tone?: Tone;
  title: string;
  sub?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-3">
      <IconWell icon={Icon} tone={tone} size={32} iconSize={16} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{title}</div>
        {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function AjustesPage() {
  const router = useRouter();

  const {
    preferences,
    hydrationGoal,
    loadNutritionGoals,
    fetchHydrationGoal,
  } = useNaviTrackerStore();

  // Tema: clase .dark en <html> + localStorage "theme" (igual que AppLayout).
  const [dark, setDark] = useState(false);
  // Toggles locales (no hay endpoint backend) persistidos en localStorage.
  const [notif, setNotif] = useState(true);
  const [briefMail, setBriefMail] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showGuia, setShowGuia] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setNotif(localStorage.getItem("navi-notifications") !== "false");
    setBriefMail(localStorage.getItem("navi-briefing-mail") !== "false");
  }, []);

  useEffect(() => {
    loadNutritionGoals();
    fetchHydrationGoal();
  }, [loadNutritionGoals, fetchHydrationGoal]);

  const toggleDark = (next: boolean) => {
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };

  const toggleNotif = (next: boolean) => {
    setNotif(next);
    localStorage.setItem("navi-notifications", String(next));
  };

  const toggleBriefMail = (next: boolean) => {
    setBriefMail(next);
    localStorage.setItem("navi-briefing-mail", String(next));
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(MCP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard no disponible */
    }
  };

  const calorieGoal = preferences?.dailyCalorieGoal;
  const waterGoal = hydrationGoal?.goalGlasses ?? 8;
  const targetWeight = preferences?.targetWeight;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Header con back button (pantalla full, fuera del nav) */}
      <div className="flex items-center gap-2.5">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9 rounded-full"
          aria-label="Volver"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </Button>
        <h1 className="text-[23px] font-semibold leading-[29px] tracking-[-0.01em]">
          Ajustes
        </h1>
      </div>

      {/* Preferencias */}
      <Section title="Preferencias">
        <Card className="overflow-hidden p-0">
          <ToggleRow
            icon={dark ? Moon : Sun}
            tone="primary"
            title="Tema oscuro"
            sub="Dark-first"
            checked={dark}
            onCheckedChange={toggleDark}
          />
          <Separator />
          <ToggleRow
            icon={Bell}
            tone="warning"
            title="Notificaciones"
            sub="Recordatorios del día"
            checked={notif}
            onCheckedChange={toggleNotif}
          />
          <Separator />
          <ToggleRow
            icon={Sunrise}
            tone="info"
            title="Briefing por mail"
            sub="Cada mañana a las 07:00"
            checked={briefMail}
            onCheckedChange={toggleBriefMail}
          />
        </Card>
      </Section>

      {/* Objetivos: links a las features existentes */}
      <Section title="Objetivos">
        <div className="space-y-2">
          <SummaryRow
            icon={Flame}
            tone="primary"
            label="Calorías diarias"
            sub="Editar objetivo nutricional"
            value={
              calorieGoal ? `${calorieGoal.toLocaleString("es-AR")}` : "—"
            }
            onClick={() => setShowGoals(true)}
          />
          <SummaryRow
            icon={Droplets}
            tone="info"
            label="Meta de agua"
            sub="Vasos por día"
            value={`${waterGoal} vasos`}
            onClick={() => router.push("/salud?tab=agua")}
          />
          <SummaryRow
            icon={Scale}
            tone="success"
            label="Peso objetivo"
            sub="Composición corporal"
            value={
              targetWeight != null
                ? `${targetWeight.toFixed(1)} kg`
                : "—"
            }
            onClick={() => router.push("/salud?tab=peso")}
          />
        </div>
      </Section>

      {/* Integraciones: Conectar con Claude */}
      <Section title="Integraciones">
        <Card className="space-y-3 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Sparkles className="h-[19px] w-[19px]" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Conectar con Claude</div>
              <div className="text-xs text-muted-foreground">
                NaviTracker como conector MCP
              </div>
            </div>
            <Badge variant="success">
              <Check className="mr-1 h-3 w-3" /> Disponible
            </Badge>
          </div>

          <p className="text-[12.5px] leading-[18px] text-muted-foreground">
            Pedile a Claude que registre comidas, consulte tu progreso o arme tu
            plan de la semana desde el chat, en la compu o el celu.
          </p>

          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-muted px-3 py-2 font-mono text-xs tabular-nums">
              {MCP_URL}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyUrl}
              aria-label="Copiar URL del connector"
            >
              {copied ? (
                <>
                  <Check className="mr-1 h-4 w-4" /> Copiado
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-4 w-4" /> Copiar
                </>
              )}
            </Button>
          </div>

          <Button
            variant="tonal"
            size="sm"
            className="w-full"
            onClick={() => setShowGuia((v) => !v)}
          >
            <BookOpen className="mr-1.5 h-4 w-4" />
            {showGuia ? "Ocultar guía de conexión" : "Ver guía de conexión"}
          </Button>
          {showGuia && (
            <ol className="mt-3 space-y-2">
              {CONNECT_STEPS.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </Section>

      {/* Costos de IA (migrado de /nutrition) — se oculta solo si no hay llamadas */}
      <AICostWidget />

      {/* Objetivos nutricionales (migrado de /nutrition) */}
      <SetGoalsDialog
        isOpen={showGoals}
        onClose={() => setShowGoals(false)}
        bodyAnalysis={null}
        isManualMode
        onGoalsSaved={() => setShowGoals(false)}
      />
    </div>
  );
}
