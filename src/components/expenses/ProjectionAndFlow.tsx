"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import type { Expense, MonthProjection, MonthlyBalance } from "@/types/expenses";
import { getDateKey } from "@/lib/utils";
import { Wallet2, CalendarClock } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const fmtARS = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);

const fmtCompact = (n: number) =>
  `${n < 0 ? "-" : ""}$${Math.round(Math.abs(n) / 1000)}k`;

/**
 * "¿Cuánta plata dispongo realmente para el resto del mes?" — número héroe
 * con el desglose de compromisos futuros e ingresos esperados.
 */
export function ProjectionCard({ projection }: { projection: MonthProjection }) {
  const pr = projection;
  const hasFuture =
    pr.gastosFuturos.length > 0 ||
    pr.recurrentesPorVenir.length > 0 ||
    pr.ingresosEsperados.length > 0;

  return (
    <Card className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Wallet2 className="h-4 w-4 text-primary" />
          Disponible real del mes
        </h3>
        <span className="text-[11px] text-muted-foreground">
          proyectado al {pr.month.split("-").reverse().join("/")}
        </span>
      </div>

      <div
        className={`font-mono text-3xl font-bold tabular-nums ${
          pr.disponibleProyectado >= 0 ? "text-success" : "text-destructive"
        }`}
      >
        {pr.disponibleProyectado >= 0 ? "+" : ""}
        {fmtARS(pr.disponibleProyectado)}
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Saldo del mes hoy</span>
          <span className="font-mono tabular-nums">{fmtARS(pr.saldoHoy)}</span>
        </div>
        {pr.gastosFuturos.map((g) => (
          <div key={g.id} className="flex justify-between">
            <span className="truncate pr-2 text-muted-foreground">
              📌 {g.description}{" "}
              <span className="text-[11px]">({g.date.slice(8)}/{g.date.slice(5, 7)})</span>
            </span>
            <span className="shrink-0 font-mono tabular-nums text-destructive">
              −{fmtARS(g.amount)}
            </span>
          </div>
        ))}
        {pr.recurrentesPorVenir.map((r) => (
          <div key={r.id} className="flex justify-between">
            <span className="truncate pr-2 text-muted-foreground">
              🔁 {r.description}
              {r.cuota ? ` (cuota ${r.cuota})` : ""}{" "}
              <span className="text-[11px]">(día {r.dayOfMonth})</span>
            </span>
            <span className="shrink-0 font-mono tabular-nums text-destructive">
              −{fmtARS(r.amount)}
            </span>
          </div>
        ))}
        {pr.ingresosEsperados.map((i) => (
          <div key={i.id} className="flex justify-between">
            <span className="truncate pr-2 text-muted-foreground">
              ⏳ {i.description}{" "}
              <span className="text-[11px]">({i.date.slice(8)}/{i.date.slice(5, 7)})</span>
            </span>
            <span className="shrink-0 font-mono tabular-nums text-success">
              +{fmtARS(i.amount)}
            </span>
          </div>
        ))}
        {!hasFuture && (
          <p className="text-xs text-muted-foreground">
            Sin compromisos futuros agendados. Cargá gastos con fecha futura o
            ingresos pendientes y aparecen acá.
          </p>
        )}
      </div>
    </Card>
  );
}

/**
 * Cash flow acumulado del mes: una serie (saldo neto acumulado), pasado en
 * trazo sólido y proyección punteada con los compromisos e ingresos futuros.
 */
export function CashFlowChart({
  month,
  expenses,
  balance,
  projection,
}: {
  month: string;
  expenses: Expense[];
  balance: MonthlyBalance;
  projection: MonthProjection | null;
}) {
  const data = useMemo(() => {
    const [y, m] = month.split("-").map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const today = getDateKey(new Date());
    const todayDay = today.slice(0, 7) === month ? Number(today.slice(8)) : daysInMonth;

    const delta = new Array<number>(daysInMonth + 1).fill(0);
    const dayOf = (date: string) => Number(date.slice(8, 10));

    for (const i of balance.incomes) delta[dayOf(i.date)] += i.amount;
    for (const e of expenses) delta[dayOf(e.date)] -= e.amount;
    if (projection) {
      for (const i of projection.ingresosEsperados)
        delta[dayOf(i.date)] += i.amount;
      for (const r of projection.recurrentesPorVenir)
        delta[Math.min(r.dayOfMonth, daysInMonth)] -= r.amount;
    }

    let cum = 0;
    const points: {
      day: number;
      real: number | null;
      proyectado: number | null;
    }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      cum += delta[d];
      points.push({
        day: d,
        real: d <= todayDay ? Math.round(cum) : null,
        // se superponen en "hoy" para que la línea conecte
        proyectado: d >= todayDay ? Math.round(cum) : null,
      });
    }
    return points;
  }, [month, expenses, balance, projection]);

  if (data.length === 0) return null;

  return (
    <Card className="rounded-lg border p-4">
      <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
        <CalendarClock className="h-4 w-4 text-primary" />
        Cash flow del mes
      </h3>
      <p className="mb-2 text-[11px] text-muted-foreground">
        Saldo acumulado día a día — punteado: proyección con lo agendado
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <CartesianGrid
              vertical={false}
              stroke="hsl(var(--border) / 0.5)"
              strokeDasharray="2 4"
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              ticks={[1, 5, 10, 15, 20, 25, data.length]}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              tickFormatter={fmtCompact}
              tickLine={false}
              axisLine={false}
              width={44}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />
            <Tooltip
              formatter={(v: number, name: string) => [
                fmtARS(Number(v)),
                name === "real" ? "Saldo" : "Proyectado",
              ]}
              labelFormatter={(d) => `Día ${d}`}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
                color: "hsl(var(--popover-foreground))",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="real"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fill="hsl(var(--chart-1) / 0.15)"
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey="proyectado"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              strokeDasharray="5 4"
              fill="hsl(var(--chart-1) / 0.06)"
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
