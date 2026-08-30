import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";

// Invitación a Premium/Plan Profesional contextualizada a la categoría que
// la persona está explorando en ese momento (misma idea en las 2 variantes:
// "quien mira este rubro, capaz se le ocurre pagar para destacar acá"). Se
// muestra en /buscar/[categoria] -- funciona igual para cualquier categoría,
// solo cambia el texto con el nombre de la categoría actual. No decide nada
// (a quién mostrarla la resuelve la página, según rol y si ya es Premium/
// Destacado), esto solo es la tarjeta visual.
export function PremiumCategoryBanner({
  variant,
  categoryLabel,
}: {
  variant: "worker" | "company";
  categoryLabel: string;
}) {
  const copy =
    variant === "worker"
      ? {
          title: "Destacá tu perfil en " + categoryLabel,
          subtitle: "Con Premium, tu perfil aparece primero para las empresas que buscan en este rubro.",
          href: "/premium",
        }
      : {
          title: "Destacá tu perfil profesional",
          subtitle: "Con el Plan Profesional, aparecés primero en la bandeja de solicitudes de Cotizaciones.",
          href: "/empresa/servicios",
        };

  return (
    <Link href={copy.href} className="mt-4 block">
      <div className="flex items-center gap-3 overflow-hidden rounded-2xl border border-peso-600/20 bg-gradient-to-r from-peso-700 to-peso-600 p-4 text-white shadow-sm">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">{copy.title}</p>
          <p className="text-xs text-white/80">{copy.subtitle}</p>
        </div>
        <ChevronRight className="h-4.5 w-4.5 shrink-0 text-white/70" />
      </div>
    </Link>
  );
}
