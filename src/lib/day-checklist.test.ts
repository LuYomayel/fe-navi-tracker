import { describe, expect, it } from "vitest";
import {
  buildDayChecklist,
  expectedGlasses,
  expectedMeals,
  type DayChecklistInput,
} from "./day-checklist";

// Miércoles 11-nov-2026 a una hora dada (hora local)
const at = (h: number, m = 0) => new Date(2026, 10, 11, h, m);

const base = (over: Partial<DayChecklistInput> = {}): DayChecklistInput => ({
  now: at(15),
  mealsToday: 2,
  glasses: 9,
  waterGoal: 9,
  habits: [],
  tasksPending: 0,
  tasksTotal: 0,
  course: { id: "c1", scheduledToday: true, done: true },
  ...over,
});

const item = (input: DayChecklistInput, id: string) =>
  buildDayChecklist(input).find((i) => i.id === id);

describe("expectedMeals", () => {
  it("no espera comidas antes de las 10", () => {
    expect(expectedMeals(at(9, 59))).toBe(0);
  });
  it("espera desayuno desde las 10, almuerzo desde las 14, merienda 18, cena 22", () => {
    expect(expectedMeals(at(10))).toBe(1);
    expect(expectedMeals(at(14))).toBe(2);
    expect(expectedMeals(at(18))).toBe(3);
    expect(expectedMeals(at(22))).toBe(4);
  });
});

describe("expectedGlasses", () => {
  it("es 0 antes de las 8 y la meta completa desde las 22", () => {
    expect(expectedGlasses(at(7), 9)).toBe(0);
    expect(expectedGlasses(at(22), 9)).toBe(9);
    expect(expectedGlasses(at(23), 9)).toBe(9);
  });
  it("es proporcional en el medio (15hs = mitad del día → 5 de 9)", () => {
    expect(expectedGlasses(at(15), 9)).toBe(5);
  });
});

describe("buildDayChecklist · comida", () => {
  it("pendiente si a las 15 no cargué ninguna comida, y lleva a cargarla", () => {
    const c = item(base({ mealsToday: 0 }), "comida")!;
    expect(c.done).toBe(false);
    expect(c.href).toBe("/salud?tab=comidas&log=1");
  });
  it("pendiente si ya pasó el almuerzo y sólo cargué el desayuno", () => {
    expect(item(base({ mealsToday: 1 }), "comida")!.done).toBe(false);
  });
  it("hecha si cargué lo que corresponde a la hora", () => {
    expect(item(base({ mealsToday: 2 }), "comida")!.done).toBe(true);
  });
});

describe("buildDayChecklist · agua", () => {
  it("pendiente si voy atrasado respecto del ritmo", () => {
    const a = item(base({ glasses: 2 }), "agua")!;
    expect(a.done).toBe(false);
    expect(a.detail).toContain("2/9");
  });
  it("hecha si voy al día con el ritmo", () => {
    expect(item(base({ glasses: 5 }), "agua")!.done).toBe(true);
  });
});

describe("buildDayChecklist · hábitos", () => {
  it("pendiente mientras quede algún hábito de hoy sin tildar", () => {
    const h = item(
      base({
        habits: [
          { id: "h1", name: "Creatina", done: true },
          { id: "h2", name: "Mover el cuerpo", done: false },
        ],
      }),
      "habitos"
    )!;
    expect(h.done).toBe(false);
    expect(h.detail).toBe("1/2");
  });
  it("no aparece si hoy no hay hábitos", () => {
    expect(item(base({ habits: [] }), "habitos")).toBeUndefined();
  });
});

describe("buildDayChecklist · tareas", () => {
  it("pendiente si quedan tareas de hoy", () => {
    const t = item(base({ tasksTotal: 3, tasksPending: 2 }), "tareas")!;
    expect(t.done).toBe(false);
    expect(t.href).toBe("/tasks");
  });
  it("no aparece si hoy no hay tareas", () => {
    expect(item(base({ tasksTotal: 0, tasksPending: 0 }), "tareas")).toBeUndefined();
  });
});

describe("buildDayChecklist · curso de ventas", () => {
  it("pendiente si hoy toca y no lo tildé; abre la ruta de Platzi afuera", () => {
    const c = item(base({ course: { id: "c1", scheduledToday: true, done: false } }), "curso")!;
    expect(c.done).toBe(false);
    expect(c.href).toBe("https://platzi.com/mis-rutas/17222033/");
    expect(c.external).toBe(true);
  });
  it("no aparece si hoy no toca (finde) o si no existe el hábito", () => {
    expect(item(base({ course: { id: "c1", scheduledToday: false, done: false } }), "curso")).toBeUndefined();
    expect(item(base({ course: null }), "curso")).toBeUndefined();
  });
});

describe("buildDayChecklist · orden", () => {
  it("pone primero lo pendiente, respetando comida → agua → hábitos → tareas → curso", () => {
    const ids = buildDayChecklist(
      base({
        mealsToday: 2, // hecha
        glasses: 0, // pendiente
        habits: [{ id: "h1", name: "Creatina", done: false }],
        tasksTotal: 1,
        tasksPending: 0, // hecha
        course: { id: "c1", scheduledToday: true, done: false },
      })
    ).map((i) => i.id);
    expect(ids).toEqual(["agua", "habitos", "curso", "comida", "tareas"]);
  });
});
