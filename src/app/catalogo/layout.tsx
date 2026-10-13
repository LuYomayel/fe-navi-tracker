import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Nunito, Varela_Round } from "next/font/google";

// El catalogo es la cara publica del negocio (lo abren los revendedores):
// lleva la marca LY Juegos, no la de NaviTracker. Paleta, tipografias y reglas
// del sello salen del Manual de Marca LY Juegos v1.1.
export const metadata: Metadata = {
  title: "LY Juegos · Catálogo",
  description: "Catálogo de LY Juegos: juegos de ingenio hechos en Argentina.",
  icons: { icon: "/ly-juegos-mini.svg" },
};

// Titulos: Varela Round (reemplazo web de Arial Rounded MT Bold, la letra del
// sello). Cuerpo: Nunito.
const varela = Varela_Round({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-ly-title",
  display: "swap",
});
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-ly-body",
  display: "swap",
});

// Paleta del manual pisando los tokens del design system SOLO adentro del
// catalogo: asi las clases de siempre (bg-background, text-primary, border-
// border...) quedan con los colores de la marca sin tocar la app.
const brandTokens = {
  "--background": "216 83% 98%", // Niebla #F4F8FE
  "--foreground": "211 56% 20%", // Marino pizarra #16324F
  "--card": "0 0% 100%",
  "--card-foreground": "211 56% 20%",
  "--popover": "0 0% 100%",
  "--popover-foreground": "211 56% 20%",
  "--primary": "212 92% 61%", // Azul LY #3E94F7
  "--primary-foreground": "0 0% 100%",
  "--secondary": "213 62% 91%",
  "--secondary-foreground": "211 56% 20%",
  "--muted": "213 62% 91%", // Borde #D9E6F6
  "--muted-foreground": "211 22% 41%", // Tinta suave #51677E
  "--accent": "213 62% 91%",
  "--accent-foreground": "212 74% 46%", // Azul hondo #1E6FCB
  "--border": "213 62% 91%",
  "--input": "213 62% 91%",
  "--ring": "212 92% 61%",
  fontFamily: "var(--font-ly-body), -apple-system, 'Segoe UI', sans-serif",
} as CSSProperties;

export default function CatalogoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${varela.variable} ${nunito.variable} min-h-screen bg-background text-foreground`}
      style={brandTokens}
    >
      {children}
    </div>
  );
}
