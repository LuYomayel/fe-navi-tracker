import type { ActivitiesSlice } from "./slices/activities";
import type { NotesSlice } from "./slices/notes";
import type { NutritionSlice } from "./slices/nutrition";
import type { ChatSlice } from "./slices/chat";
import type { TasksSlice } from "./slices/tasks";
import type { CalendarSlice } from "./slices/calendar";
import type { DayScoreSlice } from "./slices/day-score";
import type { HydrationSlice } from "./slices/hydration";
import type { ShoppingSlice } from "./slices/shopping";
import type { UISlice } from "./slices/ui";

export type NaviTrackerState = ActivitiesSlice &
  NotesSlice &
  NutritionSlice &
  ChatSlice &
  TasksSlice &
  CalendarSlice &
  DayScoreSlice &
  HydrationSlice &
  ShoppingSlice &
  UISlice;

export type StoreSet = {
  (
    partial:
      | NaviTrackerState
      | Partial<NaviTrackerState>
      | ((state: NaviTrackerState) => NaviTrackerState | Partial<NaviTrackerState>),
    replace?: false
  ): void;
  (
    state: NaviTrackerState | ((state: NaviTrackerState) => NaviTrackerState),
    replace: true
  ): void;
};

export type StoreGet = () => NaviTrackerState;
