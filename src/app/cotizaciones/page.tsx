import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Sin ninguna otra lectura dinámica (Prisma, etc.) en esta página, Next.js
// la trataba como elegible para pre-renderizado estático: la primera visita
// horneaba la redirección (a /iniciar-sesion, para quien la haya pedido sin
// sesión) en una respuesta cacheada por 5 minutos y se la servía IGUAL a
// cualquiera después -- incluida una empresa logueada, que debía terminar en
// /empresa/servicios y en cambio recibía el redirect cacheado de otra
// persona. force-dynamic obliga a ejecutar auth() en cada visita real.
export const dynamic = "force-dynamic";

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
