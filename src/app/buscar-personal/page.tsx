import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { PremiumBadge } from "@/components/brand/PremiumBadge";
import { PremiumCategoryBanner } from "@/components/brand/PremiumCategoryBanner";
import { Button } from "@/components/ui/Button";
import { LABOR_CATEGORIES } from "@/lib/constants";
import { MapPin, Briefcase, Lock } from "lucide-react";
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
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Buscar personal</h1>
        <p className="mt-1 text-sm text-navy-800/60">
          Explorá perfiles de trabajadores mexicanos disponibles.
        </p>

        {!isCompany ? (
          <Card className="mt-5 flex flex-col items-center gap-3 p-6 text-center">
            <Lock className="h-6 w-6 text-navy-800/40" />
            <p className="text-sm text-navy-800/70">
              Esta sección es para empresas. {session ? "Tu cuenta actual no es de empresa." : "Iniciá sesión con una cuenta de empresa para buscar personal."}
            </p>
            <Button href={session ? "/" : "/registro/empresa"} size="sm">
              {session ? "Volver al inicio" : "Crear cuenta de empresa"}
            </Button>
          </Card>
        ) : (
          <>
            <form className="mt-5 flex flex-col gap-3">
              <select
                name="categoria"
                defaultValue={categoria ?? ""}
                className="h-11 rounded-xl border border-sand-200 bg-white px-3.5 text-sm text-navy-900"
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
                className="h-11 rounded-xl border border-sand-200 bg-white px-3.5 text-sm text-navy-900 placeholder:text-navy-800/35"
              />
              <Button type="submit">Filtrar</Button>
            </form>

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
