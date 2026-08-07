"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtARS } from "@/lib/utils";
import { Package, Gift, TrendingUp, Clock, Target } from "lucide-react";
import type { PrintingSummary } from "@/types/printing";

interface BalanceTabProps {
  summary: PrintingSummary | null;
  isLoading: boolean;
}

/**
 * Balance del negocio: cuánto se invirtió, cuánto se ganó y cuánto falta
 * para recuperar el filamento. Todo sale de las tablas del módulo — no
 * depende del objetivo activo (el objetivo puede cambiar; esto sigue).
 */
export default function BalanceTab({ summary, isLoading }: BalanceTabProps) {
  if (isLoading || !summary) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-44 w-full rounded-lg" />
      </div>
    );
  }

  const {
    investedFilament,
    filamentsCount,
    investedSamples,
    samplesCount,
    profitSalesSettled,
    profitSalesPending,
    profitSalesTotal,
    salesCount,
    result,
    missingToCoverFilament,
  } = summary;

  const cubierto =
    investedFilament > 0
      ? Math.min(100, Math.round((profitSalesTotal / investedFilament) * 100))
      : 0;

  return (
    <div className="animate-fade-in space-y-4">
      {/* Resultado: el número que importa */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold">Resultado a hoy</h3>
        <div
          className={`mt-1 font-mono text-4xl font-bold tabular-nums ${
            result >= 0 ? "text-success" : "text-destructive"
          }`}
        >
          {result >= 0 ? "+" : ""}
          {fmtARS(result)}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Ganancia de ventas menos lo que pusiste en las muestras. Al arranque
          da negativo (invertiste) y se da vuelta con las ventas.
        </p>
      </Card>

      {/* Desglose */}
      <Card className="space-y-3 p-4">
        <h3 className="text-sm font-semibold">De dónde sale</h3>

        <Row
          icon={<TrendingUp className="h-4 w-4 text-success" />}
          label="Ganancia cobrada"
          detail={`${salesCount} ${salesCount === 1 ? "venta" : "ventas"}`}
          value={profitSalesSettled}
          tone="success"
        />
        {profitSalesPending > 0 && (
          <Row
            icon={<Clock className="h-4 w-4 text-warning-foreground dark:text-warning" />}
            label="Ganancia a liquidar"
            detail="Marcelito todavía no te la pasó"
            value={profitSalesPending}
            tone="warning"
          />
        )}
        <Row
          icon={<Gift className="h-4 w-4 text-muted-foreground" />}
          label="Invertido en muestras"
          detail={`${samplesCount} ${samplesCount === 1 ? "muestra entregada" : "muestras entregadas"}`}
          value={-investedSamples}
          tone="muted"
        />
        <Row
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          label="Invertido en filamento"
          detail={`${filamentsCount} ${filamentsCount === 1 ? "rollo" : "rollos"}`}
          value={-investedFilament}
          tone="muted"
        />
      </Card>

      {/* Recuperar el filamento */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <Target className="h-4 w-4 text-primary" />
            Recuperar el filamento
          </h3>
          <span className="font-mono text-sm font-bold tabular-nums">
            {cubierto}%
          </span>
        </div>

        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-info transition-[width] duration-500"
            style={{ width: `${cubierto}%` }}
          />
        </div>

        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span className="font-mono tabular-nums">
            {fmtARS(profitSalesTotal)}
          </span>
          <span className="font-mono tabular-nums">
            {fmtARS(investedFilament)}
          </span>
        </div>

        <p className="mt-2 text-sm">
          {missingToCoverFilament > 0 ? (
            <>
              Te falta ganar{" "}
              <span className="font-mono font-bold tabular-nums">
                {fmtARS(missingToCoverFilament)}
              </span>{" "}
              para cubrir lo que pusiste en filamento.
            </>
          ) : (
            <span className="font-medium text-success">
              🎉 Ya recuperaste todo el filamento. De acá en más es ganancia.
            </span>
          )}
        </p>
      </Card>
    </div>
  );
}

function Row({
  icon,
  label,
  detail,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  detail: string;
  value: number;
  tone: "success" | "warning" | "muted";
}) {
  const color =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning-foreground dark:text-warning"
        : "text-muted-foreground";
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2.5 last:border-0 last:pb-0">
      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0">{icon}</span>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium">{label}</div>
          <div className="truncate text-[11px] text-muted-foreground">
            {detail}
          </div>
        </div>
      </div>
      <span className={`shrink-0 font-mono text-sm font-bold tabular-nums ${color}`}>
        {value >= 0 ? "+" : "−"}
        {fmtARS(Math.abs(value))}
      </span>
    </div>
  );
}
