"use client";

// /foco — checklist de lo básico del día. La abre el hook de Claude Code
// mientras Claude responde: Luciano ve qué le falta y elige a dónde ir.
// La lógica (qué está hecho / pendiente) vive en lib/day-checklist.ts.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuthStore } from "@/modules/auth/store";
import { useNaviTrackerStore } from "@/store";
import { useInitializeStore } from "@/hooks/useInitializeStore";
import { api } from "@/lib/api-client";
import { fmtARS, getDateKey } from "@/lib/utils";
import {
  buildDayChecklist,
  nextEvent,
  parseWaitStats,
  pendingPrintOrders,
  pickTopTask,
  ventasPracticeActive,
  VENTAS_MENSAJES_KEY,
  type ChecklistItem,
  type ChecklistItemId,
} from "@/lib/day-checklist";
import {
  meetingPrep,
  parseSessions,
  quickTasks,
  staleTickets,
  type SessionsState,
  type TrelloBoard,
} from "@/lib/foco-work";

import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Utensils,
  Droplets,
  Repeat,
  ListChecks,
  GraduationCap,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Circle,
  PartyPopper,
  Dumbbell,
  MessageCircle,
  NotebookPen,
  CalendarClock,
  Printer,
  Target,
  Timer,
  Send,
  Zap,
  Bot,
  KanbanSquare,
} from "lucide-react";
import { toast } from "@/lib/toast-helper";

const ICONS: Record<ChecklistItemId, typeof Utensils> = {
  comida: Utensils,
  agua: Droplets,
  habitos: Repeat,
  tareas: ListChecks,
  curso: GraduationCap,
  ejercicio: Dumbbell,
  "ventas-mensajes": MessageCircle,
  reflexion: NotebookPen,
};

const COURSE_HABIT = /clase de ventas/i;

