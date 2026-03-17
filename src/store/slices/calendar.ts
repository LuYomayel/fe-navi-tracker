import type { CalendarEvent, GoogleCalendarStatus } from "@/types";
import { toast } from "@/lib/toast-helper";
import { api } from "@/lib/api-client";
import type { StoreSet, StoreGet } from "../types";

export interface CalendarSlice {
  calendarEvents: CalendarEvent[];
  calendarEventsLoading: boolean;
  fetchCalendarEvents: (from: string, to: string) => Promise<void>;
  createCalendarEvent: (data: Partial<CalendarEvent>) => Promise<void>;
  updateCalendarEvent: (
    id: string,
    data: Partial<CalendarEvent>
  ) => Promise<void>;
  deleteCalendarEvent: (id: string) => Promise<void>;
  googleCalendarStatus: GoogleCalendarStatus | null;
  fetchGoogleCalendarStatus: () => Promise<void>;
  connectGoogleCalendar: () => Promise<void>;
  disconnectGoogleCalendar: () => Promise<void>;
  syncGoogleCalendar: () => Promise<void>;
}

export const createCalendarSlice = (set: StoreSet, get: StoreGet): CalendarSlice => ({
  calendarEvents: [],
  calendarEventsLoading: false,

  fetchCalendarEvents: async (from, to) => {
    set({ calendarEventsLoading: true });
    try {
      const res = await api.calendar.getEvents(from, to);
      if (res.data)
        set({ calendarEvents: res.data as CalendarEvent[] });
    } catch (e) {
      console.error("Error fetching calendar events:", e);
    }
    set({ calendarEventsLoading: false });
  },

  createCalendarEvent: async (data) => {
    try {
      const res = await api.calendar.createEvent(data);
      if (res.data) {
        set((state) => ({
          calendarEvents: [
            ...state.calendarEvents,
            res.data as CalendarEvent,
          ],
        }));
        toast.success("Evento creado");
      }
    } catch {
      toast.error("Error", "No se pudo crear el evento");
    }
  },

  updateCalendarEvent: async (id, data) => {
    try {
      const res = await api.calendar.updateEvent(id, data);
      if (res.data) {
        set((state) => ({
          calendarEvents: state.calendarEvents.map((e) =>
            e.id === id ? (res.data as CalendarEvent) : e
          ),
        }));
      }
    } catch {
      toast.error("Error", "No se pudo actualizar el evento");
    }
  },

  deleteCalendarEvent: async (id) => {
    try {
      await api.calendar.deleteEvent(id);
      set((state) => ({
        calendarEvents: state.calendarEvents.filter((e) => e.id !== id),
      }));
      toast.success("Evento eliminado");
    } catch {
      toast.error("Error", "No se pudo eliminar el evento");
    }
  },

  googleCalendarStatus: null,

  fetchGoogleCalendarStatus: async () => {
    try {
      const res = await api.calendar.google.getStatus();
      if (res.data)
        set({
          googleCalendarStatus: res.data as GoogleCalendarStatus,
        });
    } catch (e) {
      console.error("Error fetching Google Calendar status:", e);
    }
  },

  connectGoogleCalendar: async () => {
    try {
      const res = await api.calendar.google.getAuthUrl();
      if (res.data?.url) window.location.href = res.data.url;
    } catch {
      toast.error("Error", "No se pudo conectar con Google Calendar");
    }
  },

  disconnectGoogleCalendar: async () => {
    try {
      await api.calendar.google.disconnect();
      set({ googleCalendarStatus: { connected: false, syncEnabled: false } });
      toast.success("Google Calendar desconectado");
    } catch {
      toast.error("Error", "No se pudo desconectar Google Calendar");
    }
  },

  syncGoogleCalendar: async () => {
    try {
      await api.calendar.google.sync();
      toast.success("Google Calendar sincronizado");
      const today = new Date().toISOString().split("T")[0];
      const thirtyDaysLater = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0];
      get().fetchCalendarEvents(today, thirtyDaysLater);
    } catch {
      toast.error("Error", "No se pudo sincronizar Google Calendar");
    }
  },
});
