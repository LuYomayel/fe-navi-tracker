"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog, useConfirm } from "@/components/ui/confirm-dialog";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import { getDateKey, getMonthKey } from "@/lib/utils";
import type {
  BusinessSummary,
  Expense,
  ExpenseCategory,
  ExpenseSummary,
  Income,
  IncomeSource,
  MonthlyBalance,
  RecurringExpense,
} from "@/types/expenses";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Wallet,
  Repeat,
  Tags,
  TrendingDown,
  TrendingUp,
  Printer,
  HandCoins,
  Clock,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const fmtARS = (n: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);

const CHART_TOKENS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"];

const tokenColor = (token?: string | null, index = 0) =>
  `hsl(var(--${token || CHART_TOKENS[index % CHART_TOKENS.length]}))`;

const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
};

const todayKey = () => getDateKey(new Date());

const SOURCE_META: Record<string, { label: string; emoji: string }> = {
  "3d": { label: "3D", emoji: "🖨️" },
  sueldo: { label: "Sueldo", emoji: "💼" },
  devolucion: { label: "Devolución", emoji: "↩️" },
  venta: { label: "Venta", emoji: "🏷️" },
  otro: { label: "Otro", emoji: "💰" },
};

const sourceLabel = (source: string) =>
  SOURCE_META[source] || { label: source, emoji: "💰" };

// Mes YYYY-MM de la última cuota (espejo de recurringEndPeriod del backend)
const recurringEnd = (r: RecurringExpense): string | null => {
  if (!r.totalInstallments) return null;
  const remaining = r.totalInstallments - r.installmentsPaid;
  if (remaining <= 0) return null;
  const add = (period: string, n: number) => {
    const [y, m] = period.split("-").map(Number);
    return getMonthKey(new Date(y, m - 1 + n, 1));
  };
  if (r.startPeriod) return add(r.startPeriod, r.totalInstallments - 1);
  const current = getMonthKey(new Date());
  return add(current, r.lastPostedPeriod === current ? remaining : remaining - 1);
};

const monthShort = (period: string) => {
  const [y, m] = period.split("-");
  return `${m}/${y}`;
};

