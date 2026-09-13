import Link from "next/link";
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, Check, Crown, ShieldCheck, Sparkles, UserRoundSearch, Wrench } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { PAYMENTS_ENABLED } from "@/lib/monetization";

const PLANS = [
  {
    name: "Perfil destacado",
    audience: "Para quien busca chamba",
    eyebrow: "Conseguí más miradas",
    Icon: UserRoundSearch,
    href: "/premium",
    accent: "navy",
    benefits: ["Mayor visibilidad del perfil", "Prioridad en recomendaciones", "Herramientas profesionales para CV"],
  },
  {
    name: "Profesional",
    audience: "Para ofrecer servicios",
    eyebrow: "Opción recomendada",
    Icon: Wrench,
    href: "/empresa/servicios",
    accent: "purple",
    benefits: ["Perfil de servicios destacado", "Más presencia en búsquedas", "Estadísticas de contacto"],
  },
  {
    name: "Empleador",
    audience: "Para contratar personal",
    eyebrow: "Contratá con más alcance",
    Icon: BriefcaseBusiness,
    href: "/empresa/vacantes/nueva",
    accent: "red",
    benefits: ["Vacantes con mayor visibilidad", "Herramientas de selección", "Perfil de empresa destacado"],
  },
] as const;

export default function PlanesPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800/60">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>

        <section className="relative mt-4 min-h-[286px] overflow-hidden rounded-[30px] bg-gradient-to-br from-peso-700 via-peso-600 to-navy-950 px-6 py-7 text-white shadow-[0_24px_52px_rgba(74,36,114,0.28)]">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/14 blur-3xl" />
          <div className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-mx-red-600/25 blur-3xl" />
          <span className="relative inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/12 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> {PAYMENTS_ENABLED ? "Planes opcionales" : "Próximamente"}
          </span>
          <Crown className="relative mt-7 h-9 w-9 text-white/90" />
          <h1 className="relative mt-3 max-w-[92%] text-[32px] font-extrabold leading-[1.04] tracking-[-0.04em]">Hacé que te encuentren primero</h1>
          <p className="relative mt-3 max-w-[94%] text-sm leading-relaxed text-white/80">
            {PAYMENTS_ENABLED
              ? "Mexa Chamba sigue siendo gratis. Elegí un plan opcional solamente si querés obtener mayor visibilidad."
              : "Mexa Chamba seguirá siendo gratis. Estos planes están listos visualmente, pero los cobros todavía no están activos."}
          </p>
        </section>

        <div className="relative z-10 -mt-4 mx-3 grid grid-cols-[auto_1fr] gap-3 rounded-[22px] border border-white bg-white p-4 shadow-[0_14px_34px_rgba(10,38,71,0.13)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mx-green-600/10 text-mx-green-600"><ShieldCheck className="h-5 w-5" /></span>
          <div>
            <p className="text-sm font-extrabold text-navy-900">Entrar, buscar y publicar seguirá siendo gratis</p>
            <p className="mt-1 text-xs leading-relaxed text-navy-800/55">Solo pagarás si después elegís destacar un perfil, servicio o vacante.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {PLANS.map(({ name, audience, eyebrow, Icon, benefits, href, accent }) => (
            <article
              key={name}
              className={`relative overflow-hidden rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(10,38,71,0.09)] ${accent === "purple" ? "border-2 border-peso-600/45" : "border border-sand-200"}`}
            >
              {accent === "purple" ? <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-peso-700 via-peso-500 to-mx-red-600" /> : null}
              <p className={`text-[10px] font-extrabold uppercase tracking-[0.13em] ${accent === "purple" ? "text-peso-700" : accent === "red" ? "text-mx-red-600" : "text-navy-700"}`}>{eyebrow}</p>
              <div className="flex items-start gap-3">
                <span className={`mt-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent === "purple" ? "bg-peso-100 text-peso-700" : accent === "red" ? "bg-mx-red-100 text-mx-red-700" : "bg-navy-900/[0.07] text-navy-900"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="mt-3 min-w-0 flex-1">
                  <h2 className="text-lg font-extrabold tracking-tight text-navy-900">{name}</h2>
                  <p className="mt-0.5 text-xs text-navy-800/50">{audience}</p>
                </div>
                <span className="mt-3 rounded-full bg-sand-100 px-2.5 py-1 text-[10px] font-bold text-navy-800/55">Precio por definir</span>
              </div>
              <ul className="mt-4 grid gap-2.5">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-xs font-medium text-navy-800/75">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mx-green-600/10 text-mx-green-600"><Check className="h-3 w-3" strokeWidth={3} /></span>
                    {benefit}
                  </li>
                ))}
              </ul>
              {PAYMENTS_ENABLED ? (
                <Link href={href} className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-peso-700 to-peso-500 text-sm font-bold text-white shadow-[0_10px_22px_rgba(74,36,114,0.24)]">
                  Ver este plan
                </Link>
              ) : (
                <button type="button" disabled className="mt-5 h-12 w-full rounded-2xl bg-sand-100 text-sm font-bold text-navy-800/45">
                  Activación próximamente
                </button>
              )}
            </article>
          ))}
        </div>

        <div className="mt-4 flex gap-2.5 rounded-[20px] border border-mx-green-600/15 bg-mx-green-600/[0.06] p-4 text-xs leading-relaxed text-navy-800/75">
          <BadgeCheck className="h-5 w-5 shrink-0 text-mx-green-600" />
          <p>Los planes solo aumentarán visibilidad y herramientas. Nunca garantizarán empleo, clientes o contrataciones, y las funciones de seguridad permanecerán gratis.</p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
