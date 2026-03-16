"use client";

import type { ShoppingItem } from "@/types";
import { useNaviTrackerStore } from "@/store";
import { Trash2 } from "lucide-react";

interface Props {
  item: ShoppingItem;
  listId: string;
}

export default function ShoppingItemRow({ item, listId }: Props) {
  const { toggleShoppingItem, deleteShoppingItem } = useNaviTrackerStore();

  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <button
        onClick={() => toggleShoppingItem(listId, item.id)}
        className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
          item.checked
            ? "bg-green-500 border-green-500"
            : "border-muted-foreground/30 hover:border-primary"
        }`}
      >
        {item.checked && (
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <span
          className={`text-sm ${
            item.checked
              ? "line-through text-muted-foreground"
              : "font-medium"
          }`}
        >
          {item.name}
        </span>
        {item.quantity && (
          <span className="text-xs text-muted-foreground ml-2">
            {item.quantity}
          </span>
        )}
      </div>

      <button
        onClick={() => deleteShoppingItem(listId, item.id)}
        className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-destructive/10 transition-colors shrink-0"
      >
        <Trash2 className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}
