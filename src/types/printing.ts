// Negocio de impresion 3D: modulo AUTONOMO (no depende de Goal/Objetivo).
// El catalogo, los filamentos, las ventas y el balance salen de sus propias
// tablas en el backend. Ver backend/src/modules/printing.

export interface PrintSettings {
  id: string;
  userId: string;
  costPerGram: number;
  wastePct: number; // 0.15 = 15%
  powerPerHour: number;
  defaultMarkup: number; // 1.3 = x1.3
  publicToken: string;
  financingSurcharge: number; // recargo de financiacion (aparte, no prorrateado)
  createdAt: string;
  updatedAt: string;
}

export interface PrintProduct {
  id: string;
  userId: string;
  name: string;
  author?: string | null;
  makerworldUrl?: string | null;
  grams: number;
  hours: number;
  colorsLabel: string; // "1", "7", "multi"
  sizeMm?: string | null;
  licenseOk: boolean;
  markupOverride?: number | null;
  publicPrice?: number | null;
  colorBreakdown?: ColorBreakdownEntry[] | null;
  active: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  photos: PrintProductPhoto[];
  // Calculados en vivo con las settings vigentes (no se guardan)
  cost: number;
  priceToMarcelito: number;
  profit: number;
}

export interface ColorBreakdownEntry {
  color?: string | null;
  colorHex?: string | null;
  grams: number;
}

export interface PrintProductPhoto {
  id: string;
  productId: string;
  path: string;
  order: number;
  url: string; // relativa al host de la API (/uploads/...)
}

