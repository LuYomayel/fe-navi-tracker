"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TrendingDown, TrendingUp, Minus, Ruler, Layers } from "lucide-react";

import { Card } from "@/components/ui/card";
import { sumOfSkinfolds } from "@/lib/anthropometry";
import {
  SkinFoldSiteNames,
  SkinFoldMeasurementOrder,
  type SkinFoldRecord,
  type SkinFoldSite,
} from "@/types/skinFold";

/** Paleta por sitio: los 5 tokens de chart (theme-aware) + hues fijos para el resto. */
const SITE_COLORS: Record<SkinFoldSite, string> = {
  triceps: "hsl(var(--chart-1))",
  subscapular: "hsl(var(--chart-2))",
  suprailiac: "hsl(var(--chart-3))",
  abdominal: "hsl(var(--chart-4))",
  thigh: "hsl(var(--chart-5))",
  calf: "hsl(199 89% 48%)",
  chest: "hsl(173 70% 45%)",
  midaxillary: "hsl(25 95% 53%)",
  biceps: "hsl(280 65% 62%)",
};

function recordDate(r: SkinFoldRecord): Date {
  if (r.date) return new Date(r.date + "T12:00:00");
  if (r.createdAt) return new Date(r.createdAt);
  return new Date();
}

/** Tooltip oscuro reutilizable para todos los charts. */
interface TooltipEntry {
  dataKey?: string | number;
  name?: string;
  value?: number | string;
  color?: string;
  stroke?: string;
}
function ChartTooltip({
  active,
  payload,
  label,
  unit = "mm",
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      {label && (
        <div className="mb-1 font-semibold capitalize text-foreground">
          {label}
        </div>
      )}
      <div className="space-y-0.5">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: p.color || p.stroke || "currentColor" }}
            />
            <span className="text-muted-foreground">{p.name}</span>
            <span className="ml-auto pl-3 font-mono font-medium tabular-nums text-foreground">
              {p.value} {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const AXIS_TICK = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };

