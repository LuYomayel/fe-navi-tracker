import { redirect } from "next/navigation";

// El home del rediseño es "Hoy" (dashboard condensado), bajo el grupo (app)
// que aplica auth + el nuevo AppLayout (nav de 5 secciones).
export default function HomePage() {
  redirect("/hoy");
}
