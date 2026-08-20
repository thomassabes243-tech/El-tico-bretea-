import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { Button } from "@/components/ui/Button";
import { Badge, TagChip } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LABOR_CATEGORIES } from "@/lib/constants";
import { MapPin, Briefcase, Lock, Users } from "lucide-react";
import type { LaborCategory } from "@prisma/client";

export default async function BuscarPersonalPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; ubicacion?: string }>;
}) {
  const session = await auth();
  const { categoria, ubicacion } = await searchParams;

  const isCompany = session?.user?.role === "COMPANY";

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
          Explorá perfiles de trabajadores ticos disponibles.
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
                placeholder="Ubicación (ej. San José)"
                className="h-11 rounded-xl border border-sand-200 bg-white px-3.5 text-sm text-navy-900 placeholder:text-navy-800/35"
              />
              <Button type="submit">Filtrar</Button>
            </form>

            <div className="mt-5 flex flex-col gap-3">
              {workers.length === 0 && (
                <EmptyState
                  icon={Users}
                  title="No hay trabajadores por aquí todavía"
                  description="Probá ajustando la categoría o la ubicación de tu búsqueda."
                />
              )}
              {workers.map((w) => (
                <Card key={w.id} className="flex items-center gap-3.5 p-4">
                  <CategoryIcon category={w.laborCategory} size="md" />
                  <div className="min-w-0 flex-1">
                    {w.isPremium && <Badge tone="premium" className="mb-1">Destacado</Badge>}
                    <p className="truncate text-sm font-bold text-navy-900">{w.fullName}</p>
                    <p className="truncate text-xs text-navy-800/60">{w.profession}</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      <TagChip icon={<MapPin className="h-3 w-3" />}>{w.residence}</TagChip>
                      <TagChip icon={<Briefcase className="h-3 w-3" />}>{w.yearsExperience} años</TagChip>
                    </div>
                  </div>
                  <Link href={`/trabajadores/${w.id}`} className="shrink-0 text-xs font-semibold text-cr-red-600">
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