export default function FocoPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { isLoading } = useInitializeStore();

  const {
    activities,
    tasks,
    nutritionAnalyses,
    currentDayScore,
    fetchDayScore,
    todayHydration,
    hydrationGoal,
    fetchTodayHydration,
    fetchHydrationGoal,
    adjustHydration,
    getAllFoodAnalysis,
    toggleCompletion,
    toggleTask,
    calendarEvents,
    fetchCalendarEvents,
  } = useNaviTrackerStore();

  const today = getDateKey(new Date());
  const tomorrow = getDateKey(new Date(Date.now() + 86400000));
  const [now, setNow] = useState(() => new Date());
  const [ventasMensajes, setVentasMensajes] = useState(0);
  const [printing, setPrinting] = useState<{ orders: number; toCollect: number } | null>(
    null
  );

  // Tiempo recuperado: lo manda el hook de Claude Code en la URL (?min=&veces=)
  const [waitStats, setWaitStats] = useState<{ minutes: number; count: number } | null>(
    null
  );
  useEffect(() => {
    setWaitStats(parseWaitStats(window.location.search));
  }, []);

  // Sesiones de Claude Code: las manda el hook en el hash y lo va actualizando
  const [sessions, setSessions] = useState<SessionsState | null>(null);
  useEffect(() => {
    const read = () => setSessions(parseSessions(window.location.hash, Date.now()));
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const [boards, setBoards] = useState<TrelloBoard[]>([]);

  // Nota rápida
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const saveNote = async () => {
    const content = note.trim();
    if (!content || savingNote) return;
    setSavingNote(true);
    try {
      const res = await api.notes.create({ date: today, content, mood: 3 });
      if (!res?.success) throw new Error();
      setNote("");
      toast.success("Nota guardada", content.slice(0, 60));
    } catch {
      toast.error("Error", "No se pudo guardar la nota");
    } finally {
      setSavingNote(false);
    }
  };

  const loadExtras = useCallback(async () => {
    const [counters, orders, summary, trello] = await Promise.allSettled([
      api.counters.getDay(today),
      api.printing.orders.list(),
      api.printing.summary(),
      api.trello.tickets(),
    ]);
    if (trello.status === "fulfilled") {
      const data = trello.value?.data as { boards?: TrelloBoard[] } | undefined;
      if (Array.isArray(data?.boards)) setBoards(data.boards);
    }
    if (counters.status === "fulfilled" && counters.value?.data) {
      setVentasMensajes(counters.value.data[VENTAS_MENSAJES_KEY] ?? 0);
    }
    const orderList =
      orders.status === "fulfilled" && Array.isArray(orders.value?.data)
        ? (orders.value.data as { status: string }[])
        : [];
    const toCollect =
      summary.status === "fulfilled"
        ? (summary.value?.data as { receivables?: { total?: number } })?.receivables?.total ?? 0
        : 0;
    setPrinting({ orders: pendingPrintOrders(orderList), toCollect });
  }, [today]);

  useEffect(() => {
    if (isAuthenticated && !user) router.push("/auth/login");
  }, [user, isAuthenticated, router]);

  const refresh = useCallback(() => {
    setNow(new Date());
    fetchDayScore(today);
    fetchTodayHydration(today);
    getAllFoodAnalysis();
    fetchCalendarEvents(today, tomorrow);
    loadExtras();
  }, [
    today,
    tomorrow,
    fetchDayScore,
    fetchTodayHydration,
    getAllFoodAnalysis,
    fetchCalendarEvents,
    loadExtras,
  ]);

  // Al abrir y cada vez que volvés a la pestaña (cargaste algo en otra) se
  // recalcula, así lo que ya hiciste aparece tildado.
  useEffect(() => {
    refresh();
    fetchHydrationGoal();
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh, fetchHydrationGoal]);

  if (!isAuthenticated || !user || isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-2/3" />
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  // Hábitos que tocan hoy (days = [L..D])
  const dayIndex = (now.getDay() + 6) % 7;
  const todaysHabits = activities
    .filter((a) => !a.archived && a.days?.[dayIndex])
    .map((a) => ({
      id: a.id,
      name: a.name,
      done: (a.completions || []).some((c) => c.date === today && c.completed),
    }));
  const courseHabit = activities.find(
    (a) => !a.archived && COURSE_HABIT.test(a.name)
  );
  const course = courseHabit
    ? {
        id: courseHabit.id,
        scheduledToday: !!courseHabit.days?.[dayIndex],
        done: (courseHabit.completions || []).some(
          (c) => c.date === today && c.completed
        ),
      }
    : null;
  const habits = todaysHabits.filter((h) => h.id !== course?.id);

  // Tareas de hoy: mismo criterio que /hoy (day-score, con fallback al store)
  const score = currentDayScore?.date === today ? currentDayScore : null;
  const todayTasks = tasks.filter(
    (t) => t.dueDate === today || (!t.dueDate && !t.completed)
  );
  const tasksTotal =
    score && score.tasksTotal > 0 ? score.tasksTotal : todayTasks.length;
  const tasksDone =
    score && score.tasksTotal > 0
      ? score.tasksCompleted
      : todayTasks.filter((t) => t.completed).length;

  const items = buildDayChecklist({
    now,
    mealsToday: nutritionAnalyses.filter((n) => n.date === today).length,
    glasses: todayHydration?.glassesConsumed ?? 0,
    waterGoal: hydrationGoal.goalGlasses,
    habits,
    tasksPending: Math.max(0, tasksTotal - tasksDone),
    tasksTotal,
    course,
    exerciseLogged: score ? score.exerciseLogged : undefined,
    reflectionLogged: score ? score.reflectionLogged : undefined,
    ventasMensajes: ventasPracticeActive(now) ? ventasMensajes : null,
  });
  const upcoming = nextEvent(calendarEvents, now);
  const topTask = pickTopTask(tasks, today);
  const prep = meetingPrep(upcoming, boards, now);
  const tickets = staleTickets(boards, now).slice(0, 5);
  const quick = quickTasks(tasks).slice(0, 5);

  const addMensaje = async (delta: number) => {
    setVentasMensajes((v) => Math.max(0, v + delta)); // optimista
    try {
      const res = await api.counters.adjust(VENTAS_MENSAJES_KEY, delta, today);
      if (res?.data) setVentasMensajes(res.data.value);
    } catch {
      setVentasMensajes((v) => Math.max(0, v - delta));
    }
  };
  const pending = items.filter((i) => !i.done).length;

  const go = (item: ChecklistItem) => {
    if (item.external) window.open(item.href, "_blank", "noopener");
    else router.push(item.href);
  };

  const toggleHabit = async (id: string) => {
    await toggleCompletion(id, new Date());
    fetchDayScore(today);
  };

  return (
    <div className="space-y-3">
      <PageHeader
        title="Mientras Claude labura"
        subtitle={
          pending === 0
            ? "Tenés todo lo básico al día"
            : `Te ${pending === 1 ? "falta 1 cosa" : `faltan ${pending} cosas`}. Elegí una.`
        }
      />

      {upcoming && (
        <Card className="flex items-center gap-3 p-3">
          <CalendarClock size={20} className="text-primary" />
          <div className="flex-1 text-sm">
            <span className="font-medium">
              {upcoming.minutesUntil < 60
                ? `En ${upcoming.minutesUntil} min`
                : `A las ${upcoming.time}`}
              :
            </span>{" "}
            {upcoming.title}
          </div>
          <span className="font-mono text-xs text-muted-foreground">{upcoming.time}</span>
        </Card>
      )}

      {prep && (
        <Card className="space-y-2 border-primary/40 p-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.04em] text-primary">
            Para la reunión · {prep.board}
          </div>
          {[
            { label: "Se movió desde la anterior", cards: prep.moved },
            { label: "Sigue en curso", cards: prep.pending },
          ].map((group) => (
            <div key={group.label}>
              <div className="text-xs font-medium text-muted-foreground">
                {group.label} ({group.cards.length})
              </div>
              {group.cards.length === 0 ? (
                <div className="text-sm text-muted-foreground">Nada</div>
              ) : (
                <ul className="text-sm">
                  {group.cards.slice(0, 6).map((c) => (
                    <li key={c.url} className="truncate">
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {c.name}
                      </a>{" "}
                      <span className="text-xs text-muted-foreground">· {c.list}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Card>
      )}

      {sessions && (
        <Card className="space-y-1 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
            <Bot size={14} />
            Sesiones de Claude
          </div>
          {sessions.waiting.map((s) => (
            <div key={`w-${s.name}`} className="flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="font-medium">{s.name}</span>
              <span className="text-xs text-muted-foreground">
                te espera hace {s.minutesAgo} min
              </span>
            </div>
          ))}
          {sessions.running.map((name) => (
            <div key={`r-${name}`} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              {name} · laburando
            </div>
          ))}
        </Card>
      )}

      {topTask && (
        <Link href="/tasks" className="block">
          <Card className="border-primary/40 bg-primary/[0.06] p-3">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.04em] text-primary">
              <Target size={14} />
              Lo más importante ahora
            </div>
            <div className="font-medium">{topTask.title}</div>
            <div className="text-xs text-muted-foreground">
              {[topTask.project, topTask.reason].filter(Boolean).join(" · ")}
            </div>
          </Card>
        </Link>
      )}

      {pending === 0 && (
        <Card className="flex items-center gap-3 border-primary/20 bg-primary/[0.06] p-4">
          <PartyPopper size={22} className="text-primary" />
          <div className="flex-1 text-sm">
            Todo al día. Si te sobra un rato, sumale al objetivo NZ.
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/objetivo">Objetivo</Link>
          </Button>
        </Card>
      )}

      {quick.length > 0 && (
        <Card className="space-y-1 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
            <Zap size={14} />
            De 2 minutos
          </div>
          {quick.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => toggleTask(t.id)}
              className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-sm hover:bg-muted/50"
            >
              <Circle size={16} className="shrink-0 text-muted-foreground" />
              <span className="truncate">{t.title}</span>
            </button>
          ))}
        </Card>
      )}

      {items.map((item) => {
        const Icon = ICONS[item.id];
        return (
          <Card
            key={item.id}
            className={`p-3 ${item.done ? "opacity-60" : "border-primary/30"}`}
          >
            <button
              type="button"
              onClick={() => go(item)}
              className="flex w-full items-center gap-3 text-left"
            >
              <Icon
                size={20}
                className={item.done ? "text-muted-foreground" : "text-primary"}
              />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.detail}</div>
              </div>
              {item.done ? (
                <CheckCircle2 size={20} className="text-green-500" />
              ) : item.external ? (
                <ExternalLink size={18} className="text-muted-foreground" />
              ) : (
                <ChevronRight size={18} className="text-muted-foreground" />
              )}
            </button>

            {/* Acciones rápidas sin salir de la pantalla */}
            {item.id === "agua" && !item.done && (
              <div className="mt-2 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => adjustHydration(today, 1)}>
                  +1 vaso
                </Button>
              </div>
            )}

            {item.id === "ventas-mensajes" && (
              <div className="mt-2 flex justify-end gap-2">
                {ventasMensajes > 0 && (
                  <Button size="sm" variant="ghost" onClick={() => addMensaje(-1)}>
                    −1
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => addMensaje(1)}>
                  +1 mensaje
                </Button>
              </div>
            )}

            {item.id === "curso" && course && (
              <div className="mt-2 flex justify-end gap-2">
                {item.alwaysOpen && (
                  <Button size="sm" variant="outline" onClick={() => go(item)}>
                    <ExternalLink size={14} className="mr-1" />
                    Ir a Platzi
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={item.done ? "ghost" : "outline"}
                  onClick={() => toggleHabit(course.id)}
                >
                  {item.done ? "Desmarcar" : "Ya hice la clase"}
                </Button>
              </div>
            )}

            {item.id === "habitos" && (
              <div className="mt-2 space-y-1 border-t pt-2">
                {habits.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => toggleHabit(h.id)}
                    className="flex w-full items-center gap-2 rounded-md px-1 py-1 text-left text-sm hover:bg-muted/50"
                  >
                    {h.done ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <Circle size={16} className="text-muted-foreground" />
                    )}
                    <span className={h.done ? "text-muted-foreground line-through" : ""}>
                      {h.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </Card>
        );
      })}

      {tickets.length > 0 && (
        <Card className="space-y-1 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
            <KanbanSquare size={14} />
            Mis tickets en curso
          </div>
          {tickets.map((t) => (
            <a
              key={t.url}
              href={t.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted/50"
            >
              <span className="min-w-0 flex-1 truncate">{t.name}</span>
              <span
                className={`shrink-0 text-xs ${
                  t.daysIdle >= 3 ? "font-medium text-amber-600" : "text-muted-foreground"
                }`}
              >
                {t.board} · {t.daysIdle === 0 ? "hoy" : `${t.daysIdle}d quieta`}
              </span>
            </a>
          ))}
        </Card>
      )}

      {/* Nota rápida: la idea que se cruza mientras esperás */}
      <Card className="flex items-center gap-2 p-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveNote();
          }}
          placeholder="Nota rápida… (Enter para guardar)"
          className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
        />
        <Button
          size="sm"
          variant="ghost"
          disabled={!note.trim() || savingNote}
          onClick={saveNote}
          aria-label="Guardar nota"
        >
          <Send size={16} />
        </Button>
      </Card>

      {waitStats && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Timer size={14} />
          Hoy: {waitStats.minutes} min de espera aprovechados · {waitStats.count}{" "}
          {waitStats.count === 1 ? "vez" : "veces"} sin celu
        </div>
      )}

      {printing && (printing.orders > 0 || printing.toCollect > 0) && (
        <Link href="/negocio" className="block">
          <Card className="flex items-center gap-3 p-3">
            <Printer size={20} className="text-primary" />
            <div className="min-w-0 flex-1">
              <div className="font-medium">Negocio 3D</div>
              <div className="text-xs text-muted-foreground">
                {[
                  printing.orders > 0 &&
                    `${printing.orders} ${printing.orders === 1 ? "pedido pendiente" : "pedidos pendientes"}`,
                  printing.toCollect > 0 && `${fmtARS(printing.toCollect)} por cobrar`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </Card>
        </Link>
      )}
    </div>
  );
}
