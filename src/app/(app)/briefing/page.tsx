"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sunrise,
  RefreshCw,
  Mail,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { getDateKey } from "@/lib/utils";

interface BriefingContent {
  date: string;
  narrative: string | null;
  score: { percentage: number; status: string } | null;
  calendar: { title: string; time: string; location?: string | null }[];
  tickets: string | null;
  nutrition: {
    consumed: { calories: number; protein: number; carbs: number; fat: number };
    goals: { dailyCalorieGoal: number; proteinGoal: number };
  } | null;
  habits: { name: string; done: boolean }[];
  tasks: { title: string; priority?: string; done: boolean }[];
  hydration: { glasses: number } | null;
  goal: { name?: string; percentage: number; remainingUsd: number } | null;
}

interface Briefing {
  id: string;
  date: string;
  content: BriefingContent;
  text: string;
  emailSent: boolean;
  emailSentAt: string | null;
}

const STATUS: Record<string, { label: string; color: string }> = {
  won: { label: "Día ganado", color: "bg-green-500" },
  partial: { label: "Día parcial", color: "bg-amber-500" },
  lost: { label: "Día perdido", color: "bg-red-500" },
  no_data: { label: "Sin datos", color: "bg-muted" },
};

function ItemRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 py-1 text-sm">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
      <span className={done ? "text-muted-foreground line-through" : ""}>
        {label}
      </span>
    </div>
  );
}

export default function BriefingPage() {
  const today = getDateKey(new Date());
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.briefing.getByDate(today);
      setBriefing((res?.data as Briefing) ?? null);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    load();
  }, [load]);

  const generate = async (send: boolean) => {
    send ? setSending(true) : setGenerating(true);
    try {
      const res = await api.briefing.generate({ date: today, send });
      const data = res?.data as { briefing: Briefing; emailSent: boolean };
      if (data?.briefing) setBriefing(data.briefing);
    } finally {
      send ? setSending(false) : setGenerating(false);
    }
  };

  const c = briefing?.content;
  const status = c?.score ? STATUS[c.score.status] ?? STATUS.no_data : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sunrise className="h-6 w-6 text-amber-500" />
          <div>
            <h1 className="text-xl font-semibold">Briefing del día</h1>
            <p className="text-sm text-muted-foreground">{today}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => generate(false)}
            disabled={generating || sending}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-1 hidden sm:inline">Generar</span>
          </Button>
          <Button
            size="sm"
            onClick={() => generate(true)}
            disabled={generating || sending}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            <span className="ml-1 hidden sm:inline">Enviar por mail</span>
          </Button>
        </div>
      </div>

      {briefing?.emailSent && (
        <Badge variant="secondary" className="gap-1">
          <Mail className="h-3 w-3" /> Enviado por mail
        </Badge>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !briefing || !c ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <p>Todavía no se generó el briefing de hoy.</p>
            <Button className="mt-4" onClick={() => generate(false)}>
              Generar ahora
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {c.narrative && (
            <Card>
              <CardContent className="py-4 text-sm leading-relaxed">
                {c.narrative}
              </CardContent>
            </Card>
          )}

          {status && (
            <Card>
              <CardContent className="flex items-center justify-between py-4">
                <span className="font-medium">{status.label}</span>
                <Badge className={`${status.color} text-white`}>
                  {c.score?.percentage}%
                </Badge>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">🗓️ Agenda</CardTitle>
            </CardHeader>
            <CardContent>
              {c.calendar && c.calendar.length ? (
                c.calendar.map((e, i) => (
                  <div key={i} className="py-1 text-sm">
                    <span className="font-medium">{e.time}</span> · {e.title}
                    {e.location ? (
                      <span className="text-muted-foreground"> ({e.location})</span>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Sin eventos hoy.</p>
              )}
            </CardContent>
          </Card>

          {c.tickets && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">💼 Trabajo (Trello)</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                  {c.tickets}
                </pre>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">🎯 Hábitos</CardTitle>
            </CardHeader>
            <CardContent>
              {c.habits.length ? (
                c.habits.map((h, i) => (
                  <ItemRow key={i} done={h.done} label={h.name} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin hábitos programados hoy.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">✅ Tareas de hoy</CardTitle>
            </CardHeader>
            <CardContent>
              {c.tasks.length ? (
                c.tasks.map((t, i) => (
                  <ItemRow
                    key={i}
                    done={t.done}
                    label={`${t.title}${t.priority ? ` · ${t.priority}` : ""}`}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin tareas para hoy.
                </p>
              )}
            </CardContent>
          </Card>

          {c.nutrition && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">🥗 Nutrición</CardTitle>
                <CardDescription>
                  {Math.round(c.nutrition.consumed.calories)} /{" "}
                  {c.nutrition.goals.dailyCalorieGoal} kcal · proteína{" "}
                  {Math.round(c.nutrition.consumed.protein)} /{" "}
                  {c.nutrition.goals.proteinGoal} g
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            {c.hydration && (
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-2xl font-semibold">
                    💧 {c.hydration.glasses}
                  </p>
                  <p className="text-xs text-muted-foreground">vasos de agua</p>
                </CardContent>
              </Card>
            )}
            {c.goal && (
              <Card>
                <CardContent className="py-4 text-center">
                  <p className="text-2xl font-semibold">🎯 {c.goal.percentage}%</p>
                  <p className="text-xs text-muted-foreground">
                    {c.goal.name || "Objetivo"} · faltan USD{" "}
                    {Math.round(c.goal.remainingUsd)}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
