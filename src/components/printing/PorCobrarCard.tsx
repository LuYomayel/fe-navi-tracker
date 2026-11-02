"use client";

import { Card } from "@/components/ui/card";
import { fmtARS } from "@/lib/utils";
import { HandCoins } from "lucide-react";
import type { Receivables } from "@/types/printing";

const shortDate = (date: string) => {
  const [, m, d] = date.split("-");
  return `${d}/${m}`;
};

/** El número grande de lo ya entregado que falta que paguen, y quién lo debe. */
export default function PorCobrarCard({
  receivables,
}: {
  receivables: Receivables;
}) {
  const { total, salesCount, customers } = receivables;

  return (
    <Card className="border-warning/40 bg-warning/10 p-4">
      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-warning-foreground dark:text-warning">
        <HandCoins className="h-4 w-4" />
        Por cobrar
      </div>

      <div className="mt-1 font-mono text-4xl font-bold tabular-nums">
        {fmtARS(total)}
      </div>

      {salesCount === 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Estás al día: te pagaron todo lo que entregaste.
        </p>
      ) : (
        <>
          <p className="mt-1 text-xs text-muted-foreground">
            Ya entregado · {salesCount}{" "}
            {salesCount === 1 ? "venta sin cobrar" : "ventas sin cobrar"}
          </p>

          <ul className="mt-3 space-y-2.5 border-t border-warning/30 pt-3">
            {customers.map((c) => (
              <li key={c.name}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-semibold">
                    {c.name}
                  </span>
                  <span className="shrink-0 font-mono text-sm font-bold tabular-nums">
                    {fmtARS(c.total)}
                  </span>
                </div>
                {c.sales.map((s) => (
                  <div key={s.id} className="text-xs text-muted-foreground">
                    {s.qty}x {s.productName} · {shortDate(s.date)}
                    {s.settledAmount > 0 &&
                      ` · pagó ${fmtARS(s.settledAmount)} de ${fmtARS(s.total)}`}
                  </div>
                ))}
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
