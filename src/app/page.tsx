import Link from "next/link";
import {
  BriefcaseBusiness,
  ChevronRight,
  Clock,
  Coins,
  FileText,
  MapPin,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserRoundSearch,
  UsersRound,
  Wrench,
} from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CATEGORY_ICON_MAP } from "@/components/brand/CategoryIcon";
import { SafetyBadgeIcon } from "@/components/brand/SafetyBadgeIcon";
import { HeroImage } from "@/components/brand/HeroImage";
import { ServiceRequestIcon, ServiceOfferIcon } from "@/components/brand/ServiceIcons";
import { SmartSearchBar } from "@/components/forms/SmartSearchBar";
import { LABOR_CATEGORIES, JOB_TYPES } from "@/lib/constants";
import { findJobPostingsFeaturedFirst, isFeatured } from "@/lib/job-postings";

function labelFor(list: readonly { value: string; label: string }[], value: string) {
  return list.find((i) => i.value === value)?.label ?? value;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ "cuenta-eliminada"?: string }>;
}) {
  const { "cuenta-eliminada": cuentaEliminada } = await searchParams;
  const chambas = await findJobPostingsFeaturedFirst({ isActive: true }, 8);
  // Es un componente de servidor: el instante se toma una vez por solicitud
  // para etiquetar publicaciones de menos de tres días como nuevas.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-4">
        {cuentaEliminada && (
          <div className="mb-4 rounded-2xl border border-success-600/25 bg-success-600/10 px-4 py-3 text-sm font-medium text-success-600">
            Tu cuenta fue eliminada. Gracias por haber usado El Mexa Chamba.
          </div>
        )}

        <Link
          href="/bienvenida"
          className="mb-4 flex items-start gap-3 rounded-2xl border border-mx-red-600/15 bg-mx-red-100/55 px-4 py-3.5 text-navy-900 shadow-[0_6px_18px_rgba(10,38,71,0.05)]"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mx-red-600 text-white">
            <ShieldAlert className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block text-sm">Antes de aceptar una chamba</strong>
            <span className="mt-0.5 block text-xs leading-relaxed text-navy-800/65">
              No pagués por una vacante ni entregués documentos originales. Conocé las señales de alerta.
            </span>
          </span>
          <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-mx-red-600" />
        </Link>

        <section className="relative min-h-[278px] overflow-hidden rounded-[28px] bg-navy-950 px-6 py-7 text-white shadow-[0_22px_48px_rgba(6,27,51,0.24)]">
          <HeroImage src="/assets/images/hero-worker.jpg" alt="" fallbackClassName="bg-navy-950" className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.42]" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/25" />
          <div className="relative flex min-h-[222px] max-w-[76%] flex-col justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.13em] text-white/90 backdrop-blur">
              <Sparkles className="h-3 w-3 text-mx-red-500" /> Aquí sí hay chamba
            </span>
            <h1 className="mt-3 text-[31px] font-extrabold leading-[1.03] tracking-[-0.04em]">Trabajo y talento en un lugar seguro</h1>
            <p className="mt-3 text-[13px] leading-relaxed text-white/78">Encontrá una oportunidad, ofrecé un servicio o contratá personal en México.</p>
          </div>
        </section>

        {/* 3. Buscador */}
        <div className="relative z-10 -mt-3 mx-3 rounded-2xl bg-white p-1 shadow-[0_10px_28px_rgba(10,38,71,0.14)]">
          <SmartSearchBar />
        </div>

        <section className="mt-5" aria-labelledby="elige-camino">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-mx-red-600">Empezá por aquí</p>
              <h2 id="elige-camino" className="mt-1 text-lg font-extrabold tracking-tight text-navy-900">¿Qué necesitás hoy?</h2>
            </div>
            <Link href="/bienvenida" className="text-xs font-bold text-navy-700">Guía segura</Link>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <Link href="/buscar" className="group relative overflow-hidden rounded-[22px] bg-navy-950 p-4 text-white shadow-[0_12px_28px_rgba(10,38,71,0.18)] transition-transform active:scale-[0.98]">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-mx-red-600/30 blur-2xl" />
              <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-inset ring-white/15">
                <Search className="h-5 w-5" />
              </span>
              <h3 className="relative mt-8 text-base font-extrabold">Busco trabajo</h3>
              <p className="relative mt-1 text-[11px] leading-relaxed text-white/65">Vacantes por oficio y ubicación</p>
              <ChevronRight className="relative mt-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link href="/buscar-personal" className="group relative overflow-hidden rounded-[22px] bg-mx-red-600 p-4 text-white shadow-[0_12px_28px_rgba(206,17,38,0.20)] transition-transform active:scale-[0.98]">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
              <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/14 ring-1 ring-inset ring-white/20">
                <UserRoundSearch className="h-5 w-5" />
              </span>
              <h3 className="relative mt-8 text-base font-extrabold">Quiero contratar</h3>
              <p className="relative mt-1 text-[11px] leading-relaxed text-white/75">Encontrá personal disponible</p>
              <ChevronRight className="relative mt-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3" aria-label="Herramientas principales">
          {[
            { href: "/servicios/mis-solicitudes", title: "Cotizaciones", text: "Pedí u ofrecé servicios", Icon: Wrench, tone: "bg-peso-100 text-peso-700" },
            { href: "/cv", title: "CV profesional", text: "Presentá tus habilidades", Icon: FileText, tone: "bg-navy-900/[0.07] text-navy-900" },
            { href: "/comunidad", title: "Comunidad", text: "Conectá con confianza", Icon: UsersRound, tone: "bg-mx-green-600/10 text-mx-green-600" },
            { href: "/planes", title: "Más visibilidad", text: "Planes opcionales", Icon: Sparkles, tone: "bg-mx-red-100 text-mx-red-700" },
          ].map(({ href, title, text, Icon, tone }) => (
            <Link key={href} href={href}>
              <Card className="flex min-h-28 items-start gap-3 border-0 p-4 transition-transform active:scale-[0.98]">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <strong className="block text-sm text-navy-900">{title}</strong>
                  <span className="mt-1 block text-[11px] leading-relaxed text-navy-800/50">{text}</span>
                </span>
              </Card>
            </Link>
          ))}
        </section>

        {/* 4. Pedir un servicio / Ofrecer mis servicios -- las dos acciones
            centrales, mismo peso visual, una en rojo y otra en navy. Foto
            real de fondo (oscurecida) + el mismo ícono propio de siempre,
            en dos tamaños, sin sacar nada de lo que ya había. */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link href="/servicios/nueva" className="group relative flex h-44 flex-col justify-between overflow-hidden rounded-[20px] bg-mx-red-600 p-4 text-white shadow-[0_12px_28px_rgba(206,17,38,0.20)] transition-all active:scale-[0.98]">
            <HeroImage
              src="/assets/images/servicio-electricista.jpg"
              alt=""
              fallbackClassName="bg-mx-red-600"
              className="absolute inset-0 h-full w-full brightness-[0.45] transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-mx-red-600/30 mix-blend-multiply" />
            <ServiceRequestIcon className="pointer-events-none absolute -bottom-4 -right-4 h-28 w-28 text-white opacity-10 transition-transform group-hover:scale-110" />
            <ServiceRequestIcon className="relative h-7 w-7" />
            <div className="relative">
              <h3 className="text-[15px] font-bold uppercase leading-tight">Necesito un servicio</h3>
              <p className="mt-1 text-[11px] leading-tight text-white/80">
                Encontrá a alguien para hacer el trabajo
              </p>
            </div>
            <ChevronRight className="relative ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/empresa/servicios" className="group relative flex h-44 flex-col justify-between overflow-hidden rounded-[20px] bg-navy-900 p-4 text-white shadow-[0_12px_28px_rgba(10,38,71,0.20)] transition-all active:scale-[0.98]">
            <HeroImage
              src="/assets/images/quiero-trabajar.jpg"
              alt=""
              fallbackClassName="bg-navy-900"
              className="absolute inset-0 h-full w-full brightness-[0.45] transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-navy-900/30 mix-blend-multiply" />
            <ServiceOfferIcon className="pointer-events-none absolute -bottom-4 -right-4 h-28 w-28 text-white opacity-10 transition-transform group-hover:scale-110" />
            <ServiceOfferIcon className="relative h-7 w-7" />
            <div className="relative">
              <h3 className="text-[15px] font-bold uppercase leading-tight">Quiero trabajar</h3>
              <p className="mt-1 text-[11px] leading-tight text-white/80">
                Ofrecé tus servicios y encontrá clientes
              </p>
            </div>
            <ChevronRight className="relative ml-auto h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white bg-white px-3.5 py-3 shadow-[0_6px_18px_rgba(10,38,71,0.06)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-mx-green-600/10 text-mx-green-600"><BriefcaseBusiness className="h-4.5 w-4.5" /></span>
            <span><strong className="block text-sm text-navy-900">Vacantes reales</strong><small className="text-[10px] text-navy-800/50">Publicación directa</small></span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white bg-white px-3.5 py-3 shadow-[0_6px_18px_rgba(10,38,71,0.06)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-peso-100 text-peso-600"><UsersRound className="h-4.5 w-4.5" /></span>
            <span><strong className="block text-sm text-navy-900">Comunidad</strong><small className="text-[10px] text-navy-800/50">Conexión confiable</small></span>
          </div>
        </div>

        {/* 5. Categorías */}
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900">Explorar por oficio</h2>
            <Link href="/buscar" className="text-xs font-semibold text-mx-red-600">
              Ver todas
            </Link>
          </div>
          <div className="scrollbar-none -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
            <Link
              href="/buscar"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-navy-900 px-3.5 py-2 text-xs font-semibold text-white transition-all active:scale-95"
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
        </section>

        {/* 6. Chambas para ti -- una sola lista (destacadas primero, después
            el resto), sin sección vacía separada para "destacados". */}
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-900">Chambas para ti</h2>
            <Link href="/buscar" className="text-xs font-semibold text-mx-red-600">
              Ver todos
            </Link>
          </div>

          {chambas.length === 0 ? (
            <Card className="mt-3 flex flex-col items-center gap-2.5 p-8 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-900/[0.06] text-navy-800/40">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm font-bold text-navy-900">Todavía no hay chambas publicadas</p>
              <p className="text-xs leading-relaxed text-navy-800/50">
                Cuando aparezcan nuevas oportunidades, las vas a encontrar acá.
              </p>
              <Button href="/buscar" variant="secondary" size="sm" className="mt-1">
                Explorar trabajos
              </Button>
            </Card>
          ) : (
            <div className="mt-3 flex flex-col gap-2.5">
              {chambas.map((job) => {
                const isNew = now - job.createdAt.getTime() < 3 * 24 * 60 * 60 * 1000;
                return (
                  <Link key={job.id} href={`/vacantes/${job.id}`}>
                    <Card className="p-4 transition-shadow hover:shadow-md active:scale-[0.99]">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[15px] font-bold leading-snug text-navy-900">{job.title}</p>
                        {isFeatured(job.featuredUntil) ? (
                          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-peso-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-peso-700">
                            <Sparkles className="h-2.5 w-2.5" /> Destacada
                          </span>
                        ) : isNew ? (
                          <span className="inline-flex shrink-0 items-center rounded-full bg-success-600/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success-600">
                            Nueva
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-sm text-navy-800/55">
                        {job.company.commercialName}
                        {job.company.isVerified && (
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success-600" aria-label="Empresa verificada" />
                        )}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                        <span className="flex items-center gap-1 text-xs text-navy-800/55">
                          <MapPin className="h-3.5 w-3.5" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-navy-800/55">
                          <Clock className="h-3.5 w-3.5" /> {labelFor(JOB_TYPES, job.contractType)}
                        </span>
                        {job.salary && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-mx-red-600">
                            <Coins className="h-3.5 w-3.5" /> {job.salary}
                          </span>
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* 7. Seguridad -- compacto a propósito: nunca "trabajo seguro" ni
            "empresa segura", solo una herramienta adicional de protección.
            Tono neutro (no rojo) para que no compita con las 2 acciones
            centrales de arriba. Foto real de fondo, muy tenue (mismo estilo
            de foto que el resto), para no perder el tono neutro ya decidido. */}
        <Card className="relative mt-6 flex flex-col gap-4 overflow-hidden bg-sand-50 p-4">
          <HeroImage
            src="/assets/images/seguridad-calle.jpg"
            alt=""
            fallbackClassName="bg-sand-50"
            className="absolute inset-0 h-full w-full opacity-15"
          />
          <div className="relative flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-900/10 text-navy-900">
              <SafetyBadgeIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold text-navy-900">¿Vas a una chamba nueva?</p>
              <p className="text-sm leading-snug text-navy-800/60">
                Compartí tu ubicación con alguien de confianza.
              </p>
            </div>
          </div>
          <Link
            href="/seguridad"
            className="relative block rounded-lg border border-sand-200 bg-white py-2.5 text-center text-xs font-bold text-navy-900 transition-transform active:scale-[0.98]"
          >
            Configurar protección
          </Link>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
