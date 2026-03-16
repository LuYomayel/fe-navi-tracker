"use client";

import type { ShoppingList } from "@/types";
import { useNaviTrackerStore } from "@/store";
import { ShoppingCart, Archive, Trash2, Sparkles, ChevronRight } from "lucide-react";

interface Props {
  list: ShoppingList;
  onSelect: () => void;
}

export default function ShoppingListCard({ list, onSelect }: Props) {
  const { archiveShoppingList, deleteShoppingList } = useNaviTrackerStore();
  const itemCount = list._count?.items ?? list.items?.length ?? 0;
  const checkedCount = list.items?.filter((i) => i.checked).length;

  return (
    <div
      onClick={onSelect}
      className="bg-card rounded-lg border p-4 hover:bg-accent/50 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            {list.source === "meal_prep" ? (
              <Sparkles className="h-4 w-4 text-primary" />
            ) : (
              <ShoppingCart className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{list.name}</p>
            <p className="text-xs text-muted-foreground">
              {itemCount} items
              {checkedCount !== undefined && ` - ${checkedCount} completados`}
              {list.source === "meal_prep" && " - IA"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {list.status === "active" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                archiveShoppingList(list.id);
              }}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            >
              <Archive className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteShoppingList(list.id);
            }}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </button>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
