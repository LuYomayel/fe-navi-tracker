import { describe, expect, it } from "vitest";
import {
  meetingPrep,
  parseSessions,
  quickTasks,
  staleTickets,
  type TrelloBoard,
} from "./foco-work";

const now = new Date(2026, 10, 11, 9, 40); // miércoles 11-nov 09:40
const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
const card = (name: string, idleDays: number, mine = true) => ({
  name,
  url: `https://trello.com/c/${name}`,
  list: "Working On",
  due: "",
  lastActivity: daysAgo(idleDays),
  mine,
});
const emptyBuckets = () => ({
  en_curso: [],
  en_revision: [],
  proximas: [],
  backlog: [],
  otras: [],
  done: [],
});
const boards: TrelloBoard[] = [
  {
    code: "PLA",
    name: "Platform Dev",
    buckets: {
      ...emptyBuckets(),
      en_curso: [card("Fresca", 0.2), card("Vieja", 6)],
      en_revision: [card("En review", 3)],
      backlog: [card("Backlog tocado ayer", 0.5)],
      done: [card("Cerrada ayer", 0.6)],
    },
  },
  {
    code: "STA",
    name: "Stampia",
    buckets: {
      ...emptyBuckets(),
      en_curso: [card("Mía de Stampia", 2), card("De Alvaro", 9, false)],
      proximas: [card("Movida hace 3d", 3, false)],
    },
  },
];

describe("staleTickets", () => {
  it("lista mis cards en curso o en revisión, la más quieta primero", () => {
    const r = staleTickets(boards, now);
    expect(r.map((t) => t.name)).toEqual(["Vieja", "En review", "Mía de Stampia", "Fresca"]);
    expect(r[0]).toMatchObject({ board: "Platform Dev", daysIdle: 6 });
  });
  it("no incluye las que no son mías", () => {
    expect(staleTickets(boards, now).some((t) => t.name === "De Alvaro")).toBe(false);
  });
});

describe("meetingPrep", () => {
  it("null si falta más de 30 min o el evento no es una reunión conocida", () => {
    expect(meetingPrep({ title: "Daily", time: "10:00", minutesUntil: 31 }, boards, now)).toBeNull();
    expect(meetingPrep({ title: "Psicóloga", time: "10:00", minutesUntil: 10 }, boards, now)).toBeNull();
    expect(meetingPrep(null, boards, now)).toBeNull();
  });
  it("Daily → Platform Dev: lo que se movió en las últimas 24h (sin backlog) y lo que sigue en curso", () => {
    const r = meetingPrep({ title: "Daily Pulpou", time: "10:00", minutesUntil: 20 }, boards, now)!;
    expect(r.board).toBe("Platform Dev");
    expect(r.moved.map((c) => c.name)).toEqual(["Fresca", "Cerrada ayer"]);
    expect(r.pending.map((c) => c.name)).toEqual(["Fresca", "Vieja"]);
  });
  it("Daily de lunes mira 72h para cubrir el finde", () => {
    const monday = new Date(2026, 10, 16, 9, 40);
    const b: TrelloBoard[] = [
      {
        code: "PLA",
        name: "Platform Dev",
        buckets: {
          ...emptyBuckets(),
          done: [
            { ...card("Del viernes", 0), lastActivity: new Date(2026, 10, 13, 17).toISOString() },
          ],
        },
      },
    ];
    const r = meetingPrep({ title: "Daily", time: "10:00", minutesUntil: 20 }, b, monday)!;
    expect(r.moved.map((c) => c.name)).toEqual(["Del viernes"]);
  });
  it("Reu Stampia → board Stampia, última semana, incluye cards del equipo", () => {
    const r = meetingPrep({ title: "Reu Stampia", time: "16:00", minutesUntil: 5 }, boards, now)!;
    expect(r.board).toBe("Stampia");
    expect(r.moved.map((c) => c.name)).toEqual(["Mía de Stampia", "Movida hace 3d"]);
    expect(r.pending.map((c) => c.name)).toEqual(["Mía de Stampia", "De Alvaro"]);
  });
  it("EaseTrain matchea aunque el board no haya venido (devuelve null)", () => {
    expect(meetingPrep({ title: "Reu EaseTrain (Enzo)", time: "08:00", minutesUntil: 5 }, boards, now)).toBeNull();
  });
});

describe("quickTasks", () => {
  const t = (over: Record<string, unknown>) => ({
    id: String(over.title),
    title: "x",
    completed: false,
    ...over,
  });
  it("toma las abiertas marcadas como rápidas por tag o por el título (⚡, #rapida, #2min)", () => {
    const r = quickTasks([
      t({ title: "Con tag", tags: ["Rápida"] }),
      t({ title: "⚡ Responder a Julian" }),
      t({ title: "Pasar card a review #2min" }),
      t({ title: "Normal" }),
      t({ title: "⚡ Ya hecha", completed: true }),
      t({ title: "⚡ Pausada", projectStatus: "paused" }),
    ]);
    expect(r.map((x) => x.title)).toEqual([
      "Con tag",
      "⚡ Responder a Julian",
      "Pasar card a review #2min",
    ]);
  });
});

describe("parseSessions", () => {
  const nowMs = 1_800_000_000_000;
  const ago = (min: number) => Math.round(nowMs / 1000) - min * 60;
  it("lee del hash las sesiones que te esperan (con hace cuánto) y las que siguen", () => {
    const hash = `#w=${encodeURIComponent(`Curso de ventas~${ago(6)},DEMO~${ago(1)}`)}&r=${encodeURIComponent("DINOvsCLIP,impresion-3d")}`;
    expect(parseSessions(hash, nowMs)).toEqual({
      waiting: [
        { name: "Curso de ventas", minutesAgo: 6 },
        { name: "DEMO", minutesAgo: 1 },
      ],
      running: ["DINOvsCLIP", "impresion-3d"],
    });
  });
  it("null si no hay nada que mostrar", () => {
    expect(parseSessions("", nowMs)).toBeNull();
    expect(parseSessions("#w=&r=", nowMs)).toBeNull();
  });
});