export default function GastosSection() {
  const [month, setMonth] = useState(() => getMonthKey(new Date()));
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
  const [balance, setBalance] = useState<MonthlyBalance | null>(null);
  const [business, setBusiness] = useState<BusinessSummary | null>(null);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false);
  const [showRecurringDialog, setShowRecurringDialog] = useState(false);
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [incomeDialogSource, setIncomeDialogSource] =
    useState<IncomeSource>("otro");

  // Navegar meses rapido dispara varios reload() en paralelo. Nos quedamos
  // solo con la respuesta del ultimo pedido: si no, los datos de un mes
  // podian terminar pintados bajo el titulo de otro.
  const reloadSeq = useRef(0);

  // Confirmaciones tokenizadas (reemplazan window.confirm)
  const confirmExpense = useConfirm<Expense>();
  const confirmIncome = useConfirm<Income>();

  const reload = useCallback(async () => {
    const requestId = ++reloadSeq.current;
    try {
      const [expRes, sumRes, catRes, recRes, balRes, bizRes] =
        await Promise.all([
          api.expenses.list(month),
          api.expenses.summary(month),
          api.expenses.categories.list(),
          api.expenses.recurring.list(),
          api.expenses.balance(month),
          api.expenses.businessSummary(),
        ]);
      if (requestId !== reloadSeq.current) return;
      setExpenses((expRes.data as Expense[]) || []);
      setSummary(sumRes.data as ExpenseSummary);
      setCategories((catRes.data as ExpenseCategory[]) || []);
      setRecurring((recRes.data as RecurringExpense[]) || []);
      setBalance(balRes.data as MonthlyBalance);
      setBusiness(bizRes.data as BusinessSummary);
    } catch (error) {
      if (requestId !== reloadSeq.current) return;
      console.error("Error cargando gastos:", error);
      toast.error("Error", "No se pudieron cargar los gastos");
    } finally {
      if (requestId === reloadSeq.current) setLoading(false);
    }
  }, [month]);

  // Objetivo activo (fondo NZ) para linkear inversiones — una sola vez
  useEffect(() => {
    api.goals
      .getAll()
      .then((res) => {
        const goals = (res.data as { id: string; status: string }[]) || [];
        const active = goals.find((g) => g.status === "active") || goals[0];
        setActiveGoalId(active?.id || null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  const shiftMonth = (delta: number) => {
    const [y, m] = month.split("-").map(Number);
    setMonth(getMonthKey(new Date(y, m - 1 + delta, 1)));
  };

  const isCurrentMonth = month === getMonthKey(new Date());

  const pieData = useMemo(() => {
    if (!summary) return [];
    const data = summary.byCategory
      .filter((c) => c.amount > 0)
      .map((c, i) => ({
        name: `${c.icon ? c.icon + " " : ""}${c.name}`,
        value: c.amount,
        fill: tokenColor(c.color, i),
      }));
    if (summary.uncategorized > 0) {
      data.push({
        name: "Sin categoría",
        value: summary.uncategorized,
        fill: "hsl(var(--muted-foreground) / 0.35)",
      });
    }
    return data;
  }, [summary]);

  const handleDeleteExpense = async (e: Expense) => {
    if (!(await confirmExpense.confirm(e))) return;
    try {
      await api.expenses.delete(e.id);
      toast.success("Gasto borrado", "");
      reload();
    } catch {
      toast.error("Error", "No se pudo borrar el gasto");
    }
  };

  const openIncomeDialog = (inc: Income | null, source: IncomeSource = "otro") => {
    setEditingIncome(inc);
    setIncomeDialogSource(inc ? (inc.source as IncomeSource) : source);
    setShowIncomeDialog(true);
  };

  const handleDeleteIncome = async (inc: Income) => {
    if (!(await confirmIncome.confirm(inc))) return;
    try {
      await api.expenses.incomes.delete(inc.id);
      toast.success("Ingreso borrado", "");
      reload();
    } catch {
      toast.error("Error", "No se pudo borrar el ingreso");
    }
  };

  const handleReceiveIncome = async (inc: Income) => {
    try {
      await api.expenses.incomes.receive(inc.id);
      toast.success("Cobrado ✅", `${inc.description} suma al balance de hoy`);
      reload();
    } catch {
      toast.error("Error", "No se pudo marcar como cobrado");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  // Gastos agrupados por fecha (ya vienen ordenados desc del backend)
  let lastDate = "";

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Navegador de mes */}
      <div className="flex items-center justify-between gap-2 rounded-lg border bg-card px-2 py-1.5">
        <button
          onClick={() => shiftMonth(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center leading-tight">
          <span className="text-sm font-semibold capitalize">
            {monthLabel(month)}
          </span>
          {!isCurrentMonth && (
            <button
              onClick={() => setMonth(getMonthKey(new Date()))}
              className="text-[11px] text-primary hover:underline"
            >
              Volver al mes actual
            </button>
          )}
        </div>
        <button
          onClick={() => shiftMonth(1)}
          disabled={isCurrentMonth}
          className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Total del mes + insights */}
      <Card className="space-y-3 rounded-lg border p-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs text-muted-foreground">
              Total gastado en {monthLabel(month).split(" ")[0]}
            </div>
            <div className="font-mono text-3xl font-bold tabular-nums">
              {fmtARS(summary?.total || 0)}
            </div>
          </div>
          {summary?.deltaPct !== null && summary?.deltaPct !== undefined && (
            <Badge
              variant={summary.deltaPct > 0 ? "warning" : "success"}
              className="flex items-center gap-1"
            >
              {summary.deltaPct > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {summary.deltaPct > 0 ? "+" : ""}
              {summary.deltaPct}% vs mes anterior
            </Badge>
          )}
        </div>

        {(summary?.overBudget.length || 0) > 0 && (
          <div className="rounded-md bg-warning/12 px-3 py-2 text-xs font-medium text-warning">
            ⚠️ Sobre budget: {summary!.overBudget.join(", ")}
          </div>
        )}
        {(summary?.subscriptionsMonthly || 0) > 0 && (
          <div className="text-xs text-muted-foreground">
            Suscripciones activas: {fmtARS(summary!.subscriptionsMonthly)}/mes
          </div>
        )}

        {/* Balance del mes: ingresos cobrados vs gastos */}
        {balance && (balance.incomesTotal > 0 || balance.refundsTotal > 0) && (
          <div className="grid grid-cols-2 gap-2 border-t pt-3">
            <div className="rounded-md bg-muted/50 p-2 text-center">
              <div className="text-[11px] text-muted-foreground">Ingresos</div>
              <div className="font-mono text-sm font-bold tabular-nums text-success">
                +{fmtARS(balance.incomesTotal)}
              </div>
            </div>
            <div
              className={`rounded-md p-2 text-center ${
                balance.balance >= 0 ? "bg-success/10" : "bg-destructive/10"
              }`}
            >
              <div className="text-[11px] text-muted-foreground">
                Balance del mes
              </div>
              <div
                className={`font-mono text-sm font-bold tabular-nums ${
                  balance.balance >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {balance.balance >= 0 ? "+" : ""}
                {fmtARS(balance.balance)}
              </div>
            </div>
            {balance.refundsTotal > 0 && (
              <div className="col-span-2 text-xs text-muted-foreground">
                ↩️ Devoluciones: {fmtARS(balance.refundsTotal)} → gasto neto{" "}
                {fmtARS(balance.netExpenses)}
              </div>
            )}
          </div>
        )}
      </Card>

      <Button
        variant="default"
        size="xl"
        className="w-full"
        onClick={() => {
          setEditingExpense(null);
          setShowExpenseDialog(true);
        }}
      >
        <Plus className="mr-2 h-5 w-5" />
        Agregar gasto
      </Button>

      {/* Donut + desglose por categoría */}
      {pieData.length > 0 && (
        <Card className="rounded-lg border p-4">
          <h3 className="mb-2 text-sm font-semibold">Por categoría</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => fmtARS(Number(v))}
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    color: "hsl(var(--popover-foreground))",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2.5">
            {summary?.byCategory.map((c, i) => (
              <div key={c.categoryId}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: tokenColor(c.color, i) }}
                    />
                    {c.icon} {c.name}
                  </span>
                  <span className="font-mono text-xs tabular-nums">
                    {fmtARS(c.amount)}
                    {c.budget ? (
                      <span className="text-muted-foreground">
                        {" "}
                        / {fmtARS(c.budget)}
                      </span>
                    ) : null}
                  </span>
                </div>
                {c.budget ? (
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${
                        (c.budgetPct || 0) > 100
                          ? "bg-destructive"
                          : (c.budgetPct || 0) > 80
                          ? "bg-warning"
                          : "bg-success"
                      }`}
                      style={{
                        width: `${Math.min(c.budgetPct || 0, 100)}%`,
                      }}
                    />
                  </div>
                ) : null}
              </div>
            ))}
            {(summary?.uncategorized || 0) > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/35" />
                  Sin categoría
                </span>
                <span className="font-mono text-xs tabular-nums">
                  {fmtARS(summary!.uncategorized)}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Lista de gastos del mes */}
      {expenses.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Sin gastos este mes"
          description="Registrá tu primer gasto para empezar a trackear."
        />
      ) : (
        <div className="space-y-1.5">
          {expenses.map((e) => {
            const showDate = e.date !== lastDate;
            lastDate = e.date;
            const [, m, d] = e.date.split("-");
            return (
              <div key={e.id}>
                {showDate && (
                  <div className="mb-1 mt-3 text-xs font-semibold text-muted-foreground first:mt-0">
                    {d}/{m}
                  </div>
                )}
                <Card className="flex items-center gap-3 rounded-lg border p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-base">
                    {e.category?.icon || "💸"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {e.description}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {e.category?.name || "Sin categoría"}
                      {e.source === "recurring" && " · recurrente"}
                      {e.goalId && " · 🖨️ inversión 3D"}
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold tabular-nums">
                    {fmtARS(e.amount)}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <ActionIconButton
                      icon={Pencil}
                      onClick={() => {
                        setEditingExpense(e);
                        setShowExpenseDialog(true);
                      }}
                      aria-label="Editar gasto"
                    />
                    <ActionIconButton
                      icon={Trash2}
                      variant="destructive"
                      onClick={() => handleDeleteExpense(e)}
                      aria-label="Borrar gasto"
                    />
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Ingresos del mes: sueldo, ventas, devoluciones + por cobrar */}
      {balance &&
      (balance.incomes.length > 0 || balance.pending.length > 0) ? (
        <Card className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold">
              <HandCoins className="h-4 w-4 text-success" />
              Ingresos
            </h3>
            <Button size="sm" onClick={() => openIncomeDialog(null, "otro")}>
              <Plus className="mr-1 h-4 w-4" />
              Ingreso
            </Button>
          </div>
          {balance.incomes.length > 0 && (
            <div className="space-y-1.5">
              {balance.incomes.map((inc) => (
                <div key={inc.id} className="flex items-center gap-2 text-sm">
                  <span className="shrink-0 text-base">
                    {sourceLabel(inc.source).emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{inc.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {inc.date.slice(8)}/{inc.date.slice(5, 7)} ·{" "}
                      {sourceLabel(inc.source).label}
                      {inc.source === "3d" && inc.cost > 0
                        ? ` · costo ${fmtARS(inc.cost)}`
                        : ""}
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold tabular-nums text-success">
                    +{fmtARS(inc.amount)}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <ActionIconButton
                      icon={Pencil}
                      onClick={() => openIncomeDialog(inc)}
                      aria-label={`Editar ingreso ${inc.description}`}
                    />
                    <ActionIconButton
                      icon={Trash2}
                      variant="destructive"
                      onClick={() => handleDeleteIncome(inc)}
                      aria-label={`Borrar ingreso ${inc.description}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {balance.pending.length > 0 && (
            <div className="space-y-1.5 border-t pt-2">
              <div className="flex items-center gap-1 text-[11px] font-semibold uppercase text-muted-foreground">
                <Clock className="h-3 w-3" />
                Por cobrar · {fmtARS(balance.pendingTotal)}
              </div>
              {balance.pending.map((inc) => (
                <div key={inc.id} className="flex items-center gap-2 text-sm">
                  <span className="shrink-0 text-base">
                    {sourceLabel(inc.source).emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{inc.description}</div>
                    <div className="text-xs text-muted-foreground">
                      desde {inc.date.slice(8)}/{inc.date.slice(5, 7)} ·{" "}
                      {sourceLabel(inc.source).label}
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold tabular-nums text-muted-foreground">
                    {fmtARS(inc.amount)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReceiveIncome(inc)}
                  >
                    Cobrar
                  </Button>
                  <div className="flex items-center gap-0.5">
                    <ActionIconButton
                      icon={Pencil}
                      onClick={() => openIncomeDialog(inc)}
                      aria-label={`Editar ingreso ${inc.description}`}
                    />
                    <ActionIconButton
                      icon={Trash2}
                      variant="destructive"
                      onClick={() => handleDeleteIncome(inc)}
                      aria-label={`Borrar ingreso ${inc.description}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <button
          onClick={() => openIncomeDialog(null, "otro")}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground transition-colors hover:bg-muted/50"
        >
          <HandCoins className="h-4 w-4" />
          Registrar un ingreso (sueldo, venta, devolución…)
        </button>
      )}

      {/* Negocio 3D: inversión vs ganancia (linkeado al objetivo NZ) */}
      {business && (business.invested > 0 || business.incomesCount > 0) && (
        <Card className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold">
              <Printer className="h-4 w-4 text-primary" />
              Negocio 3D
            </h3>
            <Button size="sm" onClick={() => openIncomeDialog(null, "3d")}>
              <Plus className="mr-1 h-4 w-4" />
              Ingreso 3D
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md bg-muted/50 p-2">
              <div className="text-[11px] text-muted-foreground">
                Invertido
              </div>
              <div className="font-mono text-sm font-bold tabular-nums">
                {fmtARS(business.invested)}
              </div>
            </div>
            <div className="rounded-md bg-success/10 p-2">
              <div className="text-[11px] text-muted-foreground">
                Ganancia
              </div>
              <div className="font-mono text-sm font-bold tabular-nums text-success">
                {fmtARS(business.profit)}
              </div>
            </div>
            <div
              className={`rounded-md p-2 ${
                business.balance >= 0 ? "bg-success/10" : "bg-warning/10"
              }`}
            >
              <div className="text-[11px] text-muted-foreground">
                Balance
              </div>
              <div
                className={`font-mono text-sm font-bold tabular-nums ${
                  business.balance >= 0 ? "text-success" : "text-warning"
                }`}
              >
                {fmtARS(business.balance)}
              </div>
            </div>
          </div>
          {business.toRecover > 0 && (
            <div className="text-xs text-muted-foreground">
              Para recuperar la inversión faltan{" "}
              <span className="font-semibold">
                {fmtARS(business.toRecover)}
              </span>{" "}
              de ganancia.
            </div>
          )}
        </Card>
      )}

      {/* Accesos: recurrentes + categorías */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRecurringDialog(true)}
        >
          <Repeat className="mr-1.5 h-4 w-4" />
          Recurrentes ({recurring.filter((r) => r.active).length})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCategoriesDialog(true)}
        >
          <Tags className="mr-1.5 h-4 w-4" />
          Categorías
        </Button>
      </div>

      <ExpenseDialog
        open={showExpenseDialog}
        onClose={() => setShowExpenseDialog(false)}
        categories={categories}
        editing={editingExpense}
        activeGoalId={activeGoalId}
        onSaved={reload}
      />
      <IncomeDialog
        open={showIncomeDialog}
        onClose={() => setShowIncomeDialog(false)}
        activeGoalId={activeGoalId}
        editing={editingIncome}
        initialSource={incomeDialogSource}
        onSaved={reload}
      />
      <CategoriesDialog
        open={showCategoriesDialog}
        onClose={() => setShowCategoriesDialog(false)}
        categories={categories}
        onChanged={reload}
      />
      <RecurringDialog
        open={showRecurringDialog}
        onClose={() => setShowRecurringDialog(false)}
        recurring={recurring}
        categories={categories}
        onChanged={reload}
      />

      <ConfirmDialog
        open={confirmExpense.open}
        onOpenChange={confirmExpense.onOpenChange}
        onConfirm={confirmExpense.onConfirm}
        title={
          confirmExpense.payload
            ? `¿Borrar "${confirmExpense.payload.description}" (${fmtARS(
                confirmExpense.payload.amount
              )})?`
            : "¿Borrar el gasto?"
        }
        confirmLabel="Borrar"
        destructive
      />

      <ConfirmDialog
        open={confirmIncome.open}
        onOpenChange={confirmIncome.onOpenChange}
        onConfirm={confirmIncome.onConfirm}
        title={
          confirmIncome.payload
            ? `¿Borrar el ingreso "${confirmIncome.payload.description}"?`
            : "¿Borrar el ingreso?"
        }
        confirmLabel="Borrar"
        destructive
      />
    </div>
  );
}

// ── Dialog de alta/edición de gasto ─────────────────────────

function ExpenseDialog({
  open,
  onClose,
  categories,
  editing,
  activeGoalId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  editing: Expense | null;
  activeGoalId: string | null;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(todayKey());
  const [isInvestment, setIsInvestment] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(editing ? String(editing.amount) : "");
      setDescription(editing?.description || "");
      setCategoryId(editing?.categoryId || "");
      setDate(editing?.date || todayKey());
      setIsInvestment(!!editing?.goalId);
    }
  }, [open, editing]);

  const handleSave = async () => {
    const monto = parseFloat(amount);
    if (!monto || monto <= 0) {
      toast.error("Error", "Ingresá un monto válido");
      return;
    }
    if (!description.trim()) {
      toast.error("Error", "Ingresá una descripción");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        date,
        amount: monto,
        description: description.trim(),
        categoryId: categoryId || null,
        goalId: isInvestment ? activeGoalId : null,
      };
      if (editing) {
        await api.expenses.update(editing.id, payload);
        toast.success("Gasto actualizado", "");
      } else {
        await api.expenses.create(payload);
        toast.success("Gasto registrado", fmtARS(monto));
      }
      onClose();
      onSaved();
    } catch {
      toast.error("Error", "No se pudo guardar el gasto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar gasto" : "Registrar gasto"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="exp-amount">Monto (ARS)</Label>
            <Input
              id="exp-amount"
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-semibold"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="exp-desc">Descripción</Label>
            <Input
              id="exp-desc"
              placeholder="¿En qué gastaste?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="exp-cat">Categoría</Label>
              <select
                id="exp-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon ? `${c.icon} ` : ""}
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="exp-date">Fecha</Label>
              <Input
                id="exp-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          {activeGoalId && (
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
              <input
                type="checkbox"
                checked={isInvestment}
                onChange={(e) => setIsInvestment(e.target.checked)}
                className="h-4 w-4 accent-[hsl(var(--primary))]"
              />
              <span>
                🖨️ Inversión del negocio 3D
                <span className="block text-xs text-muted-foreground">
                  Filamento, repuestos, muestras… cuenta en el balance del
                  objetivo NZ
                </span>
              </span>
            </label>
          )}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : editing ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Dialog de alta/edición de ingreso (sueldo, ventas, 3D…) ─

const SOURCE_OPTIONS: { value: IncomeSource; label: string }[] = [
  { value: "sueldo", label: "💼 Sueldo" },
  { value: "venta", label: "🏷️ Venta" },
  { value: "devolucion", label: "↩️ Devolución" },
  { value: "3d", label: "🖨️ Negocio 3D" },
  { value: "otro", label: "💰 Otro" },
];

function IncomeDialog({
  open,
  onClose,
  activeGoalId,
  editing,
  initialSource,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  activeGoalId: string | null;
  editing: Income | null;
  initialSource: IncomeSource;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [cost, setCost] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayKey());
  const [source, setSource] = useState<IncomeSource>("otro");
  const [isPending, setIsPending] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(editing ? String(editing.amount) : "");
      setCost(editing && editing.cost ? String(editing.cost) : "");
      setDescription(editing?.description || "");
      setDate(editing?.date || todayKey());
      setSource(editing ? (editing.source as IncomeSource) : initialSource);
      setIsPending(editing ? editing.status === "pending" : false);
    }
  }, [open, editing, initialSource]);

  const monto = parseFloat(amount) || 0;
  const costo = source === "3d" ? parseFloat(cost) || 0 : 0;
  const ganancia = monto - costo;

  const handleSave = async () => {
    if (!monto || monto <= 0) {
      toast.error("Error", "Ingresá el monto");
      return;
    }
    if (costo < 0 || costo > monto) {
      toast.error("Error", "El costo no puede superar el monto");
      return;
    }
    if (!description.trim()) {
      toast.error("Error", "Ingresá una descripción");
      return;
    }
    setSaving(true);
    try {
      const base = {
        date,
        description: description.trim(),
        amount: monto,
        cost: costo,
        source,
        goalId: source === "3d" ? activeGoalId : null,
      };
      if (editing) {
        await api.expenses.incomes.update(editing.id, base);
        toast.success("Ingreso actualizado", "");
      } else {
        await api.expenses.incomes.create({
          ...base,
          status: isPending ? "pending" : "received",
        });
        toast.success(
          isPending ? "Quedó por cobrar" : "Ingreso registrado",
          isPending
            ? "Cuando lo cobres, tocá Cobrar"
            : source === "3d"
            ? `Ganancia ${fmtARS(ganancia)}`
            : fmtARS(monto)
        );
      }
      onClose();
      onSaved();
    } catch {
      toast.error("Error", "No se pudo guardar el ingreso");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar ingreso" : "Registrar ingreso"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="inc-source">Tipo</Label>
            <select
              id="inc-source"
              value={source}
              onChange={(e) => setSource(e.target.value as IncomeSource)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="inc-desc">Descripción</Label>
            <Input
              id="inc-desc"
              placeholder={
                source === "sueldo"
                  ? 'Ej: "Sueldo agosto"'
                  : source === "3d"
                  ? 'Ej: "Tetris x2 vendidos por Marcelito"'
                  : 'Ej: "Venta cafetera"'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="inc-amount">Monto (ARS)</Label>
              <Input
                id="inc-amount"
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="inc-date">Fecha</Label>
              <Input
                id="inc-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          {source === "3d" && (
            <div>
              <Label htmlFor="inc-cost">Parte que es costo</Label>
              <Input
                id="inc-cost"
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          )}
          {source === "3d" && monto > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-success/10 p-3">
              <span className="text-sm font-medium">Ganancia limpia</span>
              <span className="font-mono text-lg font-bold tabular-nums text-success">
                {fmtARS(ganancia)}
              </span>
            </div>
          )}
          {!editing && (
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
              <input
                type="checkbox"
                checked={isPending}
                onChange={(e) => setIsPending(e.target.checked)}
                className="h-4 w-4 accent-[hsl(var(--primary))]"
              />
              <span>
                ⏳ Todavía no lo cobré
                <span className="block text-xs text-muted-foreground">
                  Queda &quot;por cobrar&quot; y no suma al balance hasta que lo
                  marques cobrado
                </span>
              </span>
            </label>
          )}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : editing ? "Actualizar" : "Registrar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Dialog de categorías (crear / editar budget / borrar) ───

function CategoriesDialog({
  open,
  onClose,
  categories,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [budget, setBudget] = useState("");
  const confirmDelete = useConfirm<ExpenseCategory>();

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await api.expenses.categories.create({
        name: name.trim(),
        icon: icon.trim() || undefined,
        color: CHART_TOKENS[categories.length % CHART_TOKENS.length],
        monthlyBudget: budget ? parseFloat(budget) : undefined,
      });
      setName("");
      setIcon("");
      setBudget("");
      toast.success("Categoría creada", "");
      onChanged();
    } catch {
      toast.error("Error", "¿La categoría ya existe?");
    }
  };

  const handleBudgetChange = async (cat: ExpenseCategory, value: string) => {
    const monthlyBudget = value ? parseFloat(value) : null;
    try {
      await api.expenses.categories.update(cat.id, { monthlyBudget });
      onChanged();
    } catch {
      toast.error("Error", "No se pudo actualizar el budget");
    }
  };

  const handleDelete = async (cat: ExpenseCategory) => {
    if (!(await confirmDelete.confirm(cat))) return;
    try {
      await api.expenses.categories.delete(cat.id);
      toast.success("Categoría borrada", "");
      onChanged();
    } catch {
      toast.error("Error", "No se pudo borrar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Categorías y budgets</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Creá categorías para organizar tus gastos y ponerles budget
                mensual.
              </p>
            )}
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 rounded-lg border p-2.5"
              >
                <span className="text-base">{c.icon || "🏷️"}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {c.name}
                </span>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="Budget"
                  defaultValue={c.monthlyBudget ?? ""}
                  onBlur={(e) => {
                    const v = e.target.value;
                    if (v !== String(c.monthlyBudget ?? "")) {
                      handleBudgetChange(c, v);
                    }
                  }}
                  className="h-8 w-28 text-right text-xs"
                />
                <ActionIconButton
                  icon={Trash2}
                  variant="destructive"
                  onClick={() => handleDelete(c)}
                  aria-label={`Borrar categoría ${c.name}`}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
            <div className="text-xs font-semibold text-muted-foreground">
              Nueva categoría
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="🍔"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-14 text-center"
                maxLength={4}
              />
              <Input
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Budget mensual (opcional)"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="flex-1"
              />
              <Button size="sm" onClick={handleCreate} disabled={!name.trim()}>
                <Plus className="mr-1 h-4 w-4" />
                Crear
              </Button>
            </div>
          </div>

          <div className="flex justify-end border-t pt-3">
            <Button variant="outline" onClick={onClose}>
              Listo
            </Button>
          </div>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={confirmDelete.onOpenChange}
        onConfirm={confirmDelete.onConfirm}
        title={
          confirmDelete.payload
            ? `¿Borrar la categoría "${confirmDelete.payload.name}"?`
            : "¿Borrar la categoría?"
        }
        description="Los gastos quedan sin categoría."
        confirmLabel="Borrar"
        destructive
      />
    </Dialog>
  );
}

// ── Dialog de recurrentes / suscripciones ───────────────────

function RecurringDialog({
  open,
  onClose,
  recurring,
  categories,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  recurring: RecurringExpense[];
  categories: ExpenseCategory[];
  onChanged: () => void;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [day, setDay] = useState("1");
  const [kind, setKind] = useState<"recurring" | "subscription">(
    "subscription"
  );
  const [categoryId, setCategoryId] = useState("");
  const [installments, setInstallments] = useState("");
  const [startPeriod, setStartPeriod] = useState("");
  const confirmDelete = useConfirm<RecurringExpense>();

  const handleCreate = async () => {
    const monto = parseFloat(amount);
    if (!description.trim() || !monto || monto <= 0) {
      toast.error("Error", "Completá descripción y monto");
      return;
    }
    const cuotas = parseInt(installments) || null;
    if (installments && (!cuotas || cuotas < 1)) {
      toast.error("Error", "Las cuotas deben ser un número mayor a 0");
      return;
    }
    try {
      await api.expenses.recurring.create({
        description: description.trim(),
        amount: monto,
        dayOfMonth: parseInt(day) || 1,
        kind,
        categoryId: categoryId || null,
        totalInstallments: cuotas,
        startPeriod: startPeriod || null,
      });
      setDescription("");
      setAmount("");
      setDay("1");
      setInstallments("");
      setStartPeriod("");
      toast.success(
        "Recurrente creado",
        cuotas ? "Se apaga solo en la última cuota" : "Se registra solo cada mes"
      );
      onChanged();
    } catch {
      toast.error("Error", "No se pudo crear");
    }
  };

  const handleToggle = async (r: RecurringExpense) => {
    try {
      await api.expenses.recurring.update(r.id, { active: !r.active });
      onChanged();
    } catch {
      toast.error("Error", "No se pudo actualizar");
    }
  };

  const handleDelete = async (r: RecurringExpense) => {
    if (!(await confirmDelete.confirm(r))) return;
    try {
      await api.expenses.recurring.delete(r.id);
      onChanged();
    } catch {
      toast.error("Error", "No se pudo borrar");
    }
  };

  const monthlyTotal = recurring
    .filter((r) => r.active)
    .reduce((a, r) => a + r.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recurrentes y suscripciones</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {recurring.length > 0 && (
            <div className="text-xs text-muted-foreground">
              Total activo: {fmtARS(monthlyTotal)}/mes. Se registran solos el
              día indicado.
            </div>
          )}
          <div className="space-y-2">
            {recurring.map((r) => (
              <div
                key={r.id}
                className={`flex items-center gap-2 rounded-lg border p-2.5 ${
                  !r.active ? "opacity-50" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <span className="truncate">{r.description}</span>
                    {r.kind === "subscription" && (
                      <Badge variant="info" className="shrink-0 text-[10px]">
                        sub
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {fmtARS(r.amount)}/mes · día {r.dayOfMonth}
                    {r.totalInstallments ? (
                      recurringEnd(r) ? (
                        <>
                          {" "}
                          · cuota {r.installmentsPaid}/{r.totalInstallments} ·
                          termina {monthShort(recurringEnd(r)!)}
                        </>
                      ) : (
                        <> · {r.totalInstallments} cuotas ✅ terminado</>
                      )
                    ) : null}
                  </div>
                </div>
                <Switch
                  checked={r.active}
                  onCheckedChange={() => handleToggle(r)}
                  aria-label={`Activar/desactivar ${r.description}`}
                />
                <ActionIconButton
                  icon={Trash2}
                  variant="destructive"
                  onClick={() => handleDelete(r)}
                  aria-label={`Borrar ${r.description}`}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
            <div className="text-xs font-semibold text-muted-foreground">
              Nuevo recurrente
            </div>
            <Input
              placeholder="Netflix, alquiler, gimnasio…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <Input
                type="number"
                inputMode="decimal"
                placeholder="Monto/mes"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                max={28}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-20"
                aria-label="Día del mes"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="Cuotas (opcional)"
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  aria-label="Cantidad de cuotas"
                />
              </div>
              <div className="flex-1">
                <Input
                  type="month"
                  value={startPeriod}
                  onChange={(e) => setStartPeriod(e.target.value)}
                  aria-label="Primer mes de la cuota (puede ser pasado)"
                  title="Primer mes (puede ser pasado: los meses ya transcurridos cuentan pagados)"
                />
              </div>
            </div>
            {installments && (
              <div className="text-[11px] text-muted-foreground">
                {startPeriod
                  ? `Arrancó ${monthShort(startPeriod)} — los meses ya pasados cuentan como cuotas pagadas.`
                  : "Tip: si ya venís pagándolo, poné el primer mes (puede ser pasado)."}
              </div>
            )}
            <div className="flex gap-2">
              <select
                value={kind}
                onChange={(e) =>
                  setKind(e.target.value as "recurring" | "subscription")
                }
                className="h-9 flex-1 rounded-md border bg-background px-2 text-sm"
                aria-label="Tipo"
              >
                <option value="subscription">Suscripción</option>
                <option value="recurring">Pago fijo</option>
              </select>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-9 flex-1 rounded-md border bg-background px-2 text-sm"
                aria-label="Categoría"
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon ? `${c.icon} ` : ""}
                    {c.name}
                  </option>
                ))}
              </select>
              <Button size="sm" onClick={handleCreate}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end border-t pt-3">
            <Button variant="outline" onClick={onClose}>
              Listo
            </Button>
          </div>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={confirmDelete.onOpenChange}
        onConfirm={confirmDelete.onConfirm}
        title={
          confirmDelete.payload
            ? `¿Borrar "${confirmDelete.payload.description}"?`
            : "¿Borrar el recurrente?"
        }
        confirmLabel="Borrar"
        destructive
      />
    </Dialog>
  );
}
