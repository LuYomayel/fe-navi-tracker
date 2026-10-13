import type { Metadata } from "next";
import { LY_BRAND_CLASS } from "@/lib/ly-brand";

// El catalogo es la cara publica del negocio (lo abren los revendedores):
// lleva la marca LY Juegos, no la de NaviTracker.
export const metadata: Metadata = {
  title: "LY Juegos · Catálogo",
  description: "Catálogo de LY Juegos: juegos de ingenio hechos en Argentina.",
  icons: { icon: "/ly-juegos-mini.svg" },
};

export default function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${LY_BRAND_CLASS} min-h-screen bg-background text-foreground`}>
      {children}
    </div>
  );
}
