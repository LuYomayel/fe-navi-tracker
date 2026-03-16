"use client";

import { useState, useMemo } from "react";
import { useNaviTrackerStore } from "@/store";
import { Task } from "@/types";
import TaskItem from "./TaskItem";
import AddTaskDialog from "./AddTaskDialog";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type FilterType = "today" | "week" | "all" | "overdue";

export default function TaskList() {
  const { tasks, createTask, updateTask, deleteTask, toggleTask } =
    useNaviTrackerStore();
  const [filter, setFilter] = useState<FilterType>("today");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const getWeekEnd = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? 0 : 7 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0];
  };

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Date filter
    if (filter === "today") {
      result = result.filter(
        (t) => t.dueDate === today || (!t.dueDate && !t.completed)
      );
    } else if (filter === "week") {
      const weekEnd = getWeekEnd();
      result = result.filter(
        (t) =>
          (t.dueDate && t.dueDate >= today && t.dueDate <= weekEnd) ||
          (!t.dueDate && !t.completed)
      );
    } else if (filter === "overdue") {
      result = result.filter(
        (t) => t.dueDate && t.dueDate < today && !t.completed
      );
    }

    // Status filter
    if (statusFilter === "pending") {
      result = result.filter((t) => !t.completed);
    } else if (statusFilter === "completed") {
      result = result.filter((t) => t.completed);
    }

    // Sort: incomplete first, then by priority, then by date
    const priorityOrder: Record<string, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    result.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const pA = priorityOrder[a.priority] ?? 2;
      const pB = priorityOrder[b.priority] ?? 2;
      if (pA !== pB) return pA - pB;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      return 0;
    });

    return result;
  }, [tasks, filter, statusFilter, today]);

  const todayTasks = tasks.filter(
    (t) => t.dueDate === today || (!t.dueDate && !t.completed)
  );
  const todayCompleted = todayTasks.filter((t) => t.completed).length;
  const todayProgress =
    todayTasks.length > 0
      ? Math.round((todayCompleted / todayTasks.length) * 100)
      : 0;

  const handleSave = async (data: Partial<Task>) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
    setEditingTask(null);
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "today", label: "Hoy" },
    { key: "week", label: "Semana" },
    { key: "all", label: "Todas" },
    { key: "overdue", label: "Vencidas" },
  ];

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progreso de hoy</span>
          <span className="text-sm text-muted-foreground">
            {todayCompleted}/{todayTasks.length} completadas
          </span>
        </div>
        <Progress value={todayProgress} className="h-2" />
      </div>

      {/* Filters + Add button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              setStatusFilter(
                statusFilter === "all"
                  ? "pending"
                  : statusFilter === "pending"
                    ? "completed"
                    : "all"
              )
            }
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditingTask(null);
              setShowAddDialog(true);
            }}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nueva
          </Button>
        </div>
      </div>

      {/* Status filter badge */}
      {statusFilter !== "all" && (
        <div className="flex">
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {statusFilter === "pending" ? "Pendientes" : "Completadas"}
            <button
              onClick={() => setStatusFilter("all")}
              className="ml-1 hover:text-primary/70"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">
              {filter === "today"
                ? "No hay tareas para hoy"
                : filter === "overdue"
                  ? "No hay tareas vencidas"
                  : "No hay tareas"}
            </p>
            <Button
              variant="link"
              className="mt-2"
              onClick={() => {
                setEditingTask(null);
                setShowAddDialog(true);
              }}
            >
              Crear una tarea
            </Button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onEdit={(t) => {
                setEditingTask(t);
                setShowAddDialog(true);
              }}
              onDelete={deleteTask}
            />
          ))
        )}
      </div>

      <AddTaskDialog
        isOpen={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          setEditingTask(null);
        }}
        onSave={handleSave}
        editingTask={editingTask}
      />
    </div>
  );
}
