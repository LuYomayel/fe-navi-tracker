"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fmtARS } from "@/lib/utils";
import type {
  PrintOrderStatus,
  PublicCatalogItem,
  PublicOrder,
} from "@/types/printing";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-navi-tracker.luciano-yomayel.com";

const STATUS_LABEL: Record<PrintOrderStatus, { label: string; emoji: string }> = {
  pedido: { label: "Pedido enviado", emoji: "📨" },
  confirmado: { label: "Confirmado", emoji: "👍" },
  imprimiendo: { label: "Imprimiendo", emoji: "🖨️" },
  listo: { label: "Listo para entregar", emoji: "📦" },
  entregado: { label: "Entregado", emoji: "✅" },
  cancelado: { label: "Cancelado", emoji: "✖️" },
};

/**
 * Catálogo público (el link que se le manda a Marcelito por WhatsApp).
 *
 * Fuera del grupo (app): sin login, sin nav y sin store. Muestra SOLO lo que
 * le corresponde ver — lo que le cuesta, el precio sugerido y su ganancia.
 * Desde acá también arma pedidos, les sigue el estado y avisa cuando pagó.
 */
export default function CatalogoPublicoPage() {
  return (
    <Suspense fallback={null}>
      <CatalogoPublico />
    </Suspense>
  );
}

