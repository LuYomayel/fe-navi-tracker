"use client";

import { useEffect } from "react";
import { useNaviTrackerStore } from "@/store";
import { useInitializeStore } from "@/hooks/useInitializeStore";
import TaskList from "@/components/tasks/TaskList";
import { CheckSquare } from "lucide-react";

export default function TasksPage() {
  const { isLoading, isInitialized } = useInitializeStore();
  const fetchTasks = useNaviTrackerStore((s) => s.fetchTasks);

  useEffect(() => {
    if (isInitialized) {
      fetchTasks();
    }
  }, [isInitialized, fetchTasks]);

  if (isLoading || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <CheckSquare className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-xl font-bold">Tareas</h1>
          <p className="text-sm text-muted-foreground">
            Organiza y completa tus tareas diarias
          </p>
        </div>
      </div>

      <TaskList />
    </div>
  );
}
