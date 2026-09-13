import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { PremiumBadge } from "@/components/brand/PremiumBadge";
import { PremiumCategoryBanner } from "@/components/brand/PremiumCategoryBanner";
import { HeroImage } from "@/components/brand/HeroImage";
import { Button } from "@/components/ui/Button";
import { LABOR_CATEGORIES } from "@/lib/constants";
import { MapPin, Briefcase, Lock, Search, ShieldCheck, UserRoundSearch } from "lucide-react";
import type { LaborCategory } from "@prisma/client";

export default async function BuscarPersonalPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; ubicacion?: string }>;
}) {
  const session = await auth();
  const { categoria, ubicacion } = await searchParams;

  const isCompany = session?.user?.role === "COMPANY";
  const selectedCategory = categoria ? LABOR_CATEGORIES.find((c) => c.value === categoria) : undefined;

  // Premium destacado por categoría: mientras una empresa explora
  // trabajadores DENTRO de una categoría puntual, se le recuerda que su
  // propio perfil profesional (Cotizaciones) también puede destacarse --
  // nunca a quien ya tiene el Plan Profesional activo.
  let showCompanyPremiumBanner = false;
  if (isCompany && selectedCategory) {
    const company = await prisma.companyProfile.findUnique({
      where: { userId: session!.user.id },
      select: { offersServices: true, professionalPlanActive: true },
    });
    showCompanyPremiumBanner = Boolean(company?.offersServices && !company.professionalPlanActive);
  }

  const workers = isCompany
    ? await prisma.workerProfile.findMany({
        where: {
          isPublic: true,
          ...(categoria ? { laborCategory: categoria as LaborCategory } : {}),
          ...(ubicacion
            ? { residence: { contains: ubicacion, mode: "insensitive" } }
            : {}),
        },
        orderBy: [{ isPremium: "desc" }, { createdAt: "desc" }],
        take: 30,
      })
    : [];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-4">
        <section className="relative min-h-[238px] overflow-hidden rounded-[28px] bg-navy-950 px-6 py-7 text-white shadow-[0_20px_44px_rgba(6,27,51,0.22)]">
          <HeroImage src="/assets/images/hero-worker.jpg" alt="" fallbackClassName="bg-navy-950" className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.42]" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/84 to-navy-950/25" />
          <div className="relative flex min-h-[182px] max-w-[78%] flex-col justify-end">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-inset ring-white/15">
              <UserRoundSearch className="h-5 w-5" />
            </span>
            <h1 className="mt-4 text-[30px] font-extrabold leading-[1.05] tracking-[-0.04em]">Encontrá personal para tu negocio</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/72">Filtrá perfiles profesionales disponibles por oficio y ubicación.</p>
          </div>
        </section>

        {!isCompany ? (
          <Card className="relative z-10 -mt-4 mx-3 flex flex-col items-center gap-3 border-0 p-7 text-center shadow-[0_14px_34px_rgba(10,38,71,0.13)]">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900/[0.07] text-navy-700"><Lock className="h-5 w-5" /></span>
            <p className="text-sm leading-relaxed text-navy-800/70">
              Esta sección es para empresas. {session ? "Tu cuenta actual no es de empresa." : "Iniciá sesión con una cuenta de empresa para buscar personal."}
            </p>
            <Button href={session ? "/" : "/registro/empresa"} size="sm">
              {session ? "Volver al inicio" : "Crear cuenta de empresa"}
            </Button>
          </Card>
        ) : (
          <>
            <Card className="relative z-10 -mt-4 mx-3 border-0 p-4 shadow-[0_14px_34px_rgba(10,38,71,0.14)]">
              <form className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-navy-800/45"><Search className="h-4 w-4" /> Filtrar talento</div>
                <select
                  name="categoria"
                  defaultValue={categoria ?? ""}
                  className="h-12 rounded-xl border border-sand-200 bg-white px-3.5 text-sm text-navy-900"
                >
                  <option value="">Todas las categorías</option>
                  {LABOR_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <input
                  name="ubicacion"
                  defaultValue={ubicacion ?? ""}
                  placeholder="Ubicación (ej. Ciudad de México)"
                  className="h-12 rounded-xl border border-sand-200 bg-white px-3.5 text-sm text-navy-900 placeholder:text-navy-800/35"
                />
                <Button type="submit" variant="secondary">Buscar personal</Button>
              </form>
            </Card>

            <div className="mt-4 flex items-start gap-3 rounded-[20px] border border-mx-green-600/15 bg-mx-green-600/[0.06] p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-mx-green-600" />
              <p className="text-xs leading-relaxed text-navy-800/65"><strong className="text-navy-900">Contratación responsable:</strong> verificá referencias, explicá condiciones y nunca retengás documentos personales.</p>
            </div>

            {showCompanyPremiumBanner && selectedCategory && (
              <PremiumCategoryBanner variant="company" categoryLabel={selectedCategory.label} />
            )}

            <div className="mt-5 flex flex-col gap-3">
              {workers.length === 0 && (
                <Card className="p-6 text-center text-sm text-navy-800/60">
                  No hay trabajadores que coincidan con tu búsqueda todavía.
                </Card>
              )}
              {workers.map((w) => (
                <Card
                  key={w.id}
                  className={
                    w.isPremium
                      ? "flex items-center gap-3.5 border-peso-600/25 bg-peso-100/25 p-4"
                      : "flex items-center gap-3.5 p-4"
                  }
                >
                  <CategoryIcon category={w.laborCategory} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
                      <span className="truncate">{w.fullName}</span>
                      {w.isPremium && <PremiumBadge />}
                    </p>
                    <p className="truncate text-xs text-navy-800/60">{w.profession}</p>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-navy-800/50">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {w.residence}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {w.yearsExperience} años</span>
                    </div>
                  </div>
                  <Link href={`/trabajadores/${w.id}`} className="shrink-0 text-xs font-semibold text-mx-red-600">
                    Ver
                  </Link>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
