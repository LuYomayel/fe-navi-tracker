"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useNaviTrackerStore } from "@/store";
import { useInitializeStore } from "@/hooks/useInitializeStore";
import ProjectsOverview from "@/components/projects/ProjectsOverview";
import ProjectDetail from "@/components/projects/ProjectDetail";

/**
 * /proyectos        -> lista de proyectos
 * /proyectos?id=xyz -> un proyecto con sus hitos y tareas
 * (query param y no ruta dinamica: la app movil es un export estatico)
 */
export default function ProyectosPage() {
  return (
    <Suspense fallback={null}>
      <ProyectosInner />
    </Suspense>
  );
}

function ProyectosInner() {
  const id = useSearchParams().get("id");
  const { isLoading, isInitialized } = useInitializeStore();
  const fetchTasks = useNaviTrackerStore((s) => s.fetchTasks);
  const fetchProjects = useNaviTrackerStore((s) => s.fetchProjects);

  useEffect(() => {
    if (isInitialized) {
      fetchTasks();
      fetchProjects();
    }
  }, [isInitialized, fetchTasks, fetchProjects]);

  if (isLoading || !isInitialized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {id ? <ProjectDetail projectId={id} /> : <ProjectsOverview />}
    </div>
  );
}
