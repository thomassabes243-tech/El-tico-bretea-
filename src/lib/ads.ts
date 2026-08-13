import { Sparkles, FileText, MessagesSquare, HeartHandshake } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Anuncios propios ("house ads"): mientras no haya una red publicitaria
// externa contratada, promocionamos funciones de la propia app. El mismo
// AdSlot se puede apuntar más adelante a un proveedor externo sin cambiar
// el resto de la app.
export const HOUSE_ADS = [
  {
    id: "premium",
    icon: Sparkles,
    title: "Sin anuncios con Premium",
    description: "Perfil destacado, prioridad en recomendaciones y más.",
    href: "/premium",
    cta: "Ver Premium",
  },
  {
    id: "cv",
    icon: FileText,
    title: "Tu CV profesional en PDF",
    description: "Generalo gratis por ahora, al momento, con tus datos actuales.",
    href: "/cv",
    cta: "Crear mi CV",
  },
  {
    id: "comunidad",
    icon: MessagesSquare,
    title: "Sumate a tu comunidad",
    description: "Chateá en vivo con gente de tu mismo gremio.",
    href: "/comunidad",
    cta: "Ver comunidades",
  },
  {
    id: "donar",
    icon: HeartHandshake,
    title: "¿Te sirvió El Tico Bretea?",
    description: "Una donación voluntaria ayuda a mantener la app funcionando.",
    href: "/donar",
    cta: "Donar",
  },
] as const;

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
