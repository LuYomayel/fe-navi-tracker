"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast-helper";
import type {
  CreateFilamentDto,
  CreatePrintProductDto,
  CreatePrintSaleDto,
  Filament,
  PrintProduct,
  PrintSale,
  PrintSettings,
  PrintingSummary,
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      setIsLoading(true);
      // allSettled, no all: si una sola llamada falla, con Promise.all no se
      // setea NADA y la pantalla queda en esqueleto para siempre.
      const [s, p, f, v, r] = await Promise.allSettled([
        api.printing.settings.get(),
        api.printing.products.list(),
        api.printing.filaments.list(),
        api.printing.sales.list(),
        api.printing.summary(),
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

      if ([s, p, f, v, r].some((x) => x.status === "rejected")) {
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

  return {
    settings,
    products,
    filaments,
    sales,
    summary,
    isLoading,
    isSubmitting,
    loadAll,
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
