import Link from "next/link";
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, Check, Sparkles, UserRoundSearch, Wrench } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { PAYMENTS_ENABLED } from "@/lib/monetization";

const PLANS = [
  {
    name: "Perfil destacado",
    audience: "Para quien busca chamba",
    Icon: UserRoundSearch,
    href: "/premium",
    benefits: ["Mayor visibilidad del perfil", "Prioridad en recomendaciones", "Herramientas profesionales para CV"],
  },
  {
    name: "Profesional",
    audience: "Para ofrecer servicios",
    Icon: Wrench,
    href: "/empresa/servicios",
    benefits: ["Perfil de servicios destacado", "Más presencia en búsquedas", "Estadísticas de contacto"],
  },
  {
    name: "Empleador",
    audience: "Para contratar personal",
    Icon: BriefcaseBusiness,
    href: "/empresa/vacantes/nueva",
    benefits: ["Vacantes con mayor visibilidad", "Herramientas de selección", "Perfil de empresa destacado"],
  },
];

export default function PlanesPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800/60">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>

        <section className="mt-4 overflow-hidden rounded-[26px] bg-gradient-to-br from-peso-700 via-peso-600 to-navy-900 px-6 py-7 text-white shadow-[0_18px_42px_rgba(74,36,114,0.24)]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em]">
            <Sparkles className="h-3.5 w-3.5" /> {PAYMENTS_ENABLED ? "Planes opcionales" : "Próximamente"}
          </span>
          <h1 className="mt-4 text-[30px] font-extrabold leading-tight tracking-[-0.035em]">Más visibilidad cuando la necesités</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            {PAYMENTS_ENABLED
              ? "Mexa Chamba sigue siendo gratis. Elegí un plan opcional solamente si querés obtener mayor visibilidad."
              : "Mexa Chamba seguirá siendo gratis. Estos planes opcionales están preparados visualmente, pero los cobros todavía no están activos."}
          </p>
        </section>

        <div className="mt-5 grid gap-3">
          {PLANS.map(({ name, audience, Icon, benefits, href }) => (
            <article key={name} className="rounded-[22px] border border-sand-200 bg-white p-5 shadow-[0_8px_24px_rgba(10,38,71,0.07)]">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-peso-100 text-peso-700">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-extrabold text-navy-900">{name}</h2>
                  <p className="text-xs text-navy-800/50">{audience}</p>
                </div>
              </div>
              <ul className="mt-4 grid gap-2">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-xs font-medium text-navy-800/75">
                    <Check className="h-4 w-4 text-mx-green-600" /> {benefit}
                  </li>
                ))}
              </ul>
              {PAYMENTS_ENABLED ? (
                <Link href={href} className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-peso-700 text-sm font-bold text-white">
                  Ver este plan
                </Link>
              ) : (
                <button type="button" disabled className="mt-5 h-11 w-full rounded-xl bg-sand-100 text-sm font-bold text-navy-800/45">
                  Cobros disponibles próximamente
                </button>
              )}
            </article>
          ))}
        </div>

        <div className="mt-4 flex gap-2.5 rounded-2xl border border-mx-green-600/15 bg-mx-green-600/[0.06] p-4 text-xs leading-relaxed text-navy-800/75">
          <BadgeCheck className="h-5 w-5 shrink-0 text-mx-green-600" />
          <p>Los planes solo aumentarán visibilidad y herramientas. Nunca garantizarán empleo, clientes o contrataciones, y las funciones de seguridad permanecerán gratis.</p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
