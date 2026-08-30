import Link from "next/link";
import { ShieldCheck, MapPin, ChevronRight, Coins, Clock, Sparkles } from "lucide-react";
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

        {/* 2. Título -- texto plano, sin tarjeta ni foto de fondo. */}
        <h1 className="text-[28px] font-bold leading-[34px] tracking-tight text-navy-900">
          ¿Qué necesitás hacer hoy?
        </h1>
        <p className="mt-1.5 text-base leading-relaxed text-navy-800/60">
          Encontrá trabajo, ofrecé tus servicios o contratá a alguien.
        </p>

        {/* 3. Buscador */}
        <div className="mt-5">
          <SmartSearchBar />
        </div>

        {/* 4. Pedir un servicio / Ofrecer mis servicios -- las dos acciones
            centrales, mismo peso visual, una en rojo y otra en navy. Foto
            real de fondo (oscurecida) + el mismo ícono propio de siempre,
            en dos tamaños, sin sacar nada de lo que ya había. */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link href="/servicios/nueva" className="group relative flex h-40 flex-col justify-between overflow-hidden rounded-xl bg-mx-red-600 p-4 text-white shadow-sm transition-all active:scale-[0.98]">
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
          <Link href="/empresa/servicios" className="group relative flex h-40 flex-col justify-between overflow-hidden rounded-xl bg-navy-900 p-4 text-white shadow-sm transition-all active:scale-[0.98]">
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
