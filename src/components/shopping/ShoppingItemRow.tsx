"use client";

import { useState } from "react";
import type { ShoppingItem } from "@/types";
import { useNaviTrackerStore } from "@/store";
import { Trash2, Pencil, Check, X } from "lucide-react";

interface Props {
  item: ShoppingItem;
  listId: string;
}

export default function ShoppingItemRow({ item, listId }: Props) {
  const { toggleShoppingItem, deleteShoppingItem, updateShoppingItem } = useNaviTrackerStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editQuantity, setEditQuantity] = useState(item.quantity ?? "");

  const handleSave = async () => {
    if (!editName.trim()) return;
    await updateShoppingItem(listId, item.id, {
      name: editName.trim(),
      quantity: editQuantity.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(item.name);
    setEditQuantity(item.quantity ?? "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5">
        <input
          className="flex-1 min-w-0 text-sm border rounded px-2 py-1 bg-background border-border"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
          autoFocus
        />
        <input
          className="w-20 text-sm border rounded px-2 py-1 bg-background border-border"
          value={editQuantity}
          onChange={(e) => setEditQuantity(e.target.value)}
          placeholder="Cant."
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
        />
        <button onClick={handleSave} className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-green-500/10 transition-colors shrink-0">
          <Check className="h-3 w-3 text-green-600" />
        </button>
        <button onClick={handleCancel} className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-destructive/10 transition-colors shrink-0">
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    );
  }

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
        onClick={() => setIsEditing(true)}
        className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors shrink-0"
      >
        <Pencil className="h-3 w-3 text-muted-foreground" />
      </button>

      <button
        onClick={() => deleteShoppingItem(listId, item.id)}
        className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-destructive/10 transition-colors shrink-0"
      >
        <Trash2 className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}
