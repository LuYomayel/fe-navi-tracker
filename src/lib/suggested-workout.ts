// Entrenamiento que /hoy ofrece registrar con 1 tap, según la rutina.
// Calistenia lunes y jueves. Handball quedó afuera: suspendido hasta 2027.

export interface SuggestedWorkout {
  name: string;
  minutes: number;
  kcalPerHour: number;
}

const CALISTENIA_DAYS = [1, 4]; // getDay(): 1 = lunes, 4 = jueves

export function suggestedWorkout(weekday: number): SuggestedWorkout {
  return CALISTENIA_DAYS.includes(weekday)
    ? { name: "Calistenia", minutes: 60, kcalPerHour: 400 }
    : { name: "Entrenamiento", minutes: 60, kcalPerHour: 400 };
}

/** Recordatorio "Entrenaste hoy?" del celu: días de calistenia, después de entrenar. */
export function workoutReminders(): { weekday: number; hour: number; minute: number }[] {
  // Capacitor usa 1 = domingo … 7 = sábado
  return CALISTENIA_DAYS.map((d) => ({ weekday: d + 1, hour: 9, minute: 15 }));
}

/** Payload del registro rápido para una fecha YYYY-MM-DD. */
export function quickWorkoutFor(date: string): {
  exerciseMinutes: number;
  activeEnergyKcal: number;
  context: string;
} {
  const w = suggestedWorkout(new Date(`${date}T12:00:00`).getDay());
  return {
    exerciseMinutes: w.minutes,
    activeEnergyKcal: Math.round((w.kcalPerHour * w.minutes) / 60),
    context: `${w.name} (calorías estimadas)`,
  };
}
