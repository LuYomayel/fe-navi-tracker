"use client";

import { useNaviTrackerStore } from "@/store";
import { CheckSquare } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

export default function TasksWidget() {
  const { tasks, toggleTask } = useNaviTrackerStore();

  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter(
    (t) => t.dueDate === today || (!t.dueDate && !t.completed)
  );
  const completedCount = todayTasks.filter((t) => t.completed).length;

  // Show max 4 tasks
  const displayTasks = todayTasks.slice(0, 4);

  return (
    <div className="bg-card rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Tareas</h3>
        </div>
        <Link
          href="/tasks"
          className="text-xs text-primary hover:underline"
        >
          Ver todas
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl font-bold">
          {completedCount}/{todayTasks.length}
        </span>
        <span className="text-xs text-muted-foreground">completadas</span>
      </div>

      {displayTasks.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No hay tareas para hoy
        </p>
      ) : (
        <div className="space-y-2">
          {displayTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="h-3.5 w-3.5"
              />
              <span
                className={`text-xs truncate ${
                  task.completed
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {task.title}
              </span>
            </div>
          ))}
          {todayTasks.length > 4 && (
            <p className="text-[10px] text-muted-foreground">
              +{todayTasks.length - 4} mas...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
