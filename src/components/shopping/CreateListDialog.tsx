"use client";

import { useState } from "react";
import { useNaviTrackerStore } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (id: string) => void;
}

export default function CreateListDialog({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const { createShoppingList } = useNaviTrackerStore();
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    const list = await createShoppingList(name.trim());
    if (list) {
      onCreated?.(list.id);
      setName("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva lista de compras</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la lista..."
            className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Crear lista
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
