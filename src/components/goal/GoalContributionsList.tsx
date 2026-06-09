import type { GoalContribution } from "@/types";

function formatDate(d: string): string {
  // d = YYYY-MM-DD
  const date = new Date(`${d}T12:00:00`);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function GoalContributionsList({
  contributions,
}: {
  contributions: GoalContribution[];
}) {
  if (!contributions.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Todavía no hay movimientos. Sumá tu primer aporte 💪
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {contributions.map((c) => {
        const positive = c.amountUsd >= 0;
        return (
          <li
            key={c.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {c.description || (positive ? "Aporte" : "Gasto")}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(c.date)}
              </p>
            </div>
            <span
              className={`shrink-0 font-mono text-sm font-semibold tabular-nums ${
                positive ? "text-success" : "text-destructive"
              }`}
            >
              {positive ? "+" : "−"}USD{" "}
              {Math.abs(c.amountUsd).toLocaleString("es-AR", {
                maximumFractionDigits: 2,
              })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
