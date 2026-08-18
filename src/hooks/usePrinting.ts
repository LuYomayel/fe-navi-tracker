"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import { fmtARS } from "@/lib/utils";
import type {
  AddSettlementDto,
  BambuStatus,
  CreateFilamentDto,
  CreatePrintJobDto,
  CreatePrintProductDto,
  CreatePrintSaleDto,
  Filament,
  PrintJob,
  PrintOrder,
  PrintOrderStatus,
  PrintPaymentNotice,
  PrintProduct,
  PrintSale,
  PrintSettings,
  PrintingSummary,
  StockCheckResult,
  StockSummary,
  UpdateFilamentDto,
  UpdatePrintProductDto,
  UpdatePrintSaleDto,
  UpdatePrintSettingsDto,
} from "@/types/printing";

/**
 * Hook autocontenido del negocio 3D (patron useGoals/useMealPrep). Modulo
 * AUTONOMO: no toca nada de Goal/Objetivo, solo lee/escribe /api/printing/*.
 */
export function usePrinting() {
  const [settings, setSettings] = useState<PrintSettings | null>(null);
  const [products, setProducts] = useState<PrintProduct[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [sales, setSales] = useState<PrintSale[]>([]);
  const [summary, setSummary] = useState<PrintingSummary | null>(null);
  const [orders, setOrders] = useState<PrintOrder[]>([]);
  const [notices, setNotices] = useState<PrintPaymentNotice[]>([]);
  const [stock, setStock] = useState<StockSummary | null>(null);
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [bambuStatus, setBambuStatus] = useState<BambuStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      setIsLoading(true);
      // allSettled, no all: si una sola llamada falla, con Promise.all no se
      // setea NADA y la pantalla queda en esqueleto para siempre.
      const [s, p, f, v, r, o, n, st, j, b] = await Promise.allSettled([
        api.printing.settings.get(),
        api.printing.products.list(),
        api.printing.filaments.list(),
        api.printing.sales.list(),
        api.printing.summary(),
        api.printing.orders.list(),
        api.printing.notices.list(),
        api.printing.stock.get(),
        api.printing.jobs.list(),
        api.printing.bambu.status(),
      ]);
      const ok = <T,>(res: PromiseSettledResult<{ success: boolean; data: unknown }>): T | null =>
        res.status === "fulfilled" && res.value?.success
          ? (res.value.data as T)
          : null;

      const settingsData = ok<PrintSettings>(s);
      if (settingsData) setSettings(settingsData);
      setProducts(ok<PrintProduct[]>(p) ?? []);
      setFilaments(ok<Filament[]>(f) ?? []);
      setSales(ok<PrintSale[]>(v) ?? []);
      const summaryData = ok<PrintingSummary>(r);
      if (summaryData) setSummary(summaryData);
      setOrders(ok<PrintOrder[]>(o) ?? []);
      setNotices(ok<PrintPaymentNotice[]>(n) ?? []);
      const stockData = ok<StockSummary>(st);
      if (stockData) setStock(stockData);
      setJobs(ok<PrintJob[]>(j) ?? []);
      const bambuData = ok<BambuStatus>(b);
      if (bambuData) setBambuStatus(bambuData);

      if ([s, p, f, v, r, o, n, st, j, b].some((x) => x.status === "rejected")) {
        toast.error("Algunos datos del negocio 3D no cargaron");
      }
    } catch (error) {
      console.error("Error cargando el negocio 3D:", error);
      toast.error("No se pudo cargar el negocio 3D");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reloadSummary = useCallback(async () => {
    const r = await api.printing.summary();
    if (r.success) setSummary(r.data as PrintingSummary);
  }, []);

  // ── Settings ──────────────────────────────────────────────
  const updateSettings = useCallback(
    async (data: UpdatePrintSettingsDto) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.settings.update(data);
        if (res.success) {
          setSettings(res.data as PrintSettings);
          toast.success("Parametros actualizados");
          await Promise.all([
            reloadSummary(),
            api.printing.products.list().then((p) => {
              if (p.success) setProducts((p.data as PrintProduct[]) ?? []);
            }),
          ]);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error actualizando settings:", error);
        toast.error("No se pudieron actualizar los parametros");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadSummary],
  );

  const regenerateToken = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const res = await api.printing.settings.regenerateToken();
      if (res.success) {
        setSettings(res.data as PrintSettings);
        toast.success("Nuevo link generado (el anterior dejo de funcionar)");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error regenerando token:", error);
      toast.error("No se pudo regenerar el link");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // ── Productos ─────────────────────────────────────────────
  const createProduct = useCallback(async (data: CreatePrintProductDto) => {
    try {
      setIsSubmitting(true);
      const res = await api.printing.products.create(data);
      if (res.success) {
        setProducts((prev) => [...prev, res.data as PrintProduct]);
        toast.success("Producto creado");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creando producto:", error);
      toast.error(error instanceof Error ? error.message : "Error al crear el producto");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateProduct = useCallback(
    async (id: string, data: UpdatePrintProductDto) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.products.update(id, data);
        if (res.success) {
          setProducts((prev) =>
            prev.map((p) => (p.id === id ? (res.data as PrintProduct) : p)),
          );
          toast.success("Producto actualizado");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error actualizando producto:", error);
        toast.error(error instanceof Error ? error.message : "Error al actualizar");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const deleteProduct = useCallback(async (id: string) => {
    try {
      setIsSubmitting(true);
      const res = await api.printing.products.delete(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        toast.success("Producto borrado");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error borrando producto:", error);
      toast.error("No se pudo borrar el producto");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // ── Filamentos ────────────────────────────────────────────
  const createFilament = useCallback(
    async (data: CreateFilamentDto) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.filaments.create(data);
        if (res.success) {
          setFilaments((prev) => [res.data as Filament, ...prev]);
          toast.success("Filamento registrado");
          await reloadSummary();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error creando filamento:", error);
        toast.error(error instanceof Error ? error.message : "Error al registrar");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadSummary],
  );

  const updateFilament = useCallback(
    async (id: string, data: UpdateFilamentDto) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.filaments.update(id, data);
        if (res.success) {
          setFilaments((prev) =>
            prev.map((f) => (f.id === id ? (res.data as Filament) : f)),
          );
          toast.success("Filamento actualizado");
          await reloadSummary();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error actualizando filamento:", error);
        toast.error("No se pudo actualizar");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadSummary],
  );

  const deleteFilament = useCallback(
    async (id: string) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.filaments.delete(id);
        if (res.success) {
          setFilaments((prev) => prev.filter((f) => f.id !== id));
          toast.success("Filamento borrado");
          await reloadSummary();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error borrando filamento:", error);
        toast.error("No se pudo borrar el filamento");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadSummary],
  );

  // ── Ventas / muestras ─────────────────────────────────────
  const createSale = useCallback(
    async (data: CreatePrintSaleDto) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.sales.create(data);
        if (res.success) {
          const [salesRes] = await Promise.all([
            api.printing.sales.list(),
            reloadSummary(),
          ]);
          if (salesRes.success) setSales((salesRes.data as PrintSale[]) ?? []);
          toast.success(
            data.kind === "muestra" ? "Muestra registrada" : "Venta registrada",
          );
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error creando venta:", error);
        toast.error(error instanceof Error ? error.message : "Error al registrar");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadSummary],
  );

  const updateSale = useCallback(
    async (id: string, data: UpdatePrintSaleDto) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.sales.update(id, data);
        if (res.success) {
          const salesRes = await api.printing.sales.list();
          if (salesRes.success) setSales((salesRes.data as PrintSale[]) ?? []);
          await reloadSummary();
          toast.success("Venta actualizada");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error actualizando venta:", error);
        toast.error("No se pudo actualizar");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadSummary],
  );

  const deleteSale = useCallback(
    async (id: string) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.sales.delete(id);
        if (res.success) {
          setSales((prev) => prev.filter((s) => s.id !== id));
          await reloadSummary();
          toast.success("Venta borrada");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error borrando venta:", error);
        toast.error("No se pudo borrar la venta");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadSummary],
  );

  const liquidarSale = useCallback(
    async (id: string) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.sales.liquidar(id);
        if (res.success) {
          setSales((prev) =>
            prev.map((s) => (s.id === id ? { ...s, ...(res.data as PrintSale) } : s)),
          );
          await reloadSummary();
          toast.success("Venta liquidada: se registro el ingreso");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error liquidando venta:", error);
        toast.error(error instanceof Error ? error.message : "No se pudo liquidar");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadSummary],
  );

  const reloadSales = useCallback(async () => {
    const [salesRes, stockRes] = await Promise.all([
      api.printing.sales.list(),
      api.printing.stock.get(),
    ]);
    if (salesRes.success) setSales((salesRes.data as PrintSale[]) ?? []);
    if (stockRes.success) setStock(stockRes.data as StockSummary);
  }, []);

  // ── Liquidaciones parciales ───────────────────────────────
  const addSettlement = useCallback(
    async (saleId: string, data: AddSettlementDto) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.sales.settlements.add(saleId, data);
        if (res.success) {
          const salesRes = await api.printing.sales.list();
          if (salesRes.success) setSales((salesRes.data as PrintSale[]) ?? []);
          await reloadSummary();
          toast.success("Pago registrado");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error registrando pago:", error);
        toast.error(error instanceof Error ? error.message : "No se pudo registrar el pago");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadSummary],
  );

  const deleteSettlement = useCallback(
    async (id: string) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.sales.settlements.delete(id);
        if (res.success) {
          const salesRes = await api.printing.sales.list();
          if (salesRes.success) setSales((salesRes.data as PrintSale[]) ?? []);
          await reloadSummary();
          toast.success("Pago borrado");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error borrando pago:", error);
        toast.error("No se pudo borrar el pago");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadSummary],
  );

  // ── Fotos ─────────────────────────────────────────────────
  const reloadProducts = useCallback(async () => {
    const res = await api.printing.products.list();
    if (res.success) setProducts((res.data as PrintProduct[]) ?? []);
  }, []);

  const addPhoto = useCallback(
    async (productId: string, dataUrl: string) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.photos.add(productId, dataUrl);
        if (res.success) {
          await reloadProducts();
          toast.success("Foto agregada");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error subiendo foto:", error);
        toast.error(error instanceof Error ? error.message : "No se pudo subir la foto");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadProducts],
  );

  const deletePhoto = useCallback(
    async (photoId: string) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.photos.delete(photoId);
        if (res.success) {
          await reloadProducts();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error borrando foto:", error);
        toast.error("No se pudo borrar la foto");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadProducts],
  );

  const setCoverPhoto = useCallback(
    async (productId: string, photoId: string, allIds: string[]) => {
      try {
        const ids = [photoId, ...allIds.filter((i) => i !== photoId)];
        const res = await api.printing.photos.reorder(productId, ids);
        if (res.success) {
          await reloadProducts();
          toast.success("Portada actualizada");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error reordenando fotos:", error);
        return false;
      }
    },
    [reloadProducts],
  );

  // ── Pedidos + avisos ──────────────────────────────────────
  const updateOrderStatus = useCallback(
    async (id: string, status: PrintOrderStatus) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.orders.updateStatus(id, status);
        if (res.success) {
          const [ordersRes] = await Promise.all([
            api.printing.orders.list(),
            // entregar un pedido crea ventas → refrescarlas junto al resumen
            status === "entregado" ? reloadSales() : Promise.resolve(),
            status === "entregado" ? reloadSummary() : Promise.resolve(),
          ]);
          if (ordersRes.success) setOrders((ordersRes.data as PrintOrder[]) ?? []);
          toast.success(
            status === "entregado"
              ? "Pedido entregado: se crearon las ventas a liquidar"
              : `Pedido ${status}`,
          );
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error actualizando pedido:", error);
        toast.error(error instanceof Error ? error.message : "No se pudo actualizar");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadSales, reloadSummary],
  );

  const deleteOrder = useCallback(async (id: string) => {
    try {
      setIsSubmitting(true);
      const res = await api.printing.orders.delete(id);
      if (res.success) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        toast.success("Pedido borrado");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error borrando pedido:", error);
      toast.error(error instanceof Error ? error.message : "No se pudo borrar");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const resolveNotice = useCallback(
    async (id: string, status: "confirmado" | "descartado") => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.notices.resolve(id, status);
        if (res.success) {
          setNotices((prev) => prev.filter((n) => n.id !== id));
          if (status === "confirmado") {
            // Confirmar REGISTRA el pago: refrescar ventas, pedidos y balance
            const d = res.data as { applied?: { totalApplied: number } | null };
            const [ordersRes] = await Promise.all([
              api.printing.orders.list(),
              reloadSales(),
              reloadSummary(),
            ]);
            if (ordersRes.success)
              setOrders((ordersRes.data as PrintOrder[]) ?? []);
            toast.success(
              d.applied
                ? `Pago registrado: ${fmtARS(d.applied.totalApplied)}`
                : "Aviso confirmado (el pedido ya estaba saldado)",
            );
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error resolviendo aviso:", error);
        toast.error(error instanceof Error ? error.message : "No se pudo resolver el aviso");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadSales, reloadSummary],
  );

  const reloadOrders = useCallback(async () => {
    const res = await api.printing.orders.list();
    if (res.success) setOrders((res.data as PrintOrder[]) ?? []);
  }, []);

  const createOrder = useCallback(
    async (data: {
      customerName?: string;
      items: { productId: string; qty: number; unitPrice?: number }[];
      notes?: string;
      status?: PrintOrderStatus;
    }) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.orders.create(data);
        if (res.success) {
          await Promise.all([
            reloadOrders(),
            // un pedido creado ya entregado genera ventas
            data.status === "entregado" ? reloadSales() : Promise.resolve(),
          ]);
          toast.success("Pedido creado");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error creando pedido:", error);
        toast.error(error instanceof Error ? error.message : "No se pudo crear el pedido");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadOrders, reloadSales],
  );

  const updateOrder = useCallback(
    async (
      id: string,
      data: {
        customerName?: string;
        notes?: string;
        items?: { productId: string; qty: number; unitPrice?: number }[];
      },
    ) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.orders.update(id, data);
        if (res.success) {
          await reloadOrders();
          toast.success("Pedido actualizado");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error editando pedido:", error);
        toast.error(error instanceof Error ? error.message : "No se pudo editar el pedido");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadOrders],
  );

  const payOrder = useCallback(
    async (id: string, amount?: number) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.orders.pay(id, amount);
        if (res.success) {
          const d = res.data as { totalApplied: number; remaining: number };
          const [ordersRes] = await Promise.all([
            api.printing.orders.list(),
            reloadSales(),
            reloadSummary(),
          ]);
          if (ordersRes.success)
            setOrders((ordersRes.data as PrintOrder[]) ?? []);
          toast.success(
            d.remaining > 0
              ? `Pago de ${fmtARS(d.totalApplied)} registrado · restan ${fmtARS(d.remaining)}`
              : `Cobrado ${fmtARS(d.totalApplied)}: pedido saldado`,
          );
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error cobrando pedido:", error);
        toast.error(error instanceof Error ? error.message : "No se pudo cobrar");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadSales, reloadSummary],
  );

  // ── Stock / impresiones ───────────────────────────────────
  const checkStock = useCallback(
    async (items: { productId: string; qty: number }[]) => {
      try {
        const res = await api.printing.stock.check(items);
        return res.success ? (res.data as StockCheckResult) : null;
      } catch (error) {
        console.error("Error chequeando stock:", error);
        return null;
      }
    },
    [],
  );

  const finishFilament = useCallback(
    async (id: string) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.stock.finishFilament(id);
        if (res.success) {
          const [fRes] = await Promise.all([
            api.printing.filaments.list(),
            api.printing.stock.get().then((r) => {
              if (r.success) setStock(r.data as StockSummary);
            }),
          ]);
          if (fRes.success) setFilaments((fRes.data as Filament[]) ?? []);
          toast.success("Rollo marcado como terminado");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error terminando rollo:", error);
        toast.error("No se pudo marcar el rollo");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  const reloadJobsAndStock = useCallback(async () => {
    const [jRes, stRes, fRes] = await Promise.all([
      api.printing.jobs.list(),
      api.printing.stock.get(),
      api.printing.filaments.list(),
    ]);
    if (jRes.success) setJobs((jRes.data as PrintJob[]) ?? []);
    if (stRes.success) setStock(stRes.data as StockSummary);
    if (fRes.success) setFilaments((fRes.data as Filament[]) ?? []);
  }, []);

  const createJob = useCallback(
    async (data: CreatePrintJobDto) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.jobs.create(data);
        if (res.success) {
          await reloadJobsAndStock();
          const d = res.data as { unmatchedGrams?: number };
          if (d?.unmatchedGrams && d.unmatchedGrams > 0) {
            toast.error(
              `Impresión registrada, pero ${Math.round(d.unmatchedGrams)}g no matchearon ningún rollo`,
            );
          } else {
            toast.success("Impresión registrada y stock descontado");
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error registrando impresión:", error);
        toast.error(error instanceof Error ? error.message : "No se pudo registrar");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadJobsAndStock],
  );

  const deleteJob = useCallback(
    async (id: string) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.jobs.delete(id);
        if (res.success) {
          await reloadJobsAndStock();
          toast.success("Impresión borrada (stock devuelto)");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error borrando impresión:", error);
        toast.error("No se pudo borrar");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadJobsAndStock],
  );

  const linkJob = useCallback(
    async (id: string, productId: string | null) => {
      try {
        const res = await api.printing.jobs.link(id, productId);
        if (res.success) {
          const jRes = await api.printing.jobs.list();
          if (jRes.success) setJobs((jRes.data as PrintJob[]) ?? []);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error linkeando impresión:", error);
        return false;
      }
    },
    [],
  );

  const learnJob = useCallback(
    async (id: string, units: number) => {
      try {
        setIsSubmitting(true);
        const res = await api.printing.jobs.learn(id, units);
        if (res.success) {
          await reloadProducts();
          toast.success("Consumo por color copiado al producto");
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error aprendiendo consumo:", error);
        toast.error(error instanceof Error ? error.message : "No se pudo copiar");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadProducts],
  );

  // ── Bambu ─────────────────────────────────────────────────
  const connectBambu = useCallback(async (token: string) => {
    try {
      setIsSubmitting(true);
      const res = await api.printing.bambu.connect(token);
      if (res.success) {
        const st = await api.printing.bambu.status();
        if (st.success) setBambuStatus(st.data as BambuStatus);
        toast.success("Bambu conectado: las impresiones se van a sincronizar solas");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error conectando Bambu:", error);
      toast.error(error instanceof Error ? error.message : "No se pudo conectar");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const disconnectBambu = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const res = await api.printing.bambu.disconnect();
      if (res.success) {
        setBambuStatus((prev) => (prev ? { ...prev, connected: false } : prev));
        toast.success("Bambu desconectado");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error desconectando Bambu:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const syncBambu = useCallback(async () => {
    try {
      setIsSubmitting(true);
      const res = await api.printing.bambu.sync();
      if (res.success) {
        const d = res.data as { created: number; unmatchedGrams: number };
        await reloadJobsAndStock();
        const st = await api.printing.bambu.status();
        if (st.success) setBambuStatus(st.data as BambuStatus);
        toast.success(
          d.created
            ? `${d.created} impresión${d.created === 1 ? "" : "es"} sincronizada${d.created === 1 ? "" : "s"}`
            : "Sin impresiones nuevas",
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error sincronizando Bambu:", error);
      toast.error(error instanceof Error ? error.message : "No se pudo sincronizar");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [reloadJobsAndStock]);

  return {
    settings,
    products,
    filaments,
    sales,
    summary,
    orders,
    notices,
    stock,
    jobs,
    bambuStatus,
    isLoading,
    isSubmitting,
    loadAll,
    addSettlement,
    deleteSettlement,
    addPhoto,
    deletePhoto,
    setCoverPhoto,
    updateOrderStatus,
    deleteOrder,
    createOrder,
    updateOrder,
    resolveNotice,
    payOrder,
    checkStock,
    finishFilament,
    createJob,
    deleteJob,
    linkJob,
    learnJob,
    connectBambu,
    disconnectBambu,
    syncBambu,
    updateSettings,
    regenerateToken,
    createProduct,
    updateProduct,
    deleteProduct,
    createFilament,
    updateFilament,
    deleteFilament,
    createSale,
    updateSale,
    deleteSale,
    liquidarSale,
  };
}
