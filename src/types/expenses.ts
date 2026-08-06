export interface ExpenseCategory {
  id: string;
  userId: string;
  name: string;
  icon?: string | null;
  color?: string | null; // token chart-1..chart-5
  monthlyBudget?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  description: string;
  categoryId?: string | null;
  category?: ExpenseCategory | null;
  source: "manual" | "recurring";
  recurringExpenseId?: string | null;
  goalId?: string | null; // inversión para un objetivo (negocio 3D → NZ)
  createdAt: string;
  updatedAt: string;
}

export type IncomeSource = "3d" | "sueldo" | "devolucion" | "venta" | "otro";

export interface Income {
  id: string;
  userId: string;
  date: string;
  description: string;
  amount: number; // cobrado
  cost: number; // porción costo; ganancia = amount - cost
  source: IncomeSource | string;
  status: "received" | "pending"; // pending = por cobrar
  goalId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyBalance {
  month: string;
  expensesTotal: number;
  incomesTotal: number; // cobrados, sin devoluciones
  refundsTotal: number; // devoluciones (descuentan gasto)
  netExpenses: number; // gastos - devoluciones
  balance: number; // ingresos + devoluciones - gastos
  bySource: { source: string; amount: number; count: number }[];
  incomes: Income[];
  pendingTotal: number;
  pending: Income[];
}

export interface BusinessSummary {
  invested: number;
  investmentsCount: number;
  incomeTotal: number;
  costRecovered: number;
  profit: number;
  balance: number;
  toRecover: number;
  incomesCount: number;
}

export interface RecurringExpense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  categoryId?: string | null;
  category?: ExpenseCategory | null;
  dayOfMonth: number;
  kind: "recurring" | "subscription";
  active: boolean;
  lastPostedPeriod?: string | null;
  totalInstallments?: number | null; // cantidad de cuotas (null = sin fin)
  installmentsPaid: number; // cuotas ya pagadas
  startPeriod?: string | null; // YYYY-MM de la primera cuota (puede ser pasado)
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  month: string;
  total: number;
  prevMonthTotal: number;
  deltaPct: number | null;
  byCategory: {
    categoryId: string;
    name: string;
    icon?: string | null;
    color?: string | null;
    amount: number;
    budget?: number | null;
    budgetPct: number | null;
  }[];
  uncategorized: number;
  overBudget: string[];
  subscriptionsMonthly: number;
  recurringMonthly: number;
  topExpenses: { id: string; date: string; description: string; amount: number }[];
}

export interface MonthProjection {
  month: string;
  today: string;
  ingresosCobrados: number;
  gastosEjecutados: number;
  saldoHoy: number;
  gastosFuturos: { id: string; date: string; amount: number; description: string }[];
  gastosFuturosTotal: number;
  recurrentesPorVenir: {
    id: string;
    description: string;
    amount: number;
    dayOfMonth: number;
    cuota: string | null;
  }[];
  recurrentesPorVenirTotal: number;
  ingresosEsperados: { id: string; date: string; amount: number; description: string }[];
  ingresosEsperadosTotal: number;
  disponibleProyectado: number;
  tarjetaPendiente: { id: string; date: string; amount: number; description: string }[];
  tarjetaPendienteTotal: number;
}
