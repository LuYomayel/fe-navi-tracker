import type { Metadata } from "next";

// El catalogo es la cara publica del negocio (lo abren los revendedores):
// lleva la marca LY Juegos, no la de NaviTracker.
export const metadata: Metadata = {
  title: "LY Juegos · Catálogo",
  description: "Catálogo de LY Juegos: juegos impresos en 3D.",
};

export default function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
