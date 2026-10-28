"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { PillToggle } from "@/components/ui/pill-toggle";
import { ActionIconButton } from "@/components/ui/action-icon-button";
import { usePrinting } from "@/hooks/usePrinting";
import CatalogTab from "@/components/printing/CatalogTab";
import FilamentsTab from "@/components/printing/FilamentsTab";
import SalesTab from "@/components/printing/SalesTab";
import BalanceTab from "@/components/printing/BalanceTab";
import OrdersTab from "@/components/printing/OrdersTab";
import PartsTab from "@/components/printing/PartsTab";
import SettingsDialog from "@/components/printing/SettingsDialog";
import { fmtARS } from "@/lib/utils";
import { LY_BRAND_CLASS } from "@/lib/ly-brand";
import { cssHex } from "@/lib/filament-colors";
import { Settings } from "lucide-react";

type NegocioTab =
  | "balance"
  | "pedidos"
  | "ventas"
  | "catalogo"
  | "piezas"
  | "filamentos";

const isTab = (v: string | null): v is NegocioTab =>
  v === "balance" ||
  v === "pedidos" ||
  v === "ventas" ||
  v === "catalogo" ||
  v === "piezas" ||
  v === "filamentos";

/**
 * Negocio de impresión 3D. Módulo AUTÓNOMO: no cuelga del objetivo activo
 * (el objetivo puede cambiar en un año y esto sigue), aunque lo que se cobra
 * alimente el fondo que esté vigente.
 */
export default function NegocioPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<NegocioTab>("balance");
  const [showSettings, setShowSettings] = useState(false);

  const {
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
    parts,
    partsLoading,
    loadParts,
    movePart,
    isLoading,
    isSubmitting,
    loadAll,
    updateSettings,
    resellers,
    createReseller,
    updateReseller,
    regenerateResellerToken,
    createProduct,
    updateProduct,
    deleteProduct,
    createFilament,
    updateFilament,
    deleteFilament,
    createSale,
    deleteSale,
    addSettlement,
    deleteSettlement,
    addPhoto,
    deletePhoto,
    setCoverPhoto,
    updateOrderStatus,
    deleteOrder,
    createOrder,
    updateOrder,
    payOrder,
    resolveNotice,
    finishFilament,
    createJob,
    deleteJob,
    linkJob,
    learnJob,
    reassignJob,
    connectBambu,
    disconnectBambu,
    syncBambu,
  } = usePrinting();

  // Badge en la tab: pedidos activos + avisos de pago sin resolver
  const pendingOrders =
    orders.filter((o) => o.status !== "entregado" && o.status !== "cancelado")
      .length + notices.length;

  const TABS: { value: NegocioTab; label: string }[] = [
    { value: "balance", label: "Balance" },
    {
      value: "pedidos",
      label: pendingOrders > 0 ? `Pedidos (${pendingOrders})` : "Pedidos",
    },
    { value: "ventas", label: "Ventas" },
    { value: "catalogo", label: "Catálogo" },
    { value: "piezas", label: "Piezas" },
    { value: "filamentos", label: "Filamentos" },
  ];

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Las piezas se piden al entrar a la pestaña (y se refrescan cada vez).
  useEffect(() => {
    if (tab === "piezas") loadParts();
  }, [tab, loadParts]);

  // Hex real de cada color, el de los rollos (para los circulos de piezas)
  const colorHex = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of stock?.colors ?? []) {
      const hex = cssHex(c.colorHex);
      if (hex) map[c.color] = hex;
    }
    return map;
  }, [stock]);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (isTab(t)) setTab(t);
  }, [searchParams]);

  return (
    <div className={`${LY_BRAND_CLASS} space-y-4`}>
      <PageHeader
        title="LY Juegos"
        subtitle="Pedidos, ventas, catálogo y filamentos"
        leading={
          // Version mini del sello: la unica variante autorizada para
          // espacios chicos (el sello completo no baja de 96 px).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/ly-juegos-mini.svg"
            alt=""
            width={38}
            height={38}
            className="h-[38px] w-[38px] shrink-0"
          />
        }
        metric={
          summary ? (
            <span
              className={summary.result >= 0 ? "text-success" : "text-destructive"}
            >
              {summary.result >= 0 ? "+" : ""}
              {fmtARS(summary.result)}
            </span>
          ) : null
        }
        metricLabel="resultado"
        action={
          <ActionIconButton
            icon={Settings}
            onClick={() => setShowSettings(true)}
            aria-label="Parámetros de costeo y revendedores"
          />
        }
      />

      <PillToggle<NegocioTab>
        options={TABS}
        value={tab}
        onChange={setTab}
        fullWidth
        aria-label="Secciones de LY Juegos"
      />

      {tab === "balance" && (
        <BalanceTab summary={summary} isLoading={isLoading} />
      )}

      {tab === "pedidos" && (
        <OrdersTab
          orders={orders}
          notices={notices}
          products={products}
          resellers={resellers}
          isSubmitting={isSubmitting}
          onUpdateStatus={updateOrderStatus}
          onDelete={deleteOrder}
          onCreate={createOrder}
          onUpdate={updateOrder}
          onPay={payOrder}
          onResolveNotice={resolveNotice}
        />
      )}

      {tab === "ventas" && (
        <SalesTab
          sales={sales}
          products={products}
          isSubmitting={isSubmitting}
          onCreate={createSale}
          onDelete={deleteSale}
          onAddSettlement={addSettlement}
          onDeleteSettlement={deleteSettlement}
        />
      )}

      {tab === "catalogo" && (
        <CatalogTab
          products={products}
          resellers={resellers}
          isSubmitting={isSubmitting}
          onCreate={createProduct}
          onUpdate={updateProduct}
          onDelete={deleteProduct}
          onAddPhoto={addPhoto}
          onDeletePhoto={deletePhoto}
          onSetCover={setCoverPhoto}
        />
      )}

      {tab === "piezas" && (
        <PartsTab
          parts={parts}
          isLoading={partsLoading}
          isSubmitting={isSubmitting}
          colorHex={colorHex}
          onMove={movePart}
        />
      )}

      {tab === "filamentos" && (
        <FilamentsTab
          filaments={filaments}
          stock={stock}
          jobs={jobs}
          products={products}
          bambuStatus={bambuStatus}
          isSubmitting={isSubmitting}
          onCreate={createFilament}
          onUpdate={updateFilament}
          onDelete={deleteFilament}
          onFinish={finishFilament}
          onCreateJob={createJob}
          onDeleteJob={deleteJob}
          onLinkJob={linkJob}
          onLearnJob={learnJob}
          onReassignJob={reassignJob}
          onSyncBambu={syncBambu}
        />
      )}

      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={updateSettings}
        resellers={resellers}
        onCreateReseller={createReseller}
        onUpdateReseller={updateReseller}
        onRegenerateResellerToken={regenerateResellerToken}
        isSubmitting={isSubmitting}
        bambuStatus={bambuStatus}
        onConnectBambu={connectBambu}
        onDisconnectBambu={disconnectBambu}
      />
    </div>
  );
}
