import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Punto de entrada único de "Cotizaciones" para el menú principal --
// trabajador y empresa tienen pantallas de inicio distintas para esta
// misma sección (pedir un servicio vs. ofrecerlo/gestionar solicitudes),
// así que esto solo redirige según el rol en vez de duplicar contenido.
export default async function CotizacionesPage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");

  if (session.user.role === "ADMIN") redirect("/admin");
  if (session.user.role === "COMPANY") redirect("/empresa/servicios");
  redirect("/servicios/mis-solicitudes");
}
