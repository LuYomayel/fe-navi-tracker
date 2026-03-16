"use client";

import { useState } from "react";
import { useNaviTrackerStore } from "@/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated?: (id: string) => void;
}

export default function GenerateListDialog({
  open,
  onOpenChange,
  onGenerated,
}: Props) {
  const { generateShoppingList, shoppingListLoading } = useNaviTrackerStore();
  const [name, setName] = useState("");

  const handleGenerate = async () => {
    const list = await generateShoppingList(
      undefined,
      name.trim() || undefined,
    );
    if (list) {
      onGenerated?.(list.id);
      setName("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generar lista desde Meal Prep</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Se tomara tu meal prep activo y la IA generara una lista de compras
            organizada por categoria con las cantidades para la semana.
          </p>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre personalizado (opcional)..."
            className="w-full px-3 py-2.5 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />

          <button
            onClick={handleGenerate}
            disabled={shoppingListLoading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {shoppingListLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generar con IA
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
