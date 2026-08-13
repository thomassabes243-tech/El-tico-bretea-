import Link from "next/link";
import type { ComponentType } from "react";
import { Search, FileText, Users, MessagesSquare, ShieldCheck, HeartHandshake, Sparkles } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { ArenalScene } from "@/components/brand/scenery/ArenalScene";
import { GuanacasteScene } from "@/components/brand/scenery/GuanacasteScene";
import { MonteverdeScene } from "@/components/brand/scenery/MonteverdeScene";
import { CoffeeMountainsScene } from "@/components/brand/scenery/CoffeeMountainsScene";
import { COMMUNITY_CATEGORIES } from "@/lib/constants";
import { getDailyQuote } from "@/lib/motivational-quotes";
import { getAdEligibility, getActiveAds } from "@/lib/ads";
import { AdSlot } from "@/components/ads/AdSlot";

const COMMUNITY_SCENES: Record<string, ComponentType<{ className?: string }>> = {
  CONSTRUCCION: CoffeeMountainsScene,
  HOTELES_TURISMO: GuanacasteScene,
  PROFESIONALES: MonteverdeScene,
};

const QUICK_ACTIONS = [
  {
    href: "/buscar",
    emoji: "🔎",
    title: "Buscar trabajo",
    description: "Explorá vacantes por categoría y ubicación",
    icon: Search,
    tone: "navy" as const,
  },
  {
    href: "/cv",
    emoji: "📄",
    title: "Crear mi CV",
    description: "Armá tu currículum profesional en minutos",
    icon: FileText,
    tone: "red" as const,
  },
  {
    href: "/buscar-personal",
    emoji: "💼",
    title: "Buscar personal",
    description: "Para empresas: encontrá al tico ideal",
    icon: Users,
    tone: "navy" as const,
  },
  {
    href: "/comunidad",
    emoji: "💬",
    title: "Comunidad",
    description: "Conectate con tu gremio laboral",
    icon: MessagesSquare,
    tone: "red" as const,
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ "cuenta-eliminada"?: string }>;
}) {
  const quote = getDailyQuote();
  const [adEligible, ads] = await Promise.all([getAdEligibility(), getActiveAds()]);
  const { "cuenta-eliminada": cuentaEliminada } = await searchParams;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        {cuentaEliminada && (
          <div className="mb-4 rounded-2xl border border-success-600/25 bg-success-600/10 px-4 py-3 text-sm font-medium text-success-600">
            Tu cuenta fue eliminada. Gracias por haber usado El Tico Bretea.
          </div>
        )}

        {/* Hero */}
        <section className="animate-fade-in-up relative overflow-hidden rounded-3xl text-white shadow-lg shadow-navy-900/20">
          <ArenalScene className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/40 to-transparent" />
          <div className="relative px-6 py-8">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-cr-red-500" />
              Mensaje del día
            </div>
            <p className="text-lg font-semibold leading-snug drop-shadow-sm">{quote}</p>
          </div>
        </section>

        {/* Pregunta principal */}
        <section className="mt-7">
          <h1 className="text-xl font-extrabold tracking-tight text-navy-900">
            ¿Qué estás buscando hoy?
          </h1>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <Card
                    className="animate-fade-in-up group h-full p-4 transition-all hover:-translate-y-0.5 hover:border-navy-700/30 hover:shadow-md"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={
                          "flex h-11 w-11 items-center justify-center rounded-2xl " +
                          (action.tone === "red"
                            ? "bg-cr-red-600/[0.09] text-cr-red-600"
                            : "bg-navy-900/[0.07] text-navy-800")
                        }
                      >
                        <Icon className="h-5 w-5" strokeWidth={2.1} />
                      </div>
                      <span className="text-2xl leading-none">{action.emoji}</span>
                    </div>
                    <h3 className="mt-3 text-sm font-bold text-navy-900">{action.title}</h3>
                    <p className="mt-1 text-xs leading-snug text-navy-800/60">{action.description}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Comunidades por gremio */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900">Comunidades por gremio</h2>
            <Link href="/comunidad" className="text-xs font-semibold text-cr-red-600">
              Ver todas
            </Link>
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {COMMUNITY_CATEGORIES.map((cat) => {
              const Scene = COMMUNITY_SCENES[cat.value];
              return (
                <Link key={cat.value} href={`/comunidad/${cat.value.toLowerCase()}`}>
                  <Card className="relative w-36 shrink-0 overflow-hidden p-4">
                    {Scene && (
                      <>
                        <Scene className="absolute inset-0 h-full w-full opacity-25" />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-transparent" />
                      </>
                    )}
                    <div className="relative flex flex-col items-start gap-2.5">
                      <CategoryIcon category={cat.value} size="md" />
                      <span className="text-sm font-semibold text-navy-900">{cat.label}</span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Publicidad (solo cuentas gratuitas, Sección 10) */}
        <AdSlot eligible={adEligible} ads={ads} />

        {/* Confianza / transparencia */}
        <section className="mt-8">
          <Card className="flex items-start gap-3.5 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-600/10">
              <ShieldCheck className="h-5 w-5 text-success-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-navy-900">Trabajo directo y confiable</h3>
              <p className="mt-1 text-xs leading-relaxed text-navy-800/65">
                Conectamos ticos con empresas reales, sin intermediarios. Lo que cobramos
                por el CV o Premium es solo para mantener la app funcionando — no buscamos
                lucrar con tu búsqueda de empleo.{" "}
                <Link href="/acerca-de" className="font-semibold text-cr-red-600">
                  Conocé más
                </Link>
              </p>
            </div>
          </Card>
        </section>

        {/* Donación */}
        <section className="mt-4">
          <Card className="flex items-center gap-3.5 border-cr-red-600/15 bg-cr-red-100/40 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
              <HeartHandshake className="h-5 w-5 text-cr-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-navy-900">
                ¿Lograste lo que buscabas?
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-navy-800/65">
                Si querés, podés darme una pequeña donación voluntaria. ¡Gracias!
              </p>
            </div>
            <Link href="/donar" className="shrink-0 text-xs font-bold text-cr-red-600">
              Donar
            </Link>
          </Card>
        </section>

        <footer className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-navy-800/45">
          <Link href="/acerca-de" className="hover:text-navy-800">Acerca de</Link>
          <Link href="/privacidad" className="hover:text-navy-800">Privacidad</Link>
          <Link href="/terminos" className="hover:text-navy-800">Términos</Link>
          <Link href="/contacto" className="hover:text-navy-800">Contacto</Link>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}
