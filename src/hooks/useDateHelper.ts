import { useMemo } from "react";

/**
 * Hook para manejar fechas con zona horaria local de forma consistente
 */
export function useDateHelper() {
  return useMemo(
    () => ({
      /**
       * Convierte una fecha a string YYYY-MM-DD usando zona horaria local
       */
      getLocalDateKey: (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      },

      /**
       * Obtiene la fecha de hoy en formato YYYY-MM-DD (zona local)
       */
      getTodayKey: (): string => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      },

      /**
       * Verifica si una fecha es hoy
       */
      isToday: (date: Date): boolean => {
        const today = new Date();
        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
      },

      /**
       * Obtiene el inicio de la semana para una fecha dada
       */
      getWeekStart: (date: Date): Date => {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
      },

      /**
       * Obtiene las fechas de una semana
       */
      getWeekDates: (date: Date): Date[] => {
        const week = [];
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());

        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          week.push(day);
        }
        return week;
      },

      /**
       * Formatea una fecha para mostrar en UI
       */
      formatDisplayDate: (date: Date): string => {
        return date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      },

      /**
       * Formatea una fecha corta para mostrar en UI
       */
      formatShortDate: (date: Date): string => {
        return date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
        });
      },
    }),
    []
  );
}
