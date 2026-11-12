// Entrenamiento que /hoy ofrece registrar con 1 tap, según la rutina:
// calistenia lunes, miércoles y viernes; piernas martes y jueves.
// Handball quedó afuera: suspendido hasta 2027.

export interface SuggestedWorkout {
  name: string;
  minutes: number;
  kcalPerHour: number;
}

// getDay(): 0 = domingo … 6 = sábado
const CALISTENIA_DAYS = [1, 3, 5];
const PIERNAS_DAYS = [2, 4];

export function suggestedWorkout(weekday: number): SuggestedWorkout {
  const name = CALISTENIA_DAYS.includes(weekday)
    ? "Calistenia"
    : PIERNAS_DAYS.includes(weekday)
      ? "Piernas"
      : "Entrenamiento";
  return { name, minutes: 60, kcalPerHour: 400 };
}

/** Recordatorio "Entrenaste hoy?" del celu: días de entrenamiento, después de entrenar. */
export function workoutReminders(): { weekday: number; hour: number; minute: number }[] {
  // Capacitor usa 1 = domingo … 7 = sábado
  return [...CALISTENIA_DAYS, ...PIERNAS_DAYS]
    .sort((a, b) => a - b)
    .map((d) => ({ weekday: d + 1, hour: 9, minute: 15 }));
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
