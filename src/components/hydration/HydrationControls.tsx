"use client";

import { Minus, Plus } from "lucide-react";

interface Props {
  glasses: number;
  date: string;
  onAdjust: (date: string, delta: number) => void;
}

export default function HydrationControls({ glasses, date, onAdjust }: Props) {
  return (
    <div className="flex items-center gap-6">
      <button
        onClick={() => onAdjust(date, -1)}
        disabled={glasses <= 0}
        className="h-14 w-14 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
      >
        <Minus className="h-6 w-6" />
      </button>

      <button
        onClick={() => onAdjust(date, 1)}
        className="h-20 w-20 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-blue-500/25"
      >
        <Plus className="h-8 w-8" />
      </button>

      <button
        onClick={() => onAdjust(date, -1)}
        disabled={glasses <= 0}
        className="h-14 w-14 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none invisible"
      >
        {/* Spacer for centering */}
      </button>
    </div>
  );
}
