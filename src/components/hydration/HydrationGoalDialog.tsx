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
}

export default function HydrationGoalDialog({ open, onOpenChange }: Props) {
  const { hydrationGoal, setHydrationGoal } = useNaviTrackerStore();
  const [goalGlasses, setGoalGlasses] = useState(hydrationGoal.goalGlasses);
  const [mlPerGlass, setMlPerGlass] = useState(hydrationGoal.mlPerGlass);

  const handleSave = async () => {
    await setHydrationGoal({ goalGlasses, mlPerGlass });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Meta de hidratacion</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium">Vasos por dia</label>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setGoalGlasses(Math.max(1, goalGlasses - 1))}
                className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-lg font-bold"
              >
                -
              </button>
              <span className="text-2xl font-bold w-12 text-center">
                {goalGlasses}
              </span>
              <button
                onClick={() => setGoalGlasses(Math.min(30, goalGlasses + 1))}
                className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">ml por vaso</label>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {[150, 200, 250, 300, 500].map((ml) => (
                <button
                  key={ml}
                  onClick={() => setMlPerGlass(ml)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    mlPerGlass === ml
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {ml} ml
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Meta diaria: {goalGlasses * mlPerGlass} ml (
            {((goalGlasses * mlPerGlass) / 1000).toFixed(1)} L)
          </div>

          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Guardar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
