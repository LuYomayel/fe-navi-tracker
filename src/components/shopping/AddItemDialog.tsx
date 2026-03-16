"use client";

import { useState } from "react";
import { useNaviTrackerStore } from "@/store";
import type { ShoppingCategory } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
}

const categories: { value: ShoppingCategory; label: string }[] = [
  { value: "produce", label: "Frutas/Verduras" },
  { value: "protein", label: "Proteinas" },
  { value: "dairy", label: "Lacteos" },
  { value: "grains", label: "Cereales" },
  { value: "pantry", label: "Despensa" },
  { value: "frozen", label: "Congelados" },
  { value: "other", label: "Otros" },
];

export default function AddItemDialog({ open, onOpenChange, listId }: Props) {
  const { addShoppingItem } = useNaviTrackerStore();
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState<ShoppingCategory>("other");

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addShoppingItem(listId, {
      name: name.trim(),
      quantity: quantity.trim() || undefined,
      category,
    });
    setName("");
    setQuantity("");
    setCategory("other");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Pechuga de pollo"
              className="w-full mt-1 px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Cantidad</label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ej: 1 kg, 2 unidades"
              className="w-full mt-1 px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Categoria</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    category === cat.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Agregar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
