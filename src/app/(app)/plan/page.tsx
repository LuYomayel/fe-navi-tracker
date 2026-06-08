"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNaviTrackerStore } from "@/store";
import { useInitializeStore } from "@/hooks/useInitializeStore";
import { getDateKey } from "@/lib/utils";

import { PageHeader } from "@/components/ui/page-header";
import { PillToggle } from "@/components/ui/pill-toggle";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

import TaskList from "@/components/tasks/TaskList";
import ShoppingListCard from "@/components/shopping/ShoppingListCard";
import ShoppingListDetail from "@/components/shopping/ShoppingListDetail";
import CreateListDialog from "@/components/shopping/CreateListDialog";
import GenerateListDialog from "@/components/shopping/GenerateListDialog";
import DailyAgenda from "@/components/agenda/DailyAgenda";
import MonthlyCalendar from "@/components/calendar/MonthlyCalendar";
import WinStreakWidget from "@/components/calendar/WinStreakWidget";
import GoogleCalendarSync from "@/components/calendar/GoogleCalendarSync";

import {
  CalendarCheck,
  ListChecks,
  ShoppingCart,
  Calendar as CalendarIcon,
  Plus,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

type Tab = "tareas" | "compras" | "calendario";
type CalView = "dia" | "mes";

const TAB_OPTIONS = [
  { value: "tareas" as const, label: "Tareas", icon: ListChecks },
  { value: "compras" as const, label: "Compras", icon: ShoppingCart },
  { value: "calendario" as const, label: "Calendario", icon: CalendarIcon },
];

const CAL_OPTIONS = [
  { value: "dia" as const, label: "Día", icon: CalendarCheck },
  { value: "mes" as const, label: "Mes", icon: CalendarIcon },
];

export default function PlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, isInitialized } = useInitializeStore();

  const tabParam = searchParams.get("tab");
  const initialTab: Tab =
    tabParam === "compras" || tabParam === "calendario" ? tabParam : "tareas";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [calView, setCalView] = useState<CalView>("mes");

  const handleTabChange = (next: Tab) => {
    setTab(next);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("tab", next);
    router.replace(`/plan?${params.toString()}`, { scroll: false });
  };

  // Header metric: tareas de hoy completadas / total
  const tasks = useNaviTrackerStore((s) => s.tasks);
  const today = getDateKey(new Date());
  const { doneToday, totalToday } = useMemo(() => {
    const todayTasks = tasks.filter(
      (t) => t.dueDate === today || (!t.dueDate && !t.completed)
    );
    return {
      doneToday: todayTasks.filter((t) => t.completed).length,
      totalToday: todayTasks.length,
    };
  }, [tasks, today]);

  if (isLoading || !isInitialized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon={CalendarCheck}
        title="Plan"
        subtitle="Tareas, compras y calendario en un solo lugar"
        metric={
          <span className="font-mono tabular-nums">
            {doneToday}/{totalToday}
          </span>
        }
        metricLabel="tareas hoy"
      />

      <PillToggle
        fullWidth
        options={TAB_OPTIONS}
        value={tab}
        onChange={handleTabChange}
        aria-label="Sección del plan"
      />

      {tab === "tareas" && <TaskList />}

      {tab === "compras" && <ComprasSection />}

      {tab === "calendario" && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <PillToggle
              options={CAL_OPTIONS}
              value={calView}
              onChange={setCalView}
              aria-label="Vista del calendario"
            />
          </div>
          {calView === "dia" ? (
            <DailyAgenda />
          ) : (
            <div className="space-y-4">
              <WinStreakWidget />
              <MonthlyCalendar />
              <GoogleCalendarSync />
            </div>
          )}
        </div>
      )}

      <div className="h-2" />
    </div>
  );
}

/** Sección de compras: reusa la lógica de la página /shopping (listas + detalle). */
function ComprasSection() {
  const {
    shoppingLists,
    activeShoppingList,
    shoppingListLoading,
    fetchShoppingLists,
    fetchShoppingListById,
  } = useNaviTrackerStore();

  const [showCreate, setShowCreate] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchShoppingLists();
  }, [fetchShoppingLists]);

  useEffect(() => {
    if (selectedId) {
      fetchShoppingListById(selectedId);
    }
  }, [selectedId, fetchShoppingListById]);

  // Vista detalle
  if (selectedId && activeShoppingList) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button
          onClick={() => {
            setSelectedId(null);
            useNaviTrackerStore.setState({ activeShoppingList: null });
          }}
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a listas
        </button>
        <ShoppingListDetail />
      </div>
    );
  }

  const activeLists = shoppingLists.filter((l) => l.status === "active");
  const archivedLists = shoppingLists.filter((l) => l.status === "archived");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Nueva lista
        </Button>
        <Button size="sm" onClick={() => setShowGenerate(true)}>
          <Sparkles className="mr-1.5 h-4 w-4" />
          Generar desde Meal Prep
        </Button>
      </div>

      {activeLists.length === 0 && !shoppingListLoading && (
        <EmptyState
          icon={ShoppingCart}
          title="Sin listas de compras"
          description="Crea una lista nueva o generala desde tu meal prep activo."
        />
      )}

      <div className="space-y-2">
        {activeLists.map((list) => (
          <ShoppingListCard
            key={list.id}
            list={list}
            onSelect={() => setSelectedId(list.id)}
          />
        ))}
      </div>

      {archivedLists.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">
            Archivadas ({archivedLists.length})
          </h3>
          <div className="space-y-2 opacity-60">
            {archivedLists.map((list) => (
              <ShoppingListCard
                key={list.id}
                list={list}
                onSelect={() => setSelectedId(list.id)}
              />
            ))}
          </div>
        </div>
      )}

      <CreateListDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={(id) => setSelectedId(id)}
      />
      <GenerateListDialog
        open={showGenerate}
        onOpenChange={setShowGenerate}
        onGenerated={(id) => setSelectedId(id)}
      />
    </div>
  );
}
