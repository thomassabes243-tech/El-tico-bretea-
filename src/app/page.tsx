import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Users,
  MapPin,
  MessagesSquare,
  ShieldCheck,
  HeartHandshake,
  ChevronRight,
  Briefcase,
  Flame,
  Star,
} from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, TagChip } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { COMMUNITY_CATEGORIES, LABOR_CATEGORIES, JOB_TYPES, CATEGORY_PHOTOS } from "@/lib/constants";
import { getDailyQuote } from "@/lib/motivational-quotes";
import { getAdEligibility, getActiveAds } from "@/lib/ads";
import { AdSlot } from "@/components/ads/AdSlot";
import { prisma } from "@/lib/prisma";

function labelFor(list: readonly { value: string; label: string }[], value: string) {
  return list.find((i) => i.value === value)?.label ?? value;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ "cuenta-eliminada"?: string }>;
}) {
  const quote = getDailyQuote();
  const [adEligible, ads, featuredJobs] = await Promise.all([
    getAdEligibility(),
    getActiveAds(),
    prisma.jobPosting.findMany({
      where: { isActive: true, isFeatured: true },
      include: { company: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);
  const newJobs = await prisma.jobPosting.findMany({
    where: { isActive: true, id: { notIn: featuredJobs.map((j) => j.id) } },
    include: { company: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
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
        <section className="animate-fade-in-up relative overflow-hidden rounded-3xl">
          <Image
            src="/hero-worker.jpg"
            alt="Trabajador breteando en Costa Rica"
            width={1600}
            height={1067}
            priority
            className="h-56 w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/50 to-navy-950/10" />
          <div className="absolute inset-0 flex flex-col justify-end px-6 py-6">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white">¡Pura Vida!</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/80">{quote}</p>
            <div className="mt-5">
              <Button
                href="/buscar-personal"
                variant="outline"
                fullWidth
                className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                <Users className="h-4 w-4" /> Buscar Personal
              </Button>
            </div>
          </div>
        </section>

        {/* Buscador */}
        <section className="mt-5">
          <form action="/buscar" className="relative group">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-navy-800/40 transition-colors group-focus-within:text-navy-900" />
            <input
              name="q"
              placeholder="Buscar puestos, empresas o palabras clave..."
              className="h-12 w-full rounded-xl border border-sand-200 bg-white pl-11 pr-4 text-sm text-navy-900 placeholder:text-navy-800/40 shadow-ambient outline-none transition-colors focus:border-navy-700 focus:ring-2 focus:ring-navy-700/10"
            />
          </form>
        </section>

        {/* Chips de categoría */}
        <section className="mt-4">
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            <Link
              href="/buscar"
              className="shrink-0 rounded-full bg-navy-900 px-4 py-2 text-xs font-bold text-white shadow-ambient transition-colors hover:bg-navy-800"
            >
              Todos
            </Link>
            {LABOR_CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/buscar/${cat.value.toLowerCase()}`}
                className="shrink-0 rounded-full border border-sand-200 bg-white px-4 py-2 text-xs font-bold text-navy-900 shadow-ambient transition-colors hover:bg-sand-100"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Bretes Destacados */}
        <section className="mt-8">
          <SectionHeader title="Bretes Destacados" href="/buscar" />
          <div className="mt-3.5 flex flex-col gap-3">
            {featuredJobs.length === 0 && (
              <EmptyState
                icon={Star}
                title="Todavía no hay bretes destacados"
                description="El equipo de El Tico Bretea va destacando los mejores bretes acá."
                action={{ label: "Buscar bretes", href: "/buscar" }}
              />
            )}
            {featuredJobs.map((job) => (
              <Link key={job.id} href={`/vacantes/${job.id}`}>
                <Card className="relative overflow-hidden p-4 transition-all hover:-translate-y-0.5 hover:shadow-active">
                  <Badge tone="featured" icon={<Star className="h-3 w-3 fill-current" />} className="absolute right-0 top-0 rounded-bl-lg rounded-tr-2xl">
                    Brete Premium
                  </Badge>
                  <div className="flex items-start gap-3 pr-2">
                    <CategoryIcon category={job.laborCategory} size="md" />
                    <div className="min-w-0 flex-1">
                      {job.company.isVerified && (
                        <Badge tone="premium" className="mb-1.5">Empresa verificada</Badge>
                      )}
                      <p className="truncate font-heading text-sm font-bold text-navy-900">{job.title}</p>
                      <p className="truncate text-xs text-navy-800/50">{job.company.commercialName}</p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <TagChip icon={<MapPin className="h-3 w-3" />}>{job.location}</TagChip>
                        <TagChip>{labelFor(JOB_TYPES, job.contractType)}</TagChip>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Nuevos Bretes */}
        <section className="mt-8">
          <SectionHeader title="Nuevos Bretes" />
          <div className="mt-3.5 flex flex-col gap-3">
            {newJobs.length === 0 && featuredJobs.length === 0 && (
              <EmptyState
                icon={Briefcase}
                title="Todavía no hay bretes publicados"
                description="Cuando aparezcan nuevas oportunidades, las vas a encontrar aquí."
                action={{ label: "Buscar bretes", href: "/buscar" }}
              />
            )}
            {newJobs.map((job) => (
              <Link key={job.id} href={`/vacantes/${job.id}`}>
                <Card className="p-4 transition-all hover:-translate-y-0.5 hover:shadow-active">
                  <div className="flex items-start gap-3">
                    <CategoryIcon category={job.laborCategory} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-heading text-sm font-bold text-navy-900">{job.title}</p>
                        {job.isUrgent && (
                          <Badge tone="red" icon={<Flame className="h-3 w-3" />}>Urgente</Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-navy-800/50">{job.company.commercialName}</p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        <TagChip icon={<MapPin className="h-3 w-3" />}>{job.location}</TagChip>
                        <TagChip>{labelFor(JOB_TYPES, job.contractType)}</TagChip>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-navy-800/30" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          {(newJobs.length > 0 || featuredJobs.length > 0) && (
            <Button href="/buscar" variant="outline" fullWidth className="mt-3.5">
              Cargar más bretes
            </Button>
          )}
        </section>

        {/* Comunidad Tica */}
        <section className="mt-8">
          <Link href="/comunidad">
            <Card className="flex items-center gap-3.5 p-4 transition-all hover:-translate-y-0.5 hover:shadow-active">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-white">
                <MessagesSquare className="h-5.5 w-5.5" strokeWidth={2.1} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-navy-900">Comunidad Tica</h3>
                <p className="mt-0.5 text-xs leading-snug text-navy-800/60">
                  Conectá, compartí y crecé con otros ticos.
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-navy-800/30" />
            </Card>
          </Link>
        </section>

        {/* Comunidades por gremio */}
        <section className="mt-9">
          <SectionHeader title="Comunidades por gremio" href="/comunidad" linkLabel="Ver todas" />
          <div className="mt-3.5 flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {COMMUNITY_CATEGORIES.map((cat) => {
              const photo = CATEGORY_PHOTOS[cat.value];
              return (
                <Link key={cat.value} href={`/comunidad/${cat.value.toLowerCase()}`}>
                  <Card className="relative flex h-32 w-36 shrink-0 flex-col items-start justify-end gap-1.5 overflow-hidden p-4">
                    {photo && (
                      <>
                        <Image src={photo} alt="" fill sizes="144px" className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/25 to-transparent" />
                      </>
                    )}
                    <div className="relative flex flex-col items-start gap-1.5">
                      <CategoryIcon category={cat.value} size="sm" />
                      <span className={`text-sm font-semibold ${photo ? "text-white" : "text-navy-900"}`}>
                        {cat.label}
                      </span>
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
