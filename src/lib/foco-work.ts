// Lógica de laburo de /foco: tickets de Trello, preparación de reuniones,
// tareas rápidas y sesiones de Claude Code. Pura, testeada en foco-work.test.ts.

import type { NextEvent } from "./day-checklist";

export interface TrelloCardLite {
  name: string;
  url: string;
  list: string;
  due: string;
  lastActivity: string;
  mine: boolean;
}

export interface TrelloBoard {
  code: string;
  name: string;
  buckets: Record<string, TrelloCardLite[]>;
}

const DAY_MS = 86400000;

// ── Mis tickets en curso, el más quieto primero ──

export interface StaleTicket {
  name: string;
  url: string;
  board: string;
  list: string;
  daysIdle: number;
}

export function staleTickets(boards: TrelloBoard[], now: Date): StaleTicket[] {
  const out: (StaleTicket & { idleMs: number })[] = [];
  for (const b of boards) {
    for (const bucket of ["en_curso", "en_revision"]) {
      for (const c of b.buckets[bucket] ?? []) {
        if (!c.mine) continue;
        const idleMs = c.lastActivity ? now.getTime() - new Date(c.lastActivity).getTime() : 0;
        out.push({
          name: c.name,
          url: c.url,
          board: b.name,
          list: c.list,
          daysIdle: Math.max(0, Math.floor(idleMs / DAY_MS)),
          idleMs,
        });
      }
    }
  }
  return out.sort((a, b) => b.idleMs - a.idleMs).map(({ idleMs: _idle, ...t }) => t);
}

// ── Preparación de reuniones ──

const MEETINGS: { match: RegExp; board: string; daily: boolean }[] = [
  { match: /daily/i, board: "PLA", daily: true },
  { match: /stampia/i, board: "STA", daily: false },
  { match: /ease\s?train|enzo/i, board: "EAS", daily: false },
];
const PREP_WINDOW_MIN = 30;
const MOVED_BUCKETS = ["en_curso", "en_revision", "proximas", "otras", "done"];

export interface MeetingPrep {
  title: string;
  board: string;
  minutesUntil: number;
  /** Cards con actividad desde la reunión anterior */
  moved: TrelloCardLite[];
  /** Cards que siguen en curso */
  pending: TrelloCardLite[];
}

/**
 * Si el próximo evento es una reunión conocida y falta ≤30 min, arma el
 * resumen: qué se movió desde la anterior (daily: 24h, lunes 72h; semanal: 7
 * días) y qué sigue en curso.
 */
export function meetingPrep(
  event: NextEvent | null,
  boards: TrelloBoard[],
  now: Date
): MeetingPrep | null {
  if (!event || event.minutesUntil > PREP_WINDOW_MIN) return null;
  const meeting = MEETINGS.find((m) => m.match.test(event.title));
  if (!meeting) return null;
  const board = boards.find((b) => b.code === meeting.board);
  if (!board) return null;

  const hours = meeting.daily ? (now.getDay() === 1 ? 72 : 24) : 7 * 24;
  const since = now.getTime() - hours * 3600000;
  const moved = MOVED_BUCKETS.flatMap((k) => board.buckets[k] ?? []).filter(
    (c) => c.lastActivity && new Date(c.lastActivity).getTime() >= since
  );
  return {
    title: event.title,
    board: board.name,
    minutesUntil: event.minutesUntil,
    moved,
    pending: board.buckets.en_curso ?? [],
  };
}

// ── Tareas de 2 minutos ──

const QUICK_TAGS = ["rapida", "rápida", "2min"];
const QUICK_TITLE = /⚡|#r[aá]pida|#2min/i;

export function quickTasks<
  T extends {
    title: string;
    completed: boolean;
    tags?: string[];
    projectStatus?: string | null;
  },
>(tasks: T[]): T[] {
  return tasks.filter(
    (t) =>
      !t.completed &&
      t.projectStatus !== "paused" &&
      t.projectStatus !== "archived" &&
      (QUICK_TITLE.test(t.title) ||
        (t.tags ?? []).some((tag) => QUICK_TAGS.includes(tag.toLowerCase())))
  );
}

// ── Sesiones de Claude Code (las manda el hook en el hash de la URL) ──
// Formato: #w=Nombre~epochSeg,Nombre2~epochSeg&r=Nombre3,Nombre4

export interface SessionsState {
  waiting: { name: string; minutesAgo: number }[];
  running: string[];
}

export function parseSessions(hash: string, nowMs: number): SessionsState | null {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  const waiting = (p.get("w") ?? "")
    .split(",")
    .filter(Boolean)
    .map((entry) => {
      const [name, epoch] = entry.split("~");
      const minutesAgo = Math.max(0, Math.round((nowMs / 1000 - Number(epoch)) / 60));
      return { name, minutesAgo: Number.isFinite(minutesAgo) ? minutesAgo : 0 };
    })
    .filter((s) => s.name);
  const running = (p.get("r") ?? "").split(",").filter(Boolean);
  if (waiting.length === 0 && running.length === 0) return null;
  return { waiting, running };
}