export interface Filament {
  id: string;
  userId: string;
  brand: string;
  material: string;
  color: string;
  pricePaid: number;
  grams: number;
  pricePerGram: number;
  purchasedAt: string; // YYYY-MM-DD
  discarded: boolean;
  discardReason?: string | null;
  gramsLeft?: number | null;
  colorHex?: string | null;
  finishedAt?: string | null;
  expenseId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PrintSaleKind = "venta" | "muestra";
export type PrintSaleStatus = "a_liquidar" | "parcial" | "liquidado";

export interface PrintSaleSettlement {
  id: string;
  saleId: string;
  date: string;
  amount: number;
  qty?: number | null;
  incomeId?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface PrintSale {
  id: string;
  userId: string;
  date: string;
  productId: string;
  product?: PrintProduct;
  kind: PrintSaleKind;
  qty: number;
  chargedUnit: number;
  costUnit: number;
  status: PrintSaleStatus;
  channel?: string | null;
  notes?: string | null;
  incomeId?: string | null;
  orderId?: string | null;
  createdAt: string;
  updatedAt: string;
  settlements: PrintSaleSettlement[];
  // Computados por el backend (legacy-aware)
  total: number;
  settledAmount: number;
  remaining: number;
}

export interface PrintingSummary {
  investedFilament: number;
  filamentsCount: number;
  investedSamples: number;
  samplesCount: number;
  profitSalesSettled: number;
  profitSalesPending: number;
  profitSalesTotal: number;
  salesCount: number;
  result: number; // ganancia de ventas - invertido en muestras
  missingToCoverFilament: number;
}

/** Lo unico que ve Marcelito en /catalogo/[token]: nunca costo/ganancia de Luciano. */
export interface PublicCatalogItem {
  id: string;
  name: string;
  colorsLabel: string;
  sizeMm?: string | null;
  makerworldUrl?: string | null;
  photos: string[]; // URLs relativas al host de la API
  priceToMarcelito: number; // lo que le cuesta a Marcelito
  publicPrice?: number | null; // precio sugerido de venta
  marcelitoProfit?: number | null; // su ganancia revendiendo
}

export interface CreatePrintProductDto {
  name: string;
  author?: string;
  makerworldUrl?: string;
  grams: number;
  hours: number;
  colorsLabel: string;
  sizeMm?: string;
  licenseOk?: boolean;
  markupOverride?: number | null;
  publicPrice?: number | null;
  colorBreakdown?: ColorBreakdownEntry[] | null;
  active?: boolean;
  notes?: string;
}

export type UpdatePrintProductDto = Partial<CreatePrintProductDto>;

export interface CreateFilamentDto {
  brand: string;
  material: string;
  color: string;
  pricePaid: number;
  grams?: number;
  purchasedAt: string;
  discarded?: boolean;
  discardReason?: string;
  gramsLeft?: number;
  colorHex?: string;
  notes?: string;
}

export type UpdateFilamentDto = Partial<CreateFilamentDto>;

export interface CreatePrintSaleDto {
  date: string;
  productId: string;
  kind?: PrintSaleKind;
  qty?: number;
  chargedUnit?: number;
  costUnit?: number;
  status?: PrintSaleStatus;
  channel?: string;
  notes?: string;
}

export type UpdatePrintSaleDto = Partial<Omit<CreatePrintSaleDto, "productId">>;

export type UpdatePrintSettingsDto = Partial<
  Pick<
    PrintSettings,
    "costPerGram" | "wastePct" | "powerPerHour" | "defaultMarkup" | "financingSurcharge"
  >
>;


// ── Pedidos (Marcelito) ──────────────────────────────────────

export type PrintOrderStatus =
  | "pedido"
  | "confirmado"
  | "imprimiendo"
  | "listo"
  | "entregado"
  | "cancelado";

export interface PrintOrderItem {
  id: string;
  orderId: string;
  productId: string;
  qty: number;
  unitPrice: number;
  product?: PrintProduct;
}

export interface PrintOrder {
  id: string;
  customerName: string;
  status: PrintOrderStatus;
  notes?: string | null;
  createdAt: string;
  items: PrintOrderItem[];
  sales?: PrintSale[];
}

export interface PublicOrderItem {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

export interface PublicOrder {
  id: string;
  customerName: string;
  status: PrintOrderStatus;
  notes?: string | null;
  createdAt: string;
  items: PublicOrderItem[];
  total: number;
  paid: number;
  due: number;
  paymentStatus: "pagado" | "parcial" | "debe" | null;
  noticePending: boolean;
}

export interface PrintPaymentNotice {
  id: string;
  orderId?: string | null;
  amount?: number | null;
  message?: string | null;
  status: "pendiente" | "confirmado" | "descartado";
  createdAt: string;
}

export interface PayOrderResult {
  applied: { saleId: string; amount: number }[];
  totalApplied: number;
  remaining: number;
}

// ── Stock / impresiones ──────────────────────────────────────

export interface ColorStock {
  color: string;
  colorHex: string | null;
  totalGrams: number;
  rolls: {
    id: string;
    brand?: string;
    material?: string;
    gramsLeft: number;
    purchasedAt: string;
  }[];
}

export interface StockSummary {
  colors: ColorStock[];
  untrackedRolls: number;
}

export interface StockCheckResult {
  ok: boolean;
  perColor: {
    color: string;
    needed: number;
    available: number;
    missing: number;
    matched: boolean;
  }[];
  fallback: { needed: number; available: number; ok: boolean } | null;
  productsWithoutBreakdown: string[];
  untrackedRolls: number;
}

export interface PrintJob {
  id: string;
  productId?: string | null;
  product?: PrintProduct | null;
  title: string;
  date: string;
  grams?: number | null;
  hours?: number | null;
  filamentsUsed?: ColorBreakdownEntry[] | null;
  source: "manual" | "bambu";
  status: "ok" | "fallida";
  stockApplied: boolean;
  notes?: string | null;
  createdAt: string;
}

export interface BambuStatus {
  connected: boolean;
  region: string;
  lastSyncAt: string | null;
}

export interface AddSettlementDto {
  amount?: number;
  qty?: number;
  date?: string;
  notes?: string;
}

export interface CreatePrintJobDto {
  title: string;
  productId?: string;
  date?: string;
  grams?: number;
  hours?: number;
  filamentsUsed?: { color?: string; colorHex?: string; grams: number }[];
  notes?: string;
}
