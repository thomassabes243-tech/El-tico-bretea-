import Link from "next/link";
import { Users, ShieldCheck, HeartHandshake, Star, Sparkles, MapPin, ChevronRight, Coins, Clock, Briefcase } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CATEGORY_ICON_MAP, CategoryIcon } from "@/components/brand/CategoryIcon";
import { HeroImage } from "@/components/brand/HeroImage";
import { SafetyBadgeIcon } from "@/components/brand/SafetyBadgeIcon";
import { ServiceRequestIcon, ServiceOfferIcon } from "@/components/brand/ServiceIcons";
import { CommunityIcon } from "@/components/brand/CommunityIcon";
import { SmartSearchBar } from "@/components/forms/SmartSearchBar";
import { LABOR_CATEGORIES, JOB_TYPES } from "@/lib/constants";
import { findJobPostingsFeaturedFirst, isFeatured } from "@/lib/job-postings";
import { getAdEligibility, getActiveAds } from "@/lib/ads";
import { getCommunityChatRoom, getCommunityMemberCount } from "@/lib/chat-rooms";
import { AdSlot } from "@/components/ads/AdSlot";

function labelFor(list: readonly { value: string; label: string }[], value: string) {
  return list.find((i) => i.value === value)?.label ?? value;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ "cuenta-eliminada"?: string }>;
}) {
  const { "cuenta-eliminada": cuentaEliminada } = await searchParams;
  const [nuevosTrabajos, adEligible, ads, communityRoom] = await Promise.all([
    findJobPostingsFeaturedFirst({ isActive: true }, 5),
    getAdEligibility(),
    getActiveAds(),
    getCommunityChatRoom(),
  ]);
  const communityMemberCount = await getCommunityMemberCount(communityRoom.id);
  const now = Date.now();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        {cuentaEliminada && (
          <div className="mb-4 rounded-2xl border border-success-600/25 bg-success-600/10 px-4 py-3 text-sm font-medium text-success-600">
            Tu cuenta fue eliminada. Gracias por haber usado El Mexa Chamba.
          </div>
        )}

        {/* Hero */}
        <section className="animate-fade-in-up relative overflow-hidden rounded-3xl text-white shadow-lg shadow-navy-900/20">
          <HeroImage
            src="/assets/images/hero-worker.jpg"
            alt="Trabajador sonriendo con los brazos cruzados"
            className="absolute inset-0 h-full w-full object-[center_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/55 to-navy-950/15" />
          <div className="relative px-6 py-8">
            <h1 className="font-serif text-3xl font-bold leading-snug drop-shadow-sm">¡Aquí sí hay chamba!</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-white/85 drop-shadow-sm">
              El trabajo correcto no siempre llega rápido, pero llega a quien insiste.
            </p>
            <Button href="/buscar-personal" variant="secondary" fullWidth className="mt-5">
              <Users className="h-4 w-4" /> Buscar personal
            </Button>
          </div>
        </section>

        {/* Seguridad -- razón de ser de la app: GPS real, botón de pánico y
            contactos de confianza para ir a un trabajo nuevo con respaldo.
            Antes solo estaba linkeado desde adentro de /perfil; se sube acá
            arriba de todo porque es lo que más cuesta encontrar y lo más
            importante para alguien que desconfía de una oferta. */}
        <Link href="/seguridad" className="mt-4 block">
          <Card className="flex items-center gap-3.5 border-mx-red-600/20 bg-mx-red-100/50 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mx-red-600 text-white shadow-sm shadow-mx-red-600/30">
              <SafetyBadgeIcon className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <span className="inline-block rounded-full bg-mx-red-600/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-mx-red-700">
                Protección activa
              </span>
              <p className="mt-1 text-sm font-bold text-navy-900">Compartí tu ubicación antes de ir</p>
              <p className="text-xs leading-snug text-navy-800/60">
                GPS en vivo, botón de emergencia y contactos de confianza — una herramienta más
                de protección, no una garantía de seguridad.
              </p>
            </div>
            <ChevronRight className="h-4.5 w-4.5 shrink-0 text-navy-800/30" />
          </Card>
        </Link>

        {/* Cotizaciones -- los dos lados (pedir un servicio / ofrecer el
            tuyo) tienen que verse cerca del hero, no escondidos en un menú;
            antes esto era una sola tarjeta ambigua más abajo en la página. */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Link href="/servicios/nueva" className="block">
            <Card className="flex h-full flex-col items-start gap-2 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-peso-600/[0.1] text-peso-600">
                <ServiceRequestIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold leading-snug text-navy-900">Pedir un servicio</p>
              <p className="text-[11px] leading-snug text-navy-800/50">
                Encontrá a alguien para hacer el trabajo
              </p>
            </Card>
          </Link>
          <Link href="/empresa/servicios" className="block">
            <Card className="flex h-full flex-col items-start gap-2 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mx-red-600/[0.1] text-mx-red-600">
                <ServiceOfferIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold leading-snug text-navy-900">Ofrecer mis servicios</p>
              <p className="text-[11px] leading-snug text-navy-800/50">Creá tu perfil y conseguí clientes</p>
            </Card>
          </Link>
        </div>

        {/* Buscador -- texto libre de siempre + variante con IA (ver
            SmartSearchBar) que reescribe frases largas en palabras clave. */}
        <SmartSearchBar />

        {/* Categorías */}
        <div className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <Link
            href="/buscar"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-navy-900 px-3.5 py-2 text-xs font-semibold text-white"
          >
            Todos
          </Link>
          {LABOR_CATEGORIES.filter((c) => c.value !== "SIN_ESPECIFICAR").map((cat) => {
            const Icon = CATEGORY_ICON_MAP[cat.value] ?? CATEGORY_ICON_MAP.PROFESIONALES;
            return (
              <Link
                key={cat.value}
                href={`/buscar/${cat.value.toLowerCase()}`}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-sand-200 bg-white px-3.5 py-2 text-xs font-semibold text-navy-800/70 transition-all active:scale-95"
              >
                <Icon className="h-3.5 w-3.5 text-peso-600" strokeWidth={2.1} />
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Trabajos destacados */}
        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900">Trabajos Destacados</h2>
            <Link href="/buscar" className="text-xs font-semibold text-mx-red-600">
              Ver todos
            </Link>
          </div>
          <Card className="mt-3 flex flex-col items-center gap-2.5 border-navy-900/10 bg-gradient-to-b from-navy-900/[0.03] to-transparent p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900/[0.07] text-navy-800">
              <Star className="h-5.5 w-5.5" strokeWidth={2.1} />
            </div>
            <p className="text-sm font-bold text-navy-900">Todavía no hay trabajos destacados</p>
            <p className="text-xs leading-relaxed text-navy-800/50">
              Estamos buscando nuevas oportunidades para vos.
            </p>
            <Button href="/buscar" variant="secondary" size="sm" className="mt-1">
              Explorar trabajos
            </Button>
          </Card>
        </section>

        {/* Nuevos trabajos */}
        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900">Nuevos Trabajos</h2>
            <Link href="/buscar" className="text-xs font-semibold text-mx-red-600">
              Ver todos
            </Link>
          </div>

          {nuevosTrabajos.length === 0 ? (
            <Card className="mt-3 flex flex-col items-center gap-2.5 p-8 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-900/[0.06] text-navy-800/40">
                <Briefcase className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-navy-900">Aún no hay trabajos publicados</p>
              <p className="text-xs leading-relaxed text-navy-800/50">
                Cuando aparezcan nuevas oportunidades, las vas a encontrar aquí.
              </p>
              <Button href="/buscar" variant="secondary" size="sm" className="mt-1">
                Buscar trabajos
              </Button>
            </Card>
          ) : (
            <div className="mt-3 flex flex-col gap-2.5">
              {nuevosTrabajos.map((job) => {
                const isNew = now - job.createdAt.getTime() < 3 * 24 * 60 * 60 * 1000;
                return (
                  <Link key={job.id} href={`/vacantes/${job.id}`}>
                    <Card className="flex gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
                      <CategoryIcon category={job.laborCategory} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-navy-900">
                              {job.title}
                              {isFeatured(job.featuredUntil) && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-peso-100 px-1.5 py-0.5 text-[10px] font-bold text-peso-700">
                                  <Sparkles className="h-2.5 w-2.5" /> Destacada
                                </span>
                              )}
                              {!isFeatured(job.featuredUntil) && isNew && (
                                <span className="inline-flex items-center rounded-full bg-success-600/10 px-1.5 py-0.5 text-[10px] font-bold text-success-600">
                                  Nueva
                                </span>
                              )}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-navy-800/50">
                              {job.company.commercialName}
                              {job.company.isVerified && (
                                <ShieldCheck className="h-3 w-3 shrink-0 text-success-600" aria-label="Empresa verificada" />
                              )}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-navy-800/30" />
                        </div>
                        <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] font-medium text-navy-800/60">
                          <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2 py-0.5">
                            <MapPin className="h-3 w-3" /> {job.location}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2 py-0.5">
                            <Clock className="h-3 w-3" /> {labelFor(JOB_TYPES, job.contractType)}
                          </span>
                          {job.salary && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-mx-red-100 px-2 py-0.5 text-mx-red-700">
                              <Coins className="h-3 w-3" /> {job.salary}
                            </span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Comunidad */}
        <section className="mt-7">
          <Link href="/comunidad" className="block">
            <Card className="flex items-center gap-3.5 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mx-red-600/[0.09] text-mx-red-600">
                <CommunityIcon className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <p className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
                  Comunidad Mexa
                  {communityMemberCount > 0 && (
                    <span className="rounded-full bg-sand-100 px-2 py-0.5 text-[10px] font-bold text-navy-800/60">
                      +{communityMemberCount} personas
                    </span>
                  )}
                </p>
                <p className="text-xs text-navy-800/50">Conectá con personas, compartí experiencias y crecé profesionalmente</p>
              </div>
              <ChevronRight className="h-4.5 w-4.5 text-navy-800/30" />
            </Card>
          </Link>
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
                Conectamos mexicanos con empresas reales, sin intermediarios. Lo que cobramos
                por el CV o Premium es solo para mantener la app funcionando — no buscamos
                lucrar con tu búsqueda de empleo.{" "}
                <Link href="/acerca-de" className="font-semibold text-mx-red-600">
                  Conocé más
                </Link>
              </p>
            </div>
          </Card>
        </section>

        {/* Donación */}
        <section className="mt-4">
          <Card className="flex items-center gap-3.5 border-mx-red-600/15 bg-mx-red-100/40 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
              <HeartHandshake className="h-5 w-5 text-mx-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-navy-900">
                ¿Lograste lo que buscabas?
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-navy-800/65">
                Si querés, podés darme una pequeña donación voluntaria. ¡Gracias!
              </p>
            </div>
            <Link href="/donar" className="shrink-0 text-xs font-bold text-mx-red-600">
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
