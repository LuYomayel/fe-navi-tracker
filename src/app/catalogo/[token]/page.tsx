"use client";

import { use, useEffect, useState } from "react";
import { fmtARS } from "@/lib/utils";
import type { PublicCatalogItem } from "@/types/printing";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://api-navi-tracker.luciano-yomayel.com";

/**
 * Catálogo público (el link que se le manda a Marcelito por WhatsApp).
 *
 * Fuera del grupo (app): sin login, sin nav y sin store. Muestra SOLO lo que
 * le corresponde ver — lo que le cuesta, el precio sugerido y su ganancia.
 * El costo real y el margen de Luciano nunca salen del backend.
 */
export default function CatalogoPublicoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [items, setItems] = useState<PublicCatalogItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/printing/catalog/${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => setItems((json?.data as PublicCatalogItem[]) ?? []))
      .catch(() => setError(true));
  }, [token]);

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
    <main className="min-h-screen bg-background px-4 py-6">
      <div className="mx-auto max-w-md">
        <header className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight">
            Imprimime <span className="text-primary">3D</span>
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Juegos didácticos en impresión 3D · precios en pesos
          </p>
        </header>

        {items === null ? (
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
            {items.map((p) => (
              <li
                key={p.id}
                className="rounded-lg border border-border bg-card p-4"
              >
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

                {p.makerworldUrl && (
                  <a
                    href={p.makerworldUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-xs font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    Ver el modelo →
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Los precios se actualizan solos: este link siempre muestra lo último.
        </p>
      </div>
    </main>
  );
}
