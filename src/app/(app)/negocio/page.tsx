"use client";

import { useEffect, useState } from "react";
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
import SettingsDialog from "@/components/printing/SettingsDialog";
import { fmtARS } from "@/lib/utils";
import { Printer, Settings } from "lucide-react";

type NegocioTab = "balance" | "pedidos" | "ventas" | "catalogo" | "filamentos";

const isTab = (v: string | null): v is NegocioTab =>
  v === "balance" ||
  v === "pedidos" ||
  v === "ventas" ||
  v === "catalogo" ||
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
    { value: "filamentos", label: "Filamentos" },
  ];

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (isTab(t)) setTab(t);
  }, [searchParams]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Negocio 3D"
        subtitle="Catálogo, filamentos y ventas"
        icon={Printer}
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
            aria-label="Parámetros de costeo y link para Marcelito"
          />
        }
      />

      <PillToggle<NegocioTab>
        options={TABS}
        value={tab}
        onChange={setTab}
        fullWidth
        aria-label="Secciones del negocio 3D"
      />

      {tab === "balance" && (
        <BalanceTab summary={summary} isLoading={isLoading} />
      )}

      {tab === "pedidos" && (
        <OrdersTab
          orders={orders}
          notices={notices}
          products={products}
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
          isSubmitting={isSubmitting}
          onCreate={createProduct}
          onUpdate={updateProduct}
          onDelete={deleteProduct}
          onAddPhoto={addPhoto}
          onDeletePhoto={deletePhoto}
          onSetCover={setCoverPhoto}
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
          onSyncBambu={syncBambu}
        />
      )}

      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={updateSettings}
        onRegenerateToken={regenerateToken}
        isSubmitting={isSubmitting}
        bambuStatus={bambuStatus}
        onConnectBambu={connectBambu}
        onDisconnectBambu={disconnectBambu}
      />
    </div>
  );
}
