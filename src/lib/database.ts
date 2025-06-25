import { prisma } from "./prisma";
import type {
  Activity,
  DailyCompletion,
  DailyNote,
  UserPreferences,
  NutritionAnalysis,
  BodyAnalysis,
  AISuggestion,
  CommentAnalysis,
  PredefinedComment,
} from "@/types";
import { generateId } from "./utils";

// Funciones para trabajar con Activities
export const activityService = {
  async getAll(): Promise<Activity[]> {
    try {
      const activities = await prisma.activity.findMany({
        orderBy: { createdAt: "asc" },
      });

      return activities.map((activity: any) => ({
        ...activity,
        days: activity.days as boolean[],
        description: activity.description || undefined,
        time: activity.time || undefined,
        category: activity.category || undefined,
      }));
    } catch (error) {
      console.error("Error fetching activities:", error);
      return [];
    }
  },

  async create(
    data: Omit<Activity, "id" | "createdAt" | "updatedAt">
  ): Promise<Activity> {
    try {
      const activity = await prisma.activity.create({
        data: {
          ...data,
          days: data.days,
        },
      });

      return {
        ...activity,
        days: activity.days as boolean[],
        description: activity.description || undefined,
        time: activity.time || undefined,
        category: activity.category || undefined,
      };
    } catch (error) {
      console.error("Error creating activity:", error);
      // Fallback to memory
      return {
        ...data,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  },

  async update(id: string, data: Partial<Activity>): Promise<Activity | null> {
    try {
      const activity = await prisma.activity.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return {
        ...activity,
        days: activity.days as boolean[],
        description: activity.description || undefined,
        time: activity.time || undefined,
        category: activity.category || undefined,
      };
    } catch (error) {
      console.error("Error updating activity:", error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.activity.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error("Error deleting activity:", error);
      return false;
    }
  },
};

// Funciones para trabajar con Completions
export const completionService = {
  async getAll(): Promise<DailyCompletion[]> {
    try {
      return await prisma.dailyCompletion.findMany({
        orderBy: { date: "desc" },
      });
    } catch (error) {
      console.error("Error fetching completions:", error);
      return [];
    }
  },

  async toggle(activityId: string, date: string): Promise<DailyCompletion> {
    try {
      const existing = await prisma.dailyCompletion.findUnique({
        where: {
          activityId_date: {
            activityId,
            date,
          },
        },
      });

      if (existing) {
        const updated = await prisma.dailyCompletion.update({
          where: { id: existing.id },
          data: { completed: !existing.completed },
        });
        return updated;
      } else {
        const created = await prisma.dailyCompletion.create({
          data: {
            activityId,
            date,
            completed: true,
          },
        });
        return created;
      }
    } catch (error) {
      console.error("Error toggling completion:", error);
      // Fallback
      return {
        id: generateId(),
        activityId,
        date,
        completed: true,
        notes: undefined,
        createdAt: new Date(),
      };
    }
  },

  async getForActivity(
    activityId: string,
    startDate: string,
    endDate: string
  ): Promise<DailyCompletion[]> {
    try {
      return await prisma.dailyCompletion.findMany({
        where: {
          activityId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching activity completions:", error);
      return [];
    }
  },
};

// Funciones para trabajar con Notes
export const noteService = {
  async get(date: string): Promise<DailyNote | null> {
    try {
      return await prisma.dailyNote.findUnique({
        where: { date },
      });
    } catch (error) {
      console.error("Error fetching note:", error);
      return null;
    }
  },

  async upsert(
    date: string,
    content: string,
    mood?: number
  ): Promise<DailyNote> {
    try {
      return await prisma.dailyNote.upsert({
        where: { date },
        update: {
          content,
          mood,
          updatedAt: new Date(),
        },
        create: {
          date,
          content,
          mood,
        },
      });
    } catch (error) {
      console.error("Error upserting note:", error);
      // Fallback
      return {
        id: generateId(),
        date,
        content,
        mood: mood || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  },

  async delete(date: string): Promise<boolean> {
    try {
      await prisma.dailyNote.delete({
        where: { date },
      });
      return true;
    } catch (error) {
      console.error("Error deleting note:", error);
      return false;
    }
  },
};

// Funciones para trabajar con Preferences
export const preferencesService = {
  async get(): Promise<UserPreferences> {
    try {
      const prefs = await prisma.userPreferences.findFirst({
        where: { userId: "default" },
      });

      if (!prefs) {
        return await this.create({
          darkMode: false,
          weekStartsOnMonday: true,
          notifications: true,
          language: "es",
        });
      }

      return {
        darkMode: prefs.darkMode,
        weekStartsOnMonday: prefs.weekStartsOnMonday,
        notifications: prefs.notifications,
        language: prefs.language as "es" | "en",
      };
    } catch (error) {
      console.error("Error fetching preferences:", error);
      // Fallback
      return {
        darkMode: false,
        weekStartsOnMonday: true,
        notifications: true,
        language: "es",
      };
    }
  },

  async create(data: UserPreferences): Promise<UserPreferences> {
    try {
      const prefs = await prisma.userPreferences.create({
        data: {
          userId: "default",
          ...data,
        },
      });

      return {
        darkMode: prefs.darkMode,
        weekStartsOnMonday: prefs.weekStartsOnMonday,
        notifications: prefs.notifications,
        language: prefs.language as "es" | "en",
      };
    } catch (error) {
      console.error("Error creating preferences:", error);
      return data;
    }
  },

  async update(data: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const prefs = await prisma.userPreferences.upsert({
        where: { userId: "default" },
        update: data,
        create: {
          userId: "default",
          darkMode: data.darkMode ?? false,
          weekStartsOnMonday: data.weekStartsOnMonday ?? true,
          notifications: data.notifications ?? true,
          language: data.language ?? "es",
        },
      });

      return {
        darkMode: prefs.darkMode,
        weekStartsOnMonday: prefs.weekStartsOnMonday,
        notifications: prefs.notifications,
        language: prefs.language as "es" | "en",
      };
    } catch (error) {
      console.error("Error updating preferences:", error);
      return data as UserPreferences;
    }
  },
};

// Funciones para trabajar con Nutrition Analysis
export const nutritionService = {
  async getAll(): Promise<NutritionAnalysis[]> {
    try {
      const analyses = await prisma.nutritionAnalysis.findMany({
        orderBy: { createdAt: "desc" },
      });

      return analyses.map((analysis: any) => ({
        ...analysis,
        foods: analysis.foods as any,
        macronutrients: analysis.macronutrients as any,
        userAdjustments: analysis.userAdjustments as any,
      }));
    } catch (error) {
      console.error("Error fetching nutrition analyses:", error);
      return [];
    }
  },

  async getByDate(date: string): Promise<NutritionAnalysis[]> {
    try {
      const analyses = await prisma.nutritionAnalysis.findMany({
        where: { date },
        orderBy: { createdAt: "desc" },
      });

      return analyses.map((analysis: any) => ({
        ...analysis,
        foods: analysis.foods as any,
        macronutrients: analysis.macronutrients as any,
        userAdjustments: analysis.userAdjustments as any,
      }));
    } catch (error) {
      console.error("Error fetching nutrition analyses by date:", error);
      return [];
    }
  },

  async create(
    data: Omit<NutritionAnalysis, "id" | "createdAt" | "updatedAt">
  ): Promise<NutritionAnalysis> {
    try {
      const analysis = await prisma.nutritionAnalysis.create({
        data: {
          ...data,
          foods: data.foods as any,
          macronutrients: data.macronutrients as any,
          userAdjustments: data.userAdjustments as any,
        },
      });

      return {
        ...analysis,
        foods: analysis.foods as any,
        macronutrients: analysis.macronutrients as any,
        userAdjustments: analysis.userAdjustments as any,
      };
    } catch (error) {
      console.error("Error creating nutrition analysis:", error);
      return {
        ...data,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.nutritionAnalysis.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error("Error deleting nutrition analysis:", error);
      return false;
    }
  },
};

// Funciones para trabajar con Body Analysis
export const bodyAnalysisService = {
  async getAll(): Promise<BodyAnalysis[]> {
    try {
      const analyses = await prisma.bodyAnalysis.findMany({
        orderBy: { createdAt: "desc" },
      });

      return analyses.map((analysis: any) => ({
        id: analysis.id,
        bodyType: analysis.bodyType as any,
        measurements: analysis.measurements as any,
        recommendations: analysis.recommendations as any,
        confidence: analysis.aiConfidence,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      }));
    } catch (error) {
      console.error("Error fetching body analyses:", error);
      return [];
    }
  },

  async create(
    data: Omit<BodyAnalysis, "id" | "createdAt" | "updatedAt">
  ): Promise<BodyAnalysis> {
    try {
      const analysis = await prisma.bodyAnalysis.create({
        data: {
          bodyType: data.bodyType,
          measurements: data.measurements as any,
          recommendations: data.recommendations as any,
          aiConfidence: data.confidence || 0.5,
        },
      });

      return {
        bodyType: analysis.bodyType as any,
        measurements: analysis.measurements as any,
        recommendations: analysis.recommendations as any,
        confidence: analysis.aiConfidence,
        id: analysis.id,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      };
    } catch (error) {
      console.error("Error creating body analysis:", error);
      return {
        ...data,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  },

  async getLatest(): Promise<BodyAnalysis | null> {
    try {
      const analysis = await prisma.bodyAnalysis.findFirst({
        orderBy: { createdAt: "desc" },
      });

      if (!analysis) return null;

      return {
        id: analysis.id,
        bodyType: analysis.bodyType as any,
        measurements: analysis.measurements as any,
        recommendations: analysis.recommendations as any,
        confidence: analysis.aiConfidence,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      };
    } catch (error) {
      console.error("Error fetching latest body analysis:", error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.bodyAnalysis.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error("Error deleting body analysis:", error);
      return false;
    }
  },
};

// Funciones para trabajar con AI Suggestions
export const aiSuggestionService = {
  async getAll(): Promise<AISuggestion[]> {
    try {
      const suggestions = await prisma.aISuggestion.findMany({
        orderBy: { createdAt: "desc" },
      });

      return suggestions.map((suggestion: any) => ({
        ...suggestion,
        basedOn: suggestion.basedOn as string[],
        actions: suggestion.actions as any,
      }));
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      return [];
    }
  },

  async create(
    data: Omit<AISuggestion, "id" | "createdAt">
  ): Promise<AISuggestion> {
    try {
      const suggestion = await prisma.aISuggestion.create({
        data: {
          ...data,
          basedOn: data.basedOn as any,
          actions: data.actions as any,
        },
      });

      return {
        ...suggestion,
        basedOn: suggestion.basedOn as string[],
        actions: suggestion.actions as any,
      };
    } catch (error) {
      console.error("Error creating AI suggestion:", error);
      return {
        ...data,
        id: generateId(),
        createdAt: new Date(),
      };
    }
  },

  async dismiss(id: string): Promise<boolean> {
    try {
      await prisma.aISuggestion.update({
        where: { id },
        data: { dismissedAt: new Date() },
      });
      return true;
    } catch (error) {
      console.error("Error dismissing AI suggestion:", error);
      return false;
    }
  },

  async getActive(): Promise<AISuggestion[]> {
    try {
      const suggestions = await prisma.aISuggestion.findMany({
        where: { dismissedAt: null },
        orderBy: { createdAt: "desc" },
      });

      return suggestions.map((suggestion: any) => ({
        ...suggestion,
        basedOn: suggestion.basedOn as string[],
        actions: suggestion.actions as any,
      }));
    } catch (error) {
      console.error("Error fetching active AI suggestions:", error);
      return [];
    }
  },
};

// Funciones para trabajar con Chat Messages
export const chatService = {
  async getAll(): Promise<
    Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      timestamp: Date;
    }>
  > {
    try {
      const messages = await prisma.chatMessage.findMany({
        orderBy: { timestamp: "asc" },
      });

      return messages.map((message) => ({
        ...message,
        role: message.role as "user" | "assistant",
      }));
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      return [];
    }
  },

  async create(
    role: "user" | "assistant",
    content: string
  ): Promise<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }> {
    try {
      const message = await prisma.chatMessage.create({
        data: { role, content },
      });

      return {
        ...message,
        role: message.role as "user" | "assistant",
      };
    } catch (error) {
      console.error("Error creating chat message:", error);
      return {
        id: generateId(),
        role,
        content,
        timestamp: new Date(),
      };
    }
  },

  async clear(): Promise<boolean> {
    try {
      await prisma.chatMessage.deleteMany({});
      return true;
    } catch (error) {
      console.error("Error clearing chat messages:", error);
      return false;
    }
  },
};

// Funciones para trabajar con Comment Analysis
export const commentAnalysisService = {
  async getAll(): Promise<CommentAnalysis[]> {
    try {
      const analyses = await prisma.commentAnalysis.findMany({
        orderBy: { createdAt: "desc" },
      });

      return analyses.map((analysis: any) => ({
        ...analysis,
        selectedComments: analysis.selectedComments as PredefinedComment[],
        detectedPatterns: analysis.detectedPatterns as string[],
        suggestions: analysis.suggestions as AISuggestion[],
        moodTrend: analysis.moodTrend as any,
      }));
    } catch (error) {
      console.error("Error fetching comment analyses:", error);
      return [];
    }
  },

  async create(
    data: Omit<CommentAnalysis, "createdAt">
  ): Promise<CommentAnalysis> {
    try {
      const analysis = await prisma.commentAnalysis.create({
        data: {
          userId: "default",
          date: data.date,
          selectedComments: data.selectedComments as any,
          customComment: data.customComment,
          detectedPatterns: data.detectedPatterns as any,
          suggestions: data.suggestions as any,
          moodTrend: data.moodTrend as any,
        },
      });

      return {
        ...analysis,
        selectedComments: analysis.selectedComments as PredefinedComment[],
        detectedPatterns: analysis.detectedPatterns as string[],
        suggestions: analysis.suggestions as AISuggestion[],
        moodTrend: analysis.moodTrend as any,
        createdAt: analysis.createdAt,
      };
    } catch (error) {
      console.error("Error creating comment analysis:", error);
      return {
        ...data,
        createdAt: new Date(),
      };
    }
  },

  async getRecent(days: number = 7): Promise<CommentAnalysis[]> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - days);

      const analyses = await prisma.commentAnalysis.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return analyses.map((analysis: any) => ({
        ...analysis,
        selectedComments: analysis.selectedComments as PredefinedComment[],
        detectedPatterns: analysis.detectedPatterns as string[],
        suggestions: analysis.suggestions as AISuggestion[],
        moodTrend: analysis.moodTrend as any,
      }));
    } catch (error) {
      console.error("Error fetching recent comment analyses:", error);
      return [];
    }
  },
};
