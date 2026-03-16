"use client";

import type { ShoppingItem } from "@/types";
import ShoppingItemRow from "./ShoppingItemRow";

interface Props {
  label: string;
  items: ShoppingItem[];
  listId: string;
}

export default function ShoppingCategorySection({
  label,
  items,
  listId,
}: Props) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-1.5">
        {label} ({items.length})
      </h3>
      <div className="bg-card rounded-lg border divide-y">
        {items.map((item) => (
          <ShoppingItemRow key={item.id} item={item} listId={listId} />
        ))}
      </div>
    </div>
  );
}
