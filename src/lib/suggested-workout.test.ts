import { describe, expect, it } from "vitest";
import { quickWorkoutFor, suggestedWorkout, workoutReminders } from "./suggested-workout";

describe("suggestedWorkout", () => {
  it("lunes, miércoles y viernes sugiere calistenia", () => {
    for (const d of [1, 3, 5]) expect(suggestedWorkout(d).name).toBe("Calistenia");
  });
  it("martes y jueves sugiere piernas", () => {
    for (const d of [2, 4]) expect(suggestedWorkout(d).name).toBe("Piernas");
  });
  it("el finde sugiere un entrenamiento genérico de 60 min", () => {
    for (const d of [0, 6]) {
      expect(suggestedWorkout(d)).toEqual({ name: "Entrenamiento", minutes: 60, kcalPerHour: 400 });
    }
  });
  it("ya no sugiere handball ningún día (suspendido hasta 2027)", () => {
    for (let d = 0; d < 7; d++) expect(suggestedWorkout(d).name).not.toBe("Handball");
  });
});

describe("workoutReminders", () => {
  it("avisa de lunes a viernes a las 09:15, en formato Capacitor (1 = domingo)", () => {
    expect(workoutReminders()).toEqual(
      [2, 3, 4, 5, 6].map((weekday) => ({ weekday, hour: 9, minute: 15 }))
    );
  });
});

describe("quickWorkoutFor", () => {
  it("arma el registro rápido del día: piernas un jueves, calistenia un viernes", () => {
    expect(quickWorkoutFor("2026-11-12")).toEqual({
      exerciseMinutes: 60,
      activeEnergyKcal: 400,
      context: "Piernas (calorías estimadas)",
    });
    expect(quickWorkoutFor("2026-11-13").context).toBe("Calistenia (calorías estimadas)");
  });
});
