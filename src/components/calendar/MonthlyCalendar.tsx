"use client";

import { useState, useEffect } from "react";
import { useNaviTrackerStore } from "@/store";
import { DayScore } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import DayDetailDialog from "./DayDetailDialog";

const dayHeaders = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function getStatusColor(score: DayScore | undefined): string {
  if (!score || score.status === "future") return "bg-transparent";
  if (score.status === "no_data") return "bg-gray-700/30 dark:bg-gray-600/20";
  if (score.percentage === 100) return "bg-green-500";
  if (score.percentage >= 75) return "bg-green-400/80";
  if (score.percentage >= 50) return "bg-yellow-400";
  return "bg-red-500";
}

export default function MonthlyCalendar() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<DayScore | null>(null);

  const { dayScores, dayScoresLoading, monthlyStats, fetchDayScoreRange, fetchMonthlyStats } =
    useNaviTrackerStore();

  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  useEffect(() => {
    const lastDay = new Date(year, month + 1, 0).getDate();
    const from = `${monthKey}-01`;
    const to = `${monthKey}-${String(lastDay).padStart(2, "0")}`;
    fetchDayScoreRange(from, to);
    fetchMonthlyStats(monthKey);
  }, [year, month, monthKey, fetchDayScoreRange, fetchMonthlyStats]);

  const navigateMonth = (dir: number) => {
    const d = new Date(year, month + dir, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  // Monday = 0, Sunday = 6
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const scoreMap = new Map(dayScores.map((s) => [s.date, s]));

  const cells: (DayScore | null)[] = [];
  // Empty cells before first day
  for (let i = 0; i < startDow; i++) cells.push(null);
  // Day cells
  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${monthKey}-${String(d).padStart(2, "0")}`;
    cells.push(scoreMap.get(dateStr) || { date: dateStr, status: "no_data", percentage: 0, totalItems: 0, completedItems: 0, habitsTotal: 0, habitsCompleted: 0, tasksTotal: 0, tasksCompleted: 0, nutritionLogged: false, exerciseLogged: false, reflectionLogged: false });
  }

  const today = new Date().toISOString().split("T")[0];

  const stats = monthlyStats;

  return (
    <div className="space-y-4">
      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-bold">
          {monthNames[month]} {year}
        </h2>
        <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar grid */}
      <div className="bg-card rounded-lg border p-3">
        {dayScoresLoading && (
          <div className="text-center text-xs text-muted-foreground py-2">
            Calculando...
          </div>
        )}
        <div className="grid grid-cols-7 gap-1">
          {dayHeaders.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-medium text-muted-foreground py-1"
            >
              {d}
            </div>
          ))}
          {cells.map((score, i) => {
            if (!score) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }
            const dayNum = parseInt(score.date.split("-")[2]);
            const isToday = score.date === today;
            const isFuture = score.date > today;

            return (
              <button
                key={score.date}
                onClick={() => !isFuture && setSelectedDay(score)}
                disabled={isFuture}
                className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs transition-all relative ${
                  isFuture
                    ? "opacity-30 cursor-default"
                    : "hover:ring-2 hover:ring-primary/50 cursor-pointer"
                } ${getStatusColor(isFuture ? undefined : score)} ${
                  isToday ? "ring-2 ring-primary" : ""
                }`}
              >
                <span
                  className={`font-medium ${
                    score.status === "won" || score.status === "lost"
                      ? "text-white"
                      : score.status === "partial" && score.percentage >= 50
                        ? "text-gray-900"
                        : ""
                  }`}
                >
                  {dayNum}
                </span>
                {!isFuture && score.status !== "no_data" && (
                  <span
                    className={`text-[8px] ${
                      score.status === "won" || score.status === "lost"
                        ? "text-white/80"
                        : score.status === "partial"
                          ? "text-gray-700"
                          : "text-muted-foreground"
                    }`}
                  >
                    {score.percentage}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Month stats */}
      {stats && (
        <div className="bg-card rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-3">Resumen del mes</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold text-green-500">
                {stats.won}
              </div>
              <div className="text-[10px] text-muted-foreground">Ganados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {stats.partial}
              </div>
              <div className="text-[10px] text-muted-foreground">Parciales</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">
                {stats.lost}
              </div>
              <div className="text-[10px] text-muted-foreground">Perdidos</div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <span className="text-sm text-muted-foreground">
              Promedio: <span className="font-bold text-foreground">{stats.avgPercentage}%</span>
            </span>
          </div>
        </div>
      )}

      <DayDetailDialog
        score={selectedDay}
        onClose={() => setSelectedDay(null)}
      />
    </div>
  );
}
