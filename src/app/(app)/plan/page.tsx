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
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { ActionIconButton } from "@/components/ui/action-icon-button";

import TaskList from "@/components/tasks/TaskList";
import ShoppingListCard from "@/components/shopping/ShoppingListCard";
import ShoppingListDetail from "@/components/shopping/ShoppingListDetail";
import CreateListDialog from "@/components/shopping/CreateListDialog";
import GenerateListDialog from "@/components/shopping/GenerateListDialog";
import DailyAgenda from "@/components/agenda/DailyAgenda";
import GastosSection from "@/components/expenses/GastosSection";
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
  StickyNote,
  Pencil,
  Trash2,
  Wallet,
} from "lucide-react";

type Tab = "tareas" | "compras" | "calendario" | "notas" | "gastos";
type CalView = "dia" | "mes";

const TAB_OPTIONS = [
  { value: "tareas" as const, label: "Tareas", icon: ListChecks },
  { value: "gastos" as const, label: "Gastos", icon: Wallet },
  { value: "compras" as const, label: "Compras", icon: ShoppingCart },
  { value: "calendario" as const, label: "Calendario", icon: CalendarIcon },
  { value: "notas" as const, label: "Notas", icon: StickyNote },
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
    tabParam === "compras" ||
    tabParam === "calendario" ||
    tabParam === "notas" ||
    tabParam === "gastos"
      ? tabParam
      : "tareas";

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

      {tab === "notas" && <NotasSection />}

      {tab === "gastos" && <GastosSection />}

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

/**
 * Sección de notas: muestra TODAS las notas (incluidas las creadas por voz
 * via MCP con crear_nota) con alta, edición y borrado. Antes no se veían en
 * ningún lado de la UI.
 */
function NotasSection() {
  const { dailyNotes, createNote, updateNoteById, deleteNoteById } =
    useNaviTrackerStore();
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const confirmDelete = useConfirm<{ id: string; content: string }>();

  const sorted = useMemo(
    () =>
      [...dailyNotes].sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        const ca = new Date(a.createdAt || a.date).getTime();
        const cb = new Date(b.createdAt || b.date).getTime();
        return cb - ca;
      }),
    [dailyNotes]
  );

  const dateLabel = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const moodEmoji = (mood?: number) =>
    mood && mood !== 3 ? ["", "😞", "😕", "", "🙂", "😄"][mood] || "" : "";

  const handleCreate = async () => {
    const content = draft.trim();
    if (!content) return;
    setSaving(true);
    await createNote(content);
    setDraft("");
    setSaving(false);
  };

  const startEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditDraft(content);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const content = editDraft.trim();
    if (!content) return;
    await updateNoteById(editingId, content);
    setEditingId(null);
    setEditDraft("");
  };

  const handleDelete = async (id: string, content: string) => {
    const ok = await confirmDelete.confirm({ id, content });
    if (ok) deleteNoteById(id);
  };

  let lastDate = "";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-2 rounded-lg border bg-card p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Anotá una idea, una decisión, algo para no olvidar…"
          rows={3}
          className="w-full resize-none rounded-md border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={handleCreate} disabled={saving || !draft.trim()}>
            <Plus className="mr-1.5 h-4 w-4" />
            Guardar nota
          </Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title="Sin notas todavía"
          description="Las notas que crees acá o por voz (via Claude) van a aparecer en esta lista."
        />
      ) : (
        <div className="space-y-2">
          {sorted.map((n) => {
            const showDate = n.date !== lastDate;
            lastDate = n.date;
            return (
              <div key={n.id}>
                {showDate && (
                  <div className="mb-1.5 mt-3 text-xs font-semibold capitalize text-muted-foreground first:mt-0">
                    {dateLabel(n.date)}
                  </div>
                )}
                <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
                  <div className="min-w-0 flex-1">
                    {editingId === n.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          rows={3}
                          className="w-full resize-none rounded-md border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingId(null)}
                          >
                            Cancelar
                          </Button>
                          <Button size="sm" onClick={handleUpdate}>
                            Guardar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {moodEmoji(n.mood) && (
                          <span className="mr-1">{moodEmoji(n.mood)}</span>
                        )}
                        {n.content}
                      </p>
                    )}
                  </div>
                  {editingId !== n.id && (
                    <div className="flex shrink-0 items-center gap-0.5">
                      <ActionIconButton
                        icon={Pencil}
                        onClick={() => startEdit(n.id, n.content)}
                        aria-label="Editar nota"
                      />
                      <ActionIconButton
                        icon={Trash2}
                        variant="destructive"
                        onClick={() => handleDelete(n.id, n.content)}
                        aria-label="Borrar nota"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={confirmDelete.onOpenChange}
        onConfirm={confirmDelete.onConfirm}
        title={`¿Borrar la nota "${(confirmDelete.payload?.content || "").slice(
          0,
          60
        )}…"?`}
        confirmLabel="Borrar"
        destructive
      />
    </div>
  );
}
