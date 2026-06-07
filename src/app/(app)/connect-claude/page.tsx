"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plug, Copy, Check, Sparkles, Smartphone } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-navi-tracker.luciano-yomayel.com";
const MCP_URL = `${API_BASE_URL}/mcp`;

const STEPS: string[] = [
  "Abrí Claude en la web o en la app (Ajustes → Conectores).",
  'Tocá "Agregar conector personalizado".',
  "Pegá la URL del connector (la de arriba).",
  "Autorizá con tu email y contraseña de NaviTracker (se abre el login).",
  "Listo: ya podés pedirle a Claude que registre y consulte tus datos.",
];

const TOOL_GROUPS: { title: string; tools: [string, string][] }[] = [
  {
    title: "Objetivo / Fondo NZ",
    tools: [
      [
        "create_objetivo_nz",
        '"Creá mi objetivo Nueva Zelanda, meta 8000 USD para junio 2028"',
      ],
      ["log_contribucion", '"Sumá 50 USD al fondo por la venta de 2 lámparas"'],
      ["get_objetivo_nz", '"¿Cómo viene mi objetivo NZ?"'],
      ["get_progreso_nz", '"¿Cuánto me falta y cuánto por mes para llegar?"'],
    ],
  },
  {
    title: "Nutrición",
    tools: [
      ["log_comida", '"Registrá el almuerzo: pollo con arroz, 500 kcal"'],
      ["log_comida_guardada", '"Logueá mi desayuno de siempre"'],
      [
        "crear_comida_guardada",
        '"Guardá mi merienda de siempre: 375 kcal, 24g proteína"',
      ],
      ["get_comidas", '"Pasame las comidas de la última semana"'],
    ],
  },
  {
    title: "Hábitos, agua y peso",
    tools: [
      ["set_habito", '"Marcá la creatina de hoy"'],
      ["set_agua / agregar_agua", '"Tomé 3 vasos de agua"'],
      ["log_peso", '"Pesé 78,5 kg hoy"'],
    ],
  },
  {
    title: "Día y tareas",
    tools: [
      ["get_resumen_dia", '"¿Cómo venimos hoy?"'],
      ["get_plan_hoy", '"¿Qué tengo para hoy?"'],
      ["crear_tarea", '"Recordame comprar filamento mañana"'],
      ["get_day_score", '"¿Cuál es mi day score de ayer?"'],
    ],
  },
];

export default function ConnectClaudePage() {
  const [copied, setCopied] = useState(false);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(MCP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard no disponible */
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
          <Plug className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Conectar con Claude</h1>
          <p className="text-sm text-muted-foreground">
            Usá NaviTracker como asistente: registrá comidas, hábitos y tu
            objetivo desde el chat de Claude, en la compu o el celu.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">URL del connector</CardTitle>
          <CardDescription>
            Pegala en Claude al agregar un conector personalizado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-muted px-3 py-2 font-mono text-sm">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="h-4 w-4" /> Cómo conectar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {STEPS.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-foreground/90">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" /> Qué le podés pedir
          </CardTitle>
          <CardDescription>
            Claude elige la herramienta sola según lo que le digas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {TOOL_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-2 text-sm font-medium">{group.title}</h3>
              <ul className="space-y-2">
                {group.tools.map(([tool, example]) => (
                  <li key={tool} className="text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="font-mono text-[11px]"
                      >
                        {tool}
                      </Badge>
                      <span className="text-muted-foreground">{example}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Tus datos viven solo en tu cuenta de NaviTracker. El acceso se autoriza
        con OAuth y podés revocarlo desde Claude cuando quieras.
      </p>
    </div>
  );
}
