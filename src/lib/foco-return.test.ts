import { describe, expect, it } from "vitest";
import { showBackToFoco } from "./foco-return";

describe("showBackToFoco", () => {
  it("se muestra en otra pantalla si esta sesión pasó por /foco", () => {
    expect(showBackToFoco("/tasks", true)).toBe(true);
    expect(showBackToFoco("/salud", true)).toBe(true);
  });
  it("no se muestra estando en /foco", () => {
    expect(showBackToFoco("/foco", true)).toBe(false);
    expect(showBackToFoco("/foco/", true)).toBe(false);
  });
  it("no se muestra si nunca pasó por /foco", () => {
    expect(showBackToFoco("/tasks", false)).toBe(false);
  });
});
