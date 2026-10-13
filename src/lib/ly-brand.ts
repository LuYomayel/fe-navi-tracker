import { Nunito, Varela_Round } from "next/font/google";

// Tipografias del Manual de Marca LY Juegos v1.1: Varela Round para titulos
// (reemplazo web de la letra del sello) y Nunito para el cuerpo.
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

/**
 * Clase que convierte un subarbol en "territorio LY Juegos": paleta de la
 * marca (ver .ly-brand en globals.css) + sus dos tipografias. Va en el
 * catalogo publico, en la seccion Negocio y en sus dialogos (los dialogos se
 * montan en un portal, por eso cada uno la lleva en su contenido).
 */
export const LY_BRAND_CLASS = `ly-brand ${varela.variable} ${nunito.variable}`;

/** Azul LY exacto, para lo que tiene que fundirse con el circulo del sello. */
export const LY_AZUL = "#3E94F7";