function CatalogoPublico() {
  const token = useSearchParams().get("t") ?? "";
  const [view, setView] = useState<"catalogo" | "pedidos">("catalogo");
  const [items, setItems] = useState<PublicCatalogItem[] | null>(null);
  const [orders, setOrders] = useState<PublicOrder[]>([]);
  const [debt, setDebt] = useState(0);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [noticeFor, setNoticeFor] = useState<PublicOrder | null>(null);
  const [noticeAmount, setNoticeAmount] = useState("");
  const [noticeMsg, setNoticeMsg] = useState("");
  const [noticeSent, setNoticeSent] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/printing/catalog/${token}/orders`);
      if (!r.ok) return;
      const json = await r.json();
      setOrders((json?.data?.orders as PublicOrder[]) ?? []);
      setDebt((json?.data?.debt as number) ?? 0);
    } catch {
      /* la vista de pedidos es secundaria: el catálogo sigue andando */
    }
  }, [token]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/printing/catalog/${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => setItems((json?.data as PublicCatalogItem[]) ?? []))
      .catch(() => setError(true));
    loadOrders();
  }, [token, loadOrders]);

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([productId, qty]) => ({
          productId,
          qty,
          item: items?.find((i) => i.id === productId),
        })),
    [cart, items],
  );
  const cartTotal = cartItems.reduce(
    (a, c) => a + (c.item?.priceToMarcelito ?? 0) * c.qty,
    0,
  );

  const setQty = (id: string, qty: number) =>
    setCart((prev) => ({ ...prev, [id]: Math.max(0, Math.min(99, qty)) }));

  const sendOrder = async () => {
    if (!cartItems.length || sending) return;
    setSending(true);
    try {
      const r = await fetch(
        `${API_BASE_URL}/api/printing/catalog/${token}/orders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cartItems.map((c) => ({ productId: c.productId, qty: c.qty })),
          }),
        },
      );
      if (!r.ok) throw new Error();
      setCart({});
      setSent(true);
      await loadOrders();
      setView("pedidos");
      setTimeout(() => setSent(false), 4000);
    } catch {
      alert("No se pudo enviar el pedido. Probá de nuevo.");
    } finally {
      setSending(false);
    }
  };

  const sendNotice = async () => {
    if (!noticeFor) return;
    try {
      const r = await fetch(
        `${API_BASE_URL}/api/printing/catalog/${token}/payment-notices`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: noticeFor.id,
            amount: noticeAmount ? Number(noticeAmount) : undefined,
            message: noticeMsg || undefined,
          }),
        },
      );
      if (!r.ok) throw new Error();
      setNoticeFor(null);
      setNoticeAmount("");
      setNoticeMsg("");
      setNoticeSent(true);
      setTimeout(() => setNoticeSent(false), 4000);
    } catch {
      alert("No se pudo mandar el aviso. Probá de nuevo.");
    }
  };

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Este catálogo no está disponible. Pedile el link de nuevo a Luciano.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 pb-28">
      <div className="mx-auto max-w-md">
        <header className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight">
            Imprimime <span className="text-primary">3D</span>
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Juegos didácticos en impresión 3D · precios en pesos
          </p>
        </header>

        {/* Toggle catálogo / pedidos */}
        <div className="mb-4 flex rounded-lg border border-border bg-muted/40 p-0.5 text-sm font-medium">
          {(["catalogo", "pedidos"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 rounded-md px-3 py-1.5 transition-colors ${
                view === v
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {v === "catalogo" ? "Catálogo" : `Mis pedidos${orders.length ? ` (${orders.length})` : ""}`}
            </button>
          ))}
        </div>

        {sent && (
          <div className="mb-3 rounded-lg border border-green-600/40 bg-green-600/10 p-3 text-sm font-medium">
            ✅ ¡Pedido enviado! Luciano lo ve al toque.
          </div>
        )}
        {noticeSent && (
          <div className="mb-3 rounded-lg border border-green-600/40 bg-green-600/10 p-3 text-sm font-medium">
            ✅ Aviso enviado. Luciano lo confirma y te queda registrado.
          </div>
        )}

        {view === "catalogo" ? (
          items === null ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-lg border border-border bg-muted/40"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay productos cargados.
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((p) => {
                const qty = cart[p.id] ?? 0;
                return (
                  <li
                    key={p.id}
                    className="overflow-hidden rounded-lg border border-border bg-card"
                  >
                    {p.photos.length > 0 && (
                      <div className="flex gap-1 overflow-x-auto bg-muted/30 p-1">
                        {p.photos.map((url, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={i}
                            src={`${API_BASE_URL}${url}`}
                            alt={p.name}
                            loading="lazy"
                            onClick={() => setLightbox(`${API_BASE_URL}${url}`)}
                            className={`h-36 shrink-0 cursor-zoom-in rounded-md object-cover ${
                              p.photos.length === 1 ? "w-full" : "w-36"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <div className="p-4">
                      <h2 className="text-[15px] font-semibold leading-snug">
                        {p.name}
                      </h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {p.colorsLabel === "multi"
                          ? "Varios colores"
                          : `${p.colorsLabel} ${p.colorsLabel === "1" ? "color" : "colores"}`}
                        {p.sizeMm ? ` · ${p.sizeMm}` : ""}
                      </p>

                      <dl className="mt-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Te cuesta</dt>
                          <dd className="font-mono font-semibold tabular-nums">
                            {fmtARS(p.priceToMarcelito)}
                          </dd>
                        </div>
                        {p.publicPrice != null && (
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">
                              Precio sugerido de venta
                            </dt>
                            <dd className="font-mono font-semibold tabular-nums">
                              {fmtARS(p.publicPrice)}
                            </dd>
                          </div>
                        )}
                        {p.marcelitoProfit != null && (
                          <div className="flex justify-between border-t border-border/60 pt-1">
                            <dt className="font-medium">Tu ganancia</dt>
                            <dd className="font-mono font-bold tabular-nums text-success">
                              {fmtARS(p.marcelitoProfit)}
                            </dd>
                          </div>
                        )}
                      </dl>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        {p.makerworldUrl ? (
                          <a
                            href={p.makerworldUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
                          >
                            Ver el modelo →
                          </a>
                        ) : (
                          <span />
                        )}
                        {qty === 0 ? (
                          <button
                            onClick={() => setQty(p.id, 1)}
                            className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                          >
                            + Pedir
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setQty(p.id, qty - 1)}
                              aria-label="Sacar uno"
                              className="h-8 w-8 rounded-md border border-border text-base font-bold"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-mono text-sm font-bold tabular-nums">
                              {qty}
                            </span>
                            <button
                              onClick={() => setQty(p.id, qty + 1)}
                              aria-label="Agregar uno"
                              className="h-8 w-8 rounded-md border border-border text-base font-bold"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )
        ) : (
          /* ── Mis pedidos ── */
          <div className="space-y-3">
            {debt > 0 && (
              <div className="rounded-lg border border-border bg-card p-3 text-sm">
                <span className="text-muted-foreground">Debés en total </span>
                <span className="font-mono font-bold tabular-nums">
                  {fmtARS(debt)}
                </span>
              </div>
            )}
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todavía no hiciste ningún pedido. Armalo desde el catálogo.
              </p>
            ) : (
              orders.map((o) => {
                const st = STATUS_LABEL[o.status];
                const date = new Date(o.createdAt);
                return (
                  <div
                    key={o.id}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">
                        {st.emoji} {st.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {date.toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-0.5 text-sm">
                      {o.items.map((i, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span className="min-w-0 truncate">
                            {i.qty}x {i.name}
                          </span>
                          <span className="font-mono tabular-nums text-muted-foreground">
                            {fmtARS(i.subtotal)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
                      <span className="text-sm font-semibold">Total</span>
                      <span className="font-mono text-sm font-bold tabular-nums">
                        {fmtARS(o.total)}
                      </span>
                    </div>
                    {o.status === "entregado" && (
                      <button
                        onClick={() => setNoticeFor(o)}
                        className="mt-2 w-full rounded-md border border-border py-1.5 text-xs font-semibold text-primary"
                      >
                        💸 Avisar que pagué
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Los precios se actualizan solos: este link siempre muestra lo último.
        </p>
      </div>

      {/* Barra flotante del pedido */}
      {view === "catalogo" && cartItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 p-3 backdrop-blur">
          <div className="mx-auto flex max-w-md items-center justify-between gap-3">
            <div className="min-w-0 text-sm">
              <div className="font-semibold">
                {cartItems.reduce((a, c) => a + c.qty, 0)} producto
                {cartItems.reduce((a, c) => a + c.qty, 0) === 1 ? "" : "s"} ·{" "}
                <span className="font-mono tabular-nums">{fmtARS(cartTotal)}</span>
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {cartItems.map((c) => `${c.qty}x ${c.item?.name ?? ""}`).join(", ")}
              </div>
            </div>
            <button
              onClick={sendOrder}
              disabled={sending}
              className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {sending ? "Enviando..." : "Enviar pedido"}
            </button>
          </div>
        </div>
      )}

      {/* Aviso de pago */}
      {noticeFor && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setNoticeFor(null)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-border bg-background p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold">Avisar un pago</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Le llega a Luciano y lo confirma. Podés avisar un pago parcial
              (ej: pagaste 3 de 5).
            </p>
            <label className="mt-3 block text-xs font-medium">
              ¿Cuánto pagaste? (opcional)
              <input
                type="number"
                inputMode="decimal"
                value={noticeAmount}
                onChange={(e) => setNoticeAmount(e.target.value)}
                placeholder={`${noticeFor.total}`}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="mt-2 block text-xs font-medium">
              Mensaje (opcional)
              <input
                value={noticeMsg}
                onChange={(e) => setNoticeMsg(e.target.value)}
                placeholder="Ej: te transferí lo de los 3 tetris"
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <button
              onClick={sendNotice}
              disabled={!noticeAmount && !noticeMsg}
              className="mt-3 w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              Mandar aviso
            </button>
          </div>
        </div>
      )}

      {/* Lightbox de foto */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt=""
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </main>
  );
}
