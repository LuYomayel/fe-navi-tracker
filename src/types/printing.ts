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
  active: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  // Calculados en vivo con las settings vigentes (no se guardan)
  cost: number;
  priceToMarcelito: number;
  profit: number;
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
  expenseId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PrintSaleKind = "venta" | "muestra";
export type PrintSaleStatus = "a_liquidar" | "liquidado";

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
  createdAt: string;
  updatedAt: string;
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
