"use client";

import { useState } from "react";
import { useNaviTrackerStore } from "@/store";
import type { ShoppingCategory } from "@/types";
import ShoppingCategorySection from "./ShoppingCategorySection";
import AddItemDialog from "./AddItemDialog";
import { Plus, RotateCcw } from "lucide-react";

const categoryOrder: ShoppingCategory[] = [
  "produce",
  "protein",
  "dairy",
  "grains",
  "pantry",
  "frozen",
  "other",
];

const categoryLabels: Record<ShoppingCategory, string> = {
  produce: "Frutas y Verduras",
  protein: "Proteinas",
  dairy: "Lacteos",
  grains: "Cereales y Harinas",
  pantry: "Despensa",
  frozen: "Congelados",
  other: "Otros",
};

export default function ShoppingListDetail() {
  const { activeShoppingList, uncheckAllShoppingItems } =
    useNaviTrackerStore();
  const [showAddItem, setShowAddItem] = useState(false);

  if (!activeShoppingList) return null;

  const items = activeShoppingList.items || [];
  const totalItems = items.length;
  const checkedItems = items.filter((i) => i.checked).length;
  const percentage =
    totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  // Group by category
  const grouped = categoryOrder
    .map((cat) => ({
      category: cat,
      label: categoryLabels[cat],
      items: items.filter((i) => i.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold">{activeShoppingList.name}</h2>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {checkedItems}/{totalItems}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowAddItem(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border hover:bg-accent/50 transition-colors text-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar item
        </button>
        {checkedItems > 0 && (
          <button
            onClick={() => uncheckAllShoppingItems(activeShoppingList.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border hover:bg-accent/50 transition-colors text-sm text-muted-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Desmarcar todo
          </button>
        )}
      </div>

      {/* Category sections */}
      {grouped.map((group) => (
        <ShoppingCategorySection
          key={group.category}
          label={group.label}
          items={group.items}
          listId={activeShoppingList.id}
        />
      ))}

      {items.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          Esta lista esta vacia. Agrega items manualmente.
        </p>
      )}

      <AddItemDialog
        open={showAddItem}
        onOpenChange={setShowAddItem}
        listId={activeShoppingList.id}
      />
    </div>
  );
}
