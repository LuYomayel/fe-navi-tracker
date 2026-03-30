import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createActivitiesSlice } from "./slices/activities";
import { createNotesSlice } from "./slices/notes";
import { createNutritionSlice } from "./slices/nutrition";
import { createChatSlice } from "./slices/chat";
import { createTasksSlice } from "./slices/tasks";
import { createCalendarSlice } from "./slices/calendar";
import { createDayScoreSlice } from "./slices/day-score";
import { createHydrationSlice } from "./slices/hydration";
import { createShoppingSlice } from "./slices/shopping";
import { createUISlice } from "./slices/ui";
import { createXpSlice } from "./slices/xp";

import type { NaviTrackerState } from "./types";
export type { NaviTrackerState } from "./types";

export const useNaviTrackerStore = create<NaviTrackerState>()(
  persist(
    (set, get) => ({
      ...createActivitiesSlice(set, get),
      ...createNotesSlice(set, get),
      ...createNutritionSlice(set, get),
      ...createChatSlice(set, get),
      ...createTasksSlice(set, get),
      ...createCalendarSlice(set, get),
      ...createDayScoreSlice(set, get),
      ...createHydrationSlice(set, get),
      ...createShoppingSlice(set, get),
      ...createUISlice(set, get),
      ...createXpSlice(set, get),
    }),
    {
      name: "navi-preferences",
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
);
