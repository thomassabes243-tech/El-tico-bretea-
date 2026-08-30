import Link from "next/link";
import { ShieldCheck, MapPin, ChevronRight, Coins, Clock, Sparkles } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CATEGORY_ICON_MAP, CategoryIcon } from "@/components/brand/CategoryIcon";
import { SafetyBadgeIcon } from "@/components/brand/SafetyBadgeIcon";
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
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-navy-900">
          ¿Qué necesitás hacer hoy?
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-navy-800/60">
          Encontrá trabajo, ofrecé tus servicios o contratá a alguien.
        </p>

        {/* 3. Buscador */}
        <div className="mt-4">
          <SmartSearchBar />
          <p className="mt-1.5 px-1 text-[11px] text-navy-800/40">
            Ej. ayudante, mesero, limpieza, plomero...
          </p>
        </div>

        {/* 4. Pedir un servicio / Ofrecer mis servicios -- las dos acciones
            centrales, mismo peso visual, una en rojo y otra en navy. */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <Link href="/servicios/nueva" className="block">
            <Card className="flex h-full flex-col items-start gap-2.5 border-mx-red-600/15 bg-mx-red-100/40 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mx-red-600 text-white shadow-sm shadow-mx-red-600/25">
                <ServiceRequestIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold leading-snug text-navy-900">Necesito un servicio</p>
              <p className="text-[11px] leading-snug text-navy-800/55">
                Encontrá a alguien para hacer el trabajo
              </p>
            </Card>
          </Link>
          <Link href="/empresa/servicios" className="block">
            <Card className="flex h-full flex-col items-start gap-2.5 border-navy-900/10 bg-navy-900/[0.04] p-4 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-sm shadow-navy-900/25">
                <ServiceOfferIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold leading-snug text-navy-900">Quiero trabajar</p>
              <p className="text-[11px] leading-snug text-navy-800/55">
                Ofrecé tus servicios y encontrá clientes
              </p>
            </Card>
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

        {/* 7. Seguridad -- compacto a propósito: nunca "trabajo seguro" ni
            "empresa segura", solo una herramienta adicional de protección. */}
        <Card className="mt-6 flex flex-col gap-3 border-mx-red-600/20 bg-mx-red-100/50 p-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mx-red-600 text-white shadow-sm shadow-mx-red-600/30">
              <SafetyBadgeIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-navy-900">¿Vas a una chamba nueva?</p>
              <p className="text-xs leading-snug text-navy-800/60">
                Compartí tu ubicación con alguien de confianza.
              </p>
            </div>
          </div>
          <Link
            href="/seguridad"
            className="block rounded-xl bg-mx-red-600 py-2.5 text-center text-xs font-bold text-white transition-transform active:scale-[0.98]"
          >
            Configurar protección
          </Link>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