export function SkinFoldCharts({ records }: { records: SkinFoldRecord[] }) {
  const [hidden, setHidden] = useState<Set<SkinFoldSite>>(new Set());

  // Registros ordenados por fecha de medición (asc) para la serie temporal.
  const sorted = useMemo(
    () =>
      [...records]
        .map((r) => ({ r, t: recordDate(r).getTime() }))
        .sort((a, b) => a.t - b.t)
        .map(({ r }) => r),
    [records]
  );

  // Sitios con al menos una medición > 0, en orden ISAK.
  const sites = useMemo(() => {
    const present = new Set<SkinFoldSite>();
    sorted.forEach((r) =>
      Object.entries(r.values || {}).forEach(([k, v]) => {
        if (typeof v === "number" && v > 0) present.add(k as SkinFoldSite);
      })
    );
    return SkinFoldMeasurementOrder.filter((s) => present.has(s));
  }, [sorted]);

  // ¿La serie cruza más de un año? Sólo entonces mostramos el año en el eje.
  const multiYear = useMemo(() => {
    const years = new Set(sorted.map((r) => recordDate(r).getFullYear()));
    return years.size > 1;
  }, [sorted]);

  const fmtLabel = (r: SkinFoldRecord) =>
    recordDate(r).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      ...(multiYear ? { year: "2-digit" } : {}),
    });

  // Data para área (Σ) y multilínea (por sitio).
  const series = useMemo(
    () =>
      sorted.map((r) => {
        const row: Record<string, number | string | null> = {
          label: fmtLabel(r),
          total: sumOfSkinfolds(r),
        };
        sites.forEach((s) => {
          const v = r.values[s];
          row[s] = typeof v === "number" && v > 0 ? v : null;
        });
        return row;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sorted, sites, multiYear]
  );

  // Radar: perfil del último registro vs el anterior.
  const latest = sorted[sorted.length - 1];
  const prev = sorted.length >= 2 ? sorted[sorted.length - 2] : undefined;
  const radar = useMemo(
    () =>
      sites.map((s) => ({
        site: SkinFoldSiteNames[s],
        actual: latest?.values[s] ?? 0,
        anterior: prev?.values[s] ?? 0,
      })),
    [sites, latest, prev]
  );

  if (sorted.length === 0 || sites.length === 0) return null;

  const latestTotal = latest ? sumOfSkinfolds(latest) : 0;
  const prevTotal = prev ? sumOfSkinfolds(prev) : undefined;
  const delta =
    prevTotal !== undefined
      ? Math.round((latestTotal - prevTotal) * 10) / 10
      : undefined;

  const hasTrend = sorted.length >= 2;

  const toggleSite = (s: SkinFoldSite) =>
    setHidden((prevSet) => {
      const next = new Set(prevSet);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  return (
    <div className="space-y-3">
      {/* Resumen: última Σ + delta vs anterior */}
      <Card className="flex items-center gap-3 rounded-lg border p-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-4/15 text-chart-4">
          <Layers className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground">
            Σ de pliegues · última medición
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
              {latestTotal}
            </span>
            <span className="text-xs text-muted-foreground">mm</span>
            {delta !== undefined && delta !== 0 && (
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  delta < 0 ? "text-success" : "text-destructive"
                }`}
              >
                {delta < 0 ? (
                  <TrendingDown className="h-3.5 w-3.5" />
                ) : (
                  <TrendingUp className="h-3.5 w-3.5" />
                )}
                {delta > 0 ? "+" : ""}
                {delta} mm
              </span>
            )}
            {delta === 0 && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
                <Minus className="h-3.5 w-3.5" /> sin cambios
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-mono text-sm font-semibold tabular-nums text-foreground">
            {sorted.length}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {sorted.length === 1 ? "medición" : "mediciones"}
          </div>
        </div>
      </Card>

      {/* Área: Σ total por fecha de medición */}
      {hasTrend && (
        <Card className="rounded-lg border p-3.5">
          <div className="mb-2 flex items-center gap-2">
            <Ruler className="h-4 w-4 text-chart-1" />
            <h4 className="text-sm font-semibold">Suma total (Σ) por fecha</h4>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart
              data={series}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="sfTotalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                minTickGap={16}
              />
              <YAxis
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={40}
                domain={[
                  (min: number) => Math.max(0, Math.floor(min - 8)),
                  (max: number) => Math.ceil(max + 8),
                ]}
              />
              <Tooltip
                content={<ChartTooltip unit="mm" />}
                cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="total"
                name="Σ total"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2.5}
                fill="url(#sfTotalGrad)"
                dot={{ r: 3, fill: "hsl(var(--chart-1))", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Multilínea: cada sitio por fecha, con chips para togglear */}
      {hasTrend && sites.length > 0 && (
        <Card className="rounded-lg border p-3.5">
          <div className="mb-2 flex items-center gap-2">
            <Ruler className="h-4 w-4 text-chart-3" />
            <h4 className="text-sm font-semibold">Pliegues por sitio</h4>
          </div>

          {/* Chips: tap para ocultar/mostrar sitios */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            {sites.map((s) => {
              const off = hidden.has(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSite(s)}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    off
                      ? "border-border text-muted-foreground opacity-50"
                      : "border-transparent bg-muted text-foreground"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: SITE_COLORS[s] }}
                  />
                  {SkinFoldSiteNames[s]}
                </button>
              );
            })}
          </div>

          <ResponsiveContainer width="100%" height={230}>
            <LineChart
              data={series}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                minTickGap={16}
              />
              <YAxis
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={40}
                domain={[
                  (min: number) => Math.max(0, Math.floor(min - 4)),
                  (max: number) => Math.ceil(max + 4),
                ]}
              />
              <Tooltip
                content={<ChartTooltip unit="mm" />}
                cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
              />
              {sites.map((s) => (
                <Line
                  key={s}
                  type="monotone"
                  dataKey={s}
                  name={SkinFoldSiteNames[s]}
                  stroke={SITE_COLORS[s]}
                  strokeWidth={2}
                  dot={{ r: 2.5, strokeWidth: 0, fill: SITE_COLORS[s] }}
                  activeDot={{ r: 4.5 }}
                  connectNulls
                  hide={hidden.has(s)}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Radar: perfil actual (vs anterior si existe) */}
      {sites.length >= 3 && (
        <Card className="rounded-lg border p-3.5">
          <div className="mb-1 flex items-center gap-2">
            <Ruler className="h-4 w-4 text-chart-4" />
            <h4 className="text-sm font-semibold">Perfil actual</h4>
            {latest && (
              <span className="ml-auto text-[11px] text-muted-foreground">
                {fmtLabel(latest)}
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radar} outerRadius="72%">
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="site"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <PolarRadiusAxis tick={false} axisLine={false} />
              {prev && (
                <Radar
                  name="Anterior"
                  dataKey="anterior"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 3"
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={0.08}
                  isAnimationActive={false}
                />
              )}
              <Radar
                name="Actual"
                dataKey="actual"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2}
                fill="hsl(var(--chart-4))"
                fillOpacity={0.3}
                isAnimationActive={false}
              />
              <Tooltip content={<ChartTooltip unit="mm" />} />
            </RadarChart>
          </ResponsiveContainer>
          {prev && (
            <div className="mt-1 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-chart-4" /> Actual
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />
                Anterior
              </span>
            </div>
          )}
        </Card>
      )}

      {!hasTrend && (
        <p className="px-1 text-xs text-muted-foreground">
          Cargá otra medición para ver la evolución de tus pliegues en el tiempo.
        </p>
      )}
    </div>
  );
}
