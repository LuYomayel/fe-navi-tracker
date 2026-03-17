import type { Task } from "@/types";
import { toast } from "@/lib/toast-helper";
import { api } from "@/lib/api-client";
import type { StoreSet, StoreGet } from "../types";

export interface TasksSlice {
  tasks: Task[];
  tasksLoading: boolean;
  fetchTasks: (params?: {
    date?: string;
    status?: string;
    category?: string;
    from?: string;
    to?: string;
  }) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  reorderTasks: (taskIds: string[]) => Promise<void>;
}

export const createTasksSlice = (set: StoreSet, get: StoreGet): TasksSlice => ({
  tasks: [],
  tasksLoading: false,

  fetchTasks: async (params) => {
    set({ tasksLoading: true });
    try {
      const res = await api.tasks.getAll(params);
      if (res.data) set({ tasks: res.data as Task[] });
    } catch (e) {
      console.error("Error fetching tasks:", e);
    }
    set({ tasksLoading: false });
  },

  createTask: async (data) => {
    try {
      const res = await api.tasks.create(data);
      if (res.data) {
        set((state) => ({
          tasks: [...state.tasks, res.data as Task],
        }));
        toast.success("Tarea creada", data.title || "Nueva tarea");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo crear la tarea";
      toast.error("Error", msg);
    }
  },

  updateTask: async (id, data) => {
    try {
      const res = await api.tasks.update(id, data);
      if (res.data) {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? (res.data as Task) : t
          ),
        }));
      }
    } catch {
      toast.error("Error", "No se pudo actualizar la tarea");
    }
  },

  deleteTask: async (id) => {
    try {
      await api.tasks.delete(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }));
      toast.success("Tarea eliminada");
    } catch {
      toast.error("Error", "No se pudo eliminar la tarea");
    }
  },

  toggleTask: async (id) => {
    const prevTasks = get().tasks;
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              status: (!t.completed ? "completed" : "pending") as Task["status"],
            }
          : t
      ),
    }));
    try {
      const res = await api.tasks.toggle(id);
      if (res.data) {
        const task = res.data as Task;
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? task : t)),
        }));
        if (task.completed) {
          toast.success("Tarea completada! +XP");
          window.dispatchEvent(new CustomEvent("xp-updated"));
        }
      }
    } catch {
      set({ tasks: prevTasks });
    }
  },

  reorderTasks: async (taskIds) => {
    const prevTasks = get().tasks;
    set((state) => {
      const taskMap = new Map(state.tasks.map((t) => [t.id, t]));
      const reordered = taskIds
        .map((id, index) => {
          const task = taskMap.get(id);
          return task ? { ...task, order: index } : null;
        })
        .filter(Boolean) as Task[];
      const others = state.tasks.filter((t) => !taskIds.includes(t.id));
      return { tasks: [...reordered, ...others] };
    });
    try {
      await api.tasks.reorder(taskIds);
    } catch (e) {
      console.error("Error reordering tasks:", e);
      set({ tasks: prevTasks });
    }
  },
});
