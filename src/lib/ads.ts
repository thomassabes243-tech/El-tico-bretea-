import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { AdItem } from "@/lib/ad-icons";

// Sección 10/20: publicidad propia ("house ads"), editable desde
// /admin/publicidad. Mientras no haya una red publicitaria externa
// contratada, promocionamos funciones de la propia app. El mismo AdSlot se
// puede apuntar más adelante a un proveedor externo sin cambiar el resto
// de la app.

// El anuncio de Premium queda desactivado (Sección 5 de "Ajustes de
// usabilidad y monetización"): mientras Premium no se pueda comprar, no se
// promociona en la publicidad propia. El único anuncio por defecto es el
// del CV, que es el único cobro activo.
const FALLBACK_ADS: Omit<AdItem, "id">[] = [
  {
    title: "Tu CV profesional en PDF",
    description: "Generalo gratis por ahora, al momento, con tus datos actuales.",
    href: "/cv",
    ctaLabel: "Crear mi CV",
    iconKey: "file-text",
  },
];

/** Anuncios activos. Si todavía no hay ninguno cargado en el panel, usamos un par por defecto. */
export async function getActiveAds(): Promise<AdItem[]> {
  const ads = await prisma.advertisement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (ads.length > 0) return ads;
  return FALLBACK_ADS.map((ad, i) => ({ id: `fallback-${i}`, ...ad }));
}

// Sección 10: publicidad solo para cuentas gratuitas. Moderadores y admins
// nunca ven anuncios (no son el público de la app); Premium tampoco.
export function isAdEligible(role: string | undefined, isPremium: boolean): boolean {
  if (!role) return false;
  if (role === "MODERATOR" || role === "ADMIN") return false;
  if (role === "WORKER" && isPremium) return false;
  return true;
}

/** Helper de servidor: resuelve la sesión actual y decide si le corresponde ver anuncios. */
export async function getAdEligibility(): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  let isPremium = false;
  if (session.user.role === "WORKER") {
    const worker = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
      select: { isPremium: true },
    });
    isPremium = worker?.isPremium ?? false;
  }

  return isAdEligible(session.user.role, isPremium);
}
