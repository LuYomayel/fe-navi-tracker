import type { DayScore, MonthlyStats, WinStreak } from "@/types";
import { api } from "@/lib/api-client";
import type { StoreSet, StoreGet } from "../types";

// Module-level in-flight deduplication: prevent concurrent duplicate fetches
const inFlightDayScoreFetches = new Map<string, Promise<void>>();
let inFlightWinStreak: Promise<void> | null = null;

export interface DayScoreSlice {
  dayScores: DayScore[];
  dayScoresLoading: boolean;
  currentDayScore: DayScore | null;
  winStreak: WinStreak | null;
  monthlyStats: MonthlyStats | null;
  fetchDayScore: (date: string) => Promise<void>;
  fetchDayScoreRange: (from: string, to: string) => Promise<void>;
  fetchWinStreak: () => Promise<void>;
  fetchMonthlyStats: (month: string) => Promise<void>;
  recalculateDayScore: (date: string) => Promise<void>;
}

export const createDayScoreSlice = (set: StoreSet, _get: StoreGet): DayScoreSlice => ({
  dayScores: [],
  dayScoresLoading: false,
  currentDayScore: null,
  winStreak: null,
  monthlyStats: null,

  fetchDayScore: async (date) => {
    const key = `day-score-${date}`;
    // Return the in-flight promise if this date is already being fetched
    if (inFlightDayScoreFetches.has(key)) {
      return inFlightDayScoreFetches.get(key)!;
    }

    const promise = (async () => {
      try {
        const res = await api.dayScore.getByDate(date);
        if (res.data) set({ currentDayScore: res.data as DayScore });
      } catch (e) {
        console.error("Error fetching day score:", e);
      } finally {
        inFlightDayScoreFetches.delete(key);
      }
    })();

    inFlightDayScoreFetches.set(key, promise);
    return promise;
  },

  fetchDayScoreRange: async (from, to) => {
    set({ dayScoresLoading: true, dayScores: [] });
    try {
      const res = await api.dayScore.getRange(from, to);
      if (res.data) set({ dayScores: res.data as DayScore[] });
    } catch (e) {
      console.error("Error fetching day score range:", e);
      set({ dayScores: [] });
    }
    set({ dayScoresLoading: false });
  },

  fetchWinStreak: async () => {
    // Deduplicate concurrent win streak fetches
    if (inFlightWinStreak) return inFlightWinStreak;

    inFlightWinStreak = (async () => {
      try {
        const res = await api.dayScore.getWinStreak();
        if (res.data) set({ winStreak: res.data as WinStreak });
      } catch (e) {
        console.error("Error fetching win streak:", e);
      } finally {
        inFlightWinStreak = null;
      }
    })();

    return inFlightWinStreak;
  },

  fetchMonthlyStats: async (month) => {
    try {
      const res = await api.dayScore.getMonthlyStats(month);
      if (res.data)
        set({ monthlyStats: res.data as MonthlyStats });
    } catch (e) {
      console.error("Error fetching monthly stats:", e);
    }
  },

  recalculateDayScore: async (date) => {
    try {
      const res = await api.dayScore.recalculate(date);
      if (res.data) {
        const score = res.data as DayScore;
        set((state) => ({
          dayScores: state.dayScores.map((d) =>
            d.date === date ? score : d
          ),
          currentDayScore:
            state.currentDayScore?.date === date
              ? score
              : state.currentDayScore,
        }));
      }
    } catch (e) {
      console.error("Error recalculating day score:", e);
    }
  },
});
