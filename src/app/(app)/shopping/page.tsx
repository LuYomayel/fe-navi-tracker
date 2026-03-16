"use client";

import { useEffect, useState } from "react";
import { useNaviTrackerStore } from "@/store";
import ShoppingListCard from "@/components/shopping/ShoppingListCard";
import ShoppingListDetail from "@/components/shopping/ShoppingListDetail";
import CreateListDialog from "@/components/shopping/CreateListDialog";
import GenerateListDialog from "@/components/shopping/GenerateListDialog";
import { Plus, Sparkles, ArrowLeft } from "lucide-react";

export default function ShoppingPage() {
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

  // Detail view
  if (selectedId && activeShoppingList) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button
          onClick={() => {
            setSelectedId(null);
            useNaviTrackerStore.setState({ activeShoppingList: null });
          }}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a listas
        </button>
        <ShoppingListDetail />
      </div>
    );
  }

  // Overview
  const activeLists = shoppingLists.filter((l) => l.status === "active");
  const archivedLists = shoppingLists.filter((l) => l.status === "archived");

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Lista de Compras
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {activeLists.length} lista{activeLists.length !== 1 ? "s" : ""}{" "}
            activa{activeLists.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-card border hover:bg-accent/50 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Nueva lista
        </button>
        <button
          onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <Sparkles className="h-4 w-4" />
          Generar desde Meal Prep
        </button>
      </div>

      {/* Active lists */}
      {activeLists.length === 0 && !shoppingListLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">
            No tenes listas de compras. Crea una o genera desde tu meal prep.
          </p>
        </div>
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

      {/* Archived */}
      {archivedLists.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
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

      <CreateListDialog open={showCreate} onOpenChange={setShowCreate} onCreated={(id) => setSelectedId(id)} />
      <GenerateListDialog open={showGenerate} onOpenChange={setShowGenerate} onGenerated={(id) => setSelectedId(id)} />
    </div>
  );
}
