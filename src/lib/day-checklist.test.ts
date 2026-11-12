import { describe, expect, it } from "vitest";
import {
  buildDayChecklist,
  englishWork,
  ENGLISH_ACADEMY_URL,
  expectedGlasses,
  expectedMeals,
  nextEvent,
  parseWaitStats,
  pickTopTask,
  pendingPrintOrders,
  ventasPracticeActive,
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
  it("aunque ya haya marcado la clase, sigue ofreciendo ir a Platzi", () => {
    const c = item(base({ course: { id: "c1", scheduledToday: true, done: true } }), "curso")!;
    expect(c.done).toBe(true);
    expect(c.href).toBe("https://platzi.com/mis-rutas/17222033/");
    expect(c.alwaysOpen).toBe(true);
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

// ── Ítems agregados: ejercicio, reflexión, práctica de ventas ──

describe("buildDayChecklist · ejercicio", () => {
  it("pendiente si no registré actividad, y lleva a Ejercicio", () => {
    const e = item(base({ exerciseLogged: false }), "ejercicio")!;
    expect(e.done).toBe(false);
    expect(e.href).toBe("/salud?tab=ejercicio");
  });
  it("hecho si ya registré", () => {
    expect(item(base({ exerciseLogged: true }), "ejercicio")!.done).toBe(true);
  });
  it("no aparece si no se pasó el dato", () => {
    expect(item(base(), "ejercicio")).toBeUndefined();
  });
});

describe("buildDayChecklist · reflexión", () => {
  it("no aparece antes de las 20 si no la hice (es de fin de día)", () => {
    expect(item(base({ now: at(19, 59), reflectionLogged: false }), "reflexion")).toBeUndefined();
  });
  it("pendiente desde las 20 si no la hice", () => {
    const r = item(base({ now: at(20), reflectionLogged: false }), "reflexion")!;
    expect(r.done).toBe(false);
    expect(r.href).toBe("/habitos");
  });
  it("aparece hecha si ya la hice, a cualquier hora", () => {
    expect(item(base({ now: at(9), reflectionLogged: true }), "reflexion")!.done).toBe(true);
  });
});

describe("ventasPracticeActive", () => {
  it("arranca el lunes 16-nov-2026 y sólo de lunes a viernes", () => {
    expect(ventasPracticeActive(new Date(2026, 10, 13, 12))).toBe(false); // vie 13
    expect(ventasPracticeActive(new Date(2026, 10, 16, 12))).toBe(true); // lun 16
    expect(ventasPracticeActive(new Date(2026, 10, 20, 12))).toBe(true); // vie 20
    expect(ventasPracticeActive(new Date(2026, 10, 21, 12))).toBe(false); // sáb 21
  });
});

describe("buildDayChecklist · mensajes de venta", () => {
  it("pendiente mientras no llegue a 5", () => {
    const v = item(base({ ventasMensajes: 3 }), "ventas-mensajes")!;
    expect(v.done).toBe(false);
    expect(v.detail).toBe("3/5 mensajes");
  });
  it("hecho al llegar a 5", () => {
    expect(item(base({ ventasMensajes: 5 }), "ventas-mensajes")!.done).toBe(true);
  });
  it("no aparece si no está activa la práctica (null)", () => {
    expect(item(base({ ventasMensajes: null }), "ventas-mensajes")).toBeUndefined();
  });
});

describe("nextEvent", () => {
  const ev = (title: string, h: number, m = 0, allDay = false) => ({
    title,
    startTime: new Date(2026, 10, 11, h, m).toISOString(),
    allDay,
  });
  it("devuelve el próximo evento de hoy que todavía no empezó, con minutos que faltan", () => {
    const r = nextEvent([ev("Daily", 10), ev("Stampia", 16), ev("Psicóloga", 18)], at(15, 25));
    expect(r).toEqual({ title: "Stampia", time: "16:00", minutesUntil: 35 });
  });
  it("ignora los de todo el día y los de mañana", () => {
    const manana = { title: "Mañana", startTime: new Date(2026, 10, 12, 9).toISOString(), allDay: false };
    expect(nextEvent([ev("Feriado", 0, 0, true), manana], at(15))).toBeNull();
  });
});

describe("pendingPrintOrders", () => {
  it("cuenta los pedidos que no están entregados ni cancelados", () => {
    const orders = ["pedido", "confirmado", "imprimiendo", "listo", "entregado", "cancelado"].map(
      (status) => ({ status })
    );
    expect(pendingPrintOrders(orders)).toBe(4);
  });
});

// ── Lo más importante ahora + tiempo recuperado ──

describe("pickTopTask", () => {
  const today = "2026-11-11";
  const t = (over: Record<string, unknown>) => ({
    id: String(over.title),
    title: "x",
    priority: "medium",
    status: "pending",
    completed: false,
    ...over,
  });

  it("gana la que vence antes dentro de los próximos 7 días, aunque otra sea más prioritaria", () => {
    const r = pickTopTask(
      [
        t({ title: "Urgente sin fecha", priority: "urgent" }),
        t({ title: "EMA entrega", dueDate: "2026-11-13", priority: "medium" }),
        t({ title: "Otra", dueDate: "2026-11-15", priority: "high" }),
      ],
      today
    )!;
    expect(r.title).toBe("EMA entrega");
    expect(r.reason).toBe("Vence en 2 días");
  });
  it("una vencida va primero y lo dice", () => {
    const r = pickTopTask(
      [t({ title: "Hoy", dueDate: today }), t({ title: "Vieja", dueDate: "2026-11-09" })],
      today
    )!;
    expect(r.title).toBe("Vieja");
    expect(r.reason).toBe("Vencida hace 2 días");
  });
  it("dice 'Vence hoy' y 'Vence mañana'", () => {
    expect(pickTopTask([t({ title: "a", dueDate: today })], today)!.reason).toBe("Vence hoy");
    expect(pickTopTask([t({ title: "a", dueDate: "2026-11-12" })], today)!.reason).toBe("Vence mañana");
  });
  it("sin nada que venza pronto, gana la prioridad; a igual prioridad, la que está en curso", () => {
    const r = pickTopTask(
      [
        t({ title: "Lejana", dueDate: "2027-01-31", priority: "low" }),
        t({ title: "Alta", priority: "high" }),
        t({ title: "Alta en curso", priority: "high", status: "in_progress" }),
      ],
      today
    )!;
    expect(r.title).toBe("Alta en curso");
    expect(r.reason).toBe("Prioridad alta · en curso");
  });
  it("ignora completadas y las de proyectos pausados o archivados", () => {
    expect(
      pickTopTask(
        [
          t({ title: "Hecha", dueDate: today, completed: true }),
          t({ title: "Pausada", dueDate: today, projectStatus: "paused" }),
          t({ title: "Archivada", dueDate: today, projectStatus: "archived" }),
        ],
        today
      )
    ).toBeNull();
  });
});

describe("parseWaitStats", () => {
  it("lee minutos y veces que manda el hook por la URL", () => {
    expect(parseWaitStats("?min=47&veces=12")).toEqual({ minutes: 47, count: 12 });
  });
  it("null si no viene nada, si es la primera del día o si viene basura", () => {
    expect(parseWaitStats("")).toBeNull();
    expect(parseWaitStats("?min=0&veces=0")).toBeNull();
    expect(parseWaitStats("?min=abc&veces=-3")).toBeNull();
  });
});

describe("englishWork", () => {
  const today = "2026-11-12";
  it("devuelve null si no hay nada de inglés hoy", () => {
    expect(
      englishWork({
        today,
        tasks: [{ title: "Preparar demo Shopee", dueDate: today, completed: false }],
        habits: [{ id: "h1", name: "Creatina", done: false }],
      })
    ).toBeNull();
  });
  it("toma tareas de inglés de hoy, vencidas sin hacer y sin fecha", () => {
    const r = englishWork({
      today,
      tasks: [
        { title: "Tarea de Inglés: vocabulario", dueDate: today, completed: false },
        { title: "English homework", dueDate: "2026-11-10", completed: false },
        { title: "Repasar ingles", dueDate: null, completed: false },
        { title: "Inglés viejo ya hecho", dueDate: "2026-11-10", completed: true },
        { title: "Inglés de mañana", dueDate: "2026-11-13", completed: false },
      ],
      habits: [],
    });
    expect(r).toEqual({
      pending: ["Tarea de Inglés: vocabulario", "English homework", "Repasar ingles"],
      total: 3,
    });
  });
  it("cuenta los hábitos de inglés que tocan hoy y lo hecho de hoy", () => {
    const r = englishWork({
      today,
      tasks: [{ title: "Inglés unidad 3", dueDate: today, completed: true }],
      habits: [
        { id: "h1", name: "Vocabulario de inglés", done: false },
        { id: "h2", name: "Agua", done: false },
      ],
    });
    expect(r).toEqual({ pending: ["Vocabulario de inglés"], total: 2 });
  });
  it("no matchea palabras que contienen 'ingles' adentro", () => {
    expect(
      englishWork({
        today,
        tasks: [{ title: "Revisar singleston", dueDate: today, completed: false }],
        habits: [],
      })
    ).toBeNull();
  });
});

describe("buildDayChecklist · inglés", () => {
  it("no muestra el ítem si no hay nada de inglés", () => {
    expect(item(base(), "ingles")).toBeUndefined();
  });
  it("pendiente: lleva a la academia en pestaña nueva", () => {
    const i = item(base({ ingles: { pending: ["Vocabulario del día"], total: 1 } }), "ingles");
    expect(i).toMatchObject({
      done: false,
      href: ENGLISH_ACADEMY_URL,
      external: true,
      alwaysOpen: true,
      detail: "Vocabulario del día",
    });
  });
  it("con varias pendientes muestra la cantidad", () => {
    const i = item(base({ ingles: { pending: ["a", "b"], total: 3 } }), "ingles");
    expect(i?.detail).toBe("2 pendientes de 3");
  });
  it("todo hecho: queda tildado pero sigue abriendo la academia", () => {
    const i = item(base({ ingles: { pending: [], total: 2 } }), "ingles");
    expect(i).toMatchObject({ done: true, href: ENGLISH_ACADEMY_URL, alwaysOpen: true });
  });
});

describe("inglés · material adjunto (link en la descripción)", () => {
  const today = "2026-11-12";
  const pdf = "https://api.example.com/uploads/ingles/vocab-abc.pdf";
  it("englishWork toma el primer link de una tarea de inglés pendiente", () => {
    const r = englishWork({
      today,
      tasks: [
        { title: "Inglés: leer vocabulario", dueDate: today, completed: false, description: `PDF: ${pdf} (clase 19:15)` },
      ],
      habits: [],
    });
    expect(r?.url).toBe(pdf);
  });
  it("sin link en la descripción no hay url", () => {
    const r = englishWork({
      today,
      tasks: [{ title: "Inglés: tarea", dueDate: today, completed: false, description: "unidad 3" }],
      habits: [],
    });
    expect(r).not.toBeNull();
    expect(r?.url).toBeUndefined();
  });
  it("ignora el link de una tarea de inglés ya completada", () => {
    const r = englishWork({
      today,
      tasks: [
        { title: "Inglés viejo", dueDate: today, completed: true, description: pdf },
        { title: "Inglés nuevo", dueDate: today, completed: false },
      ],
      habits: [],
    });
    expect(r?.url).toBeUndefined();
  });
  it("el ítem abre el material si hay link y guarda la academia aparte", () => {
    const i = item(base({ ingles: { pending: ["Inglés: leer vocabulario"], total: 1, url: pdf } }), "ingles");
    expect(i).toMatchObject({ href: pdf, external: true, materialUrl: pdf });
  });
  it("sin link el ítem sigue yendo a la academia", () => {
    const i = item(base({ ingles: { pending: ["x"], total: 1 } }), "ingles");
    expect(i?.href).toBe(ENGLISH_ACADEMY_URL);
    expect(i?.materialUrl).toBeUndefined();
  });
});
