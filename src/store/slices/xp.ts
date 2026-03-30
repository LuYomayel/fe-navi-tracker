import { api } from "@/lib/api-client";
import type { XpStats } from "@/types/xp";
import type { StoreSet, StoreGet } from "../types";

const XP_STATS_TTL = 30_000; // 30 seconds

// Module-level in-flight deduplication: only one fetch at a time
let pendingFetch: Promise<void> | null = null;

export interface XpSlice {
  xpStats: XpStats | null;
  xpStatsLastFetch: number | null;
  fetchXpStats: () => Promise<void>;
  invalidateXpStats: () => void;
}

export const createXpSlice = (set: StoreSet, get: StoreGet): XpSlice => ({
  xpStats: null,
  xpStatsLastFetch: null,

  fetchXpStats: async () => {
    const state = get();
    // Return cached data if still fresh
    if (
      state.xpStats &&
      state.xpStatsLastFetch &&
      Date.now() - state.xpStatsLastFetch < XP_STATS_TTL
    ) {
      return;
    }
    // Deduplicate concurrent calls: return the same in-flight promise
    if (pendingFetch) return pendingFetch;

    pendingFetch = (async () => {
      try {
        const res = await api.xp.getStats();
        if (res.data) {
          set({ xpStats: res.data as XpStats, xpStatsLastFetch: Date.now() });
        }
      } catch (e) {
        console.error("Error fetching XP stats:", e);
      } finally {
        pendingFetch = null;
      }
    })();

    return pendingFetch;
  },

  invalidateXpStats: () => {
    set({ xpStatsLastFetch: null });
  },
});
