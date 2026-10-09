import type { Milestone, Project, ProjectStatus } from "@/types";
import { toast } from "@/lib/toast-helper";
import { api } from "@/lib/api-client";
import type { StoreSet, StoreGet } from "../types";

export interface ProjectsSlice {
  /** Todos, incluidos los archivados (la UI decide que mostrar). */
  projects: Project[];
  projectsLoaded: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (data: {
    name: string;
    emoji?: string;
    color?: string;
    description?: string;
  }) => Promise<Project | null>;
  updateProject: (
    id: string,
    data: Partial<Pick<Project, "name" | "emoji" | "color" | "description" | "status">>,
  ) => Promise<boolean>;
  setProjectStatus: (id: string, status: ProjectStatus) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createMilestone: (
    projectId: string,
    data: { name: string; dueDate?: string },
  ) => Promise<Milestone | null>;
  updateMilestone: (
    id: string,
    data: { name?: string; dueDate?: string | null; done?: boolean },
  ) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
}

const STATUS_TOAST: Record<ProjectStatus, string> = {
  active: "reanudado",
  paused: "en pausa — sus tareas quedan ocultas",
  archived: "archivado",
};

function errMsg(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

export const createProjectsSlice = (
  set: StoreSet,
  get: StoreGet,
): ProjectsSlice => {
  // Los stats (hechas/total) dependen de las tareas: despues de tocar un
  // proyecto o hito se recargan proyectos y tareas juntos.
  const refresh = async () => {
    await Promise.all([get().fetchProjects(), get().fetchTasks()]);
  };

  return {
    projects: [],
    projectsLoaded: false,

    fetchProjects: async () => {
      try {
        const res = await api.projects.list(true);
        if (Array.isArray(res.data))
          set({ projects: res.data as Project[], projectsLoaded: true });
      } catch (e) {
        console.error("Error fetching projects:", e);
      }
    },

    createProject: async (data) => {
      try {
        const res = await api.projects.create(data);
        await get().fetchProjects();
        toast.success("Proyecto creado", data.name);
        return (res.data as Project) ?? null;
      } catch (e) {
        toast.error("Error", errMsg(e, "No se pudo crear el proyecto"));
        return null;
      }
    },

    updateProject: async (id, data) => {
      try {
        await api.projects.update(id, data);
        await refresh();
        return true;
      } catch (e) {
        toast.error("Error", errMsg(e, "No se pudo guardar el proyecto"));
        return false;
      }
    },

    setProjectStatus: async (id, status) => {
      const prev = get().projects;
      const p = prev.find((x) => x.id === id);
      set({
        projects: prev.map((x) => (x.id === id ? { ...x, status } : x)),
        // Las tareas traen el estado de su proyecto: actualizarlo ya para
        // que la lista las esconda/muestre sin esperar al back.
        tasks: get().tasks.map((t) =>
          t.projectId === id ? { ...t, projectStatus: status } : t,
        ),
      });
      try {
        await api.projects.update(id, { status });
        if (p) toast.success(`${p.name} ${STATUS_TOAST[status]}`);
      } catch (e) {
        set({ projects: prev });
        await get().fetchTasks();
        toast.error("Error", errMsg(e, "No se pudo cambiar el estado"));
      }
    },

    deleteProject: async (id) => {
      try {
        await api.projects.delete(id);
        await refresh();
        toast.success("Proyecto eliminado", "Sus tareas quedaron sin proyecto");
      } catch (e) {
        toast.error("Error", errMsg(e, "No se pudo eliminar el proyecto"));
      }
    },

    createMilestone: async (projectId, data) => {
      try {
        const res = await api.projects.createMilestone(projectId, data);
        await get().fetchProjects();
        return (res.data as Milestone) ?? null;
      } catch (e) {
        toast.error("Error", errMsg(e, "No se pudo crear el hito"));
        return null;
      }
    },

    updateMilestone: async (id, data) => {
      try {
        await api.projects.updateMilestone(id, data);
        await refresh();
      } catch (e) {
        toast.error("Error", errMsg(e, "No se pudo guardar el hito"));
      }
    },

    deleteMilestone: async (id) => {
      try {
        await api.projects.deleteMilestone(id);
        await refresh();
        toast.success("Hito eliminado", "Sus tareas siguen en el proyecto");
      } catch (e) {
        toast.error("Error", errMsg(e, "No se pudo eliminar el hito"));
      }
    },
  };
};
