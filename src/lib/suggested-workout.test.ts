import { describe, expect, it } from "vitest";
import { quickWorkoutFor, suggestedWorkout, workoutReminders } from "./suggested-workout";

describe("suggestedWorkout", () => {
  it("lunes y jueves sugiere calistenia", () => {
    expect(suggestedWorkout(1).name).toBe("Calistenia");
    expect(suggestedWorkout(4).name).toBe("Calistenia");
  });
  it("el resto de los días sugiere un entrenamiento genérico de 60 min", () => {
    for (const d of [0, 2, 3, 5, 6]) {
      expect(suggestedWorkout(d)).toEqual({ name: "Entrenamiento", minutes: 60, kcalPerHour: 400 });
    }
  });
  it("ya no sugiere handball ningún día (suspendido hasta 2027)", () => {
    for (let d = 0; d < 7; d++) expect(suggestedWorkout(d).name).not.toBe("Handball");
  });
});

describe("workoutReminders", () => {
  it("avisa sólo los días de calistenia (lunes y jueves) a las 09:15, en formato Capacitor (1 = domingo)", () => {
    expect(workoutReminders()).toEqual([
      { weekday: 2, hour: 9, minute: 15 },
      { weekday: 5, hour: 9, minute: 15 },
    ]);
  });
});

describe("quickWorkoutFor", () => {
  it("arma el registro rápido del día: calistenia un jueves, genérico un viernes", () => {
    expect(quickWorkoutFor("2026-11-12")).toEqual({
      exerciseMinutes: 60,
      activeEnergyKcal: 400,
      context: "Calistenia (calorías estimadas)",
    });
    expect(quickWorkoutFor("2026-11-13").context).toBe("Entrenamiento (calorías estimadas)");
  });
});
