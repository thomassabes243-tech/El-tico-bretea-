import Link from "next/link";
import type { ComponentType } from "react";
import {
  Users,
  MapPin,
  MessagesSquare,
  ShieldCheck,
  HeartHandshake,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, TagChip } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { GuanacasteScene } from "@/components/brand/scenery/GuanacasteScene";
import { MonteverdeScene } from "@/components/brand/scenery/MonteverdeScene";
import { CoffeeMountainsScene } from "@/components/brand/scenery/CoffeeMountainsScene";
import { COMMUNITY_CATEGORIES, JOB_TYPES } from "@/lib/constants";
import { getDailyQuote } from "@/lib/motivational-quotes";
import { getAdEligibility, getActiveAds } from "@/lib/ads";
import { AdSlot } from "@/components/ads/AdSlot";
import { prisma } from "@/lib/prisma";

const COMMUNITY_SCENES: Record<string, ComponentType<{ className?: string }>> = {
  CONSTRUCCION: CoffeeMountainsScene,
  HOTELES_TURISMO: GuanacasteScene,
  PROFESIONALES: MonteverdeScene,
};

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
      where: { isActive: true },
      include: { company: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);
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
        <section className="animate-fade-in-up rounded-3xl bg-sand-50 px-6 py-7">
          <h1 className="text-2xl font-extrabold tracking-tight text-navy-900">¡Pura Vida!</h1>
          <p className="mt-2 text-sm leading-relaxed text-navy-800/65">{quote}</p>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <Button href="/buscar" variant="secondary" fullWidth>
              🔍 Buscar Empleo
            </Button>
            <Button href="/buscar-personal" variant="outline" fullWidth>
              <Users className="h-4 w-4" /> Buscar Personal
            </Button>
          </div>
        </section>

        {/* Comunidad Tica */}
        <section className="mt-4">
          <Link href="/comunidad">
            <Card className="flex items-center gap-3.5 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
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

        {/* Bretes Destacados */}
        <section className="mt-9">
          <SectionHeader title="Bretes Destacados" href="/buscar" />
          <div className="mt-3.5 flex flex-col gap-3">
            {featuredJobs.length === 0 && (
              <EmptyState
                icon={Briefcase}
                title="Todavía no hay bretes publicados"
                description="Cuando aparezcan nuevas oportunidades, las vas a encontrar aquí."
                action={{ label: "Buscar bretes", href: "/buscar" }}
              />
            )}
            {featuredJobs.map((job) => (
              <Link key={job.id} href={`/vacantes/${job.id}`}>
                <Card className="p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <CategoryIcon category={job.laborCategory} size="md" />
                    <div className="min-w-0 flex-1">
                      {job.company.isVerified && (
                        <Badge tone="premium" className="mb-1.5">Empresa verificada</Badge>
                      )}
                      <p className="truncate text-sm font-bold text-navy-900">{job.title}</p>
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
        </section>

        {/* Comunidades por gremio */}
        <section className="mt-9">
          <SectionHeader title="Comunidades por gremio" href="/comunidad" linkLabel="Ver todas" />
          <div className="mt-3.5 flex gap-3 overflow-x-auto pb-1 scrollbar-none">
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
