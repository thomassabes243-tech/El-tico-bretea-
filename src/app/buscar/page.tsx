import Link from "next/link";
import { Search, MapPin, Users, Flame, ChevronRight, ChevronLeft } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { Badge, TagChip } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { LABOR_CATEGORIES, JOB_TYPES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

function labelFor(list: readonly { value: string; label: string }[], value: string) {
  return list.find((i) => i.value === value)?.label ?? value;
}

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim();

  const results = query
    ? await prisma.jobPosting.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { company: true },
        orderBy: { createdAt: "desc" },
        take: 30,
      })
    : [];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <form className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-navy-800/40" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Buscar puestos, empresas o palabras clave..."
            className="h-12 w-full rounded-xl border border-sand-200 bg-white pl-11 pr-4 text-sm text-navy-900 placeholder:text-navy-800/40 shadow-ambient outline-none transition-colors focus:border-navy-700 focus:ring-2 focus:ring-navy-700/10"
          />
        </form>

        {query ? (
          <>
            <div className="mt-5 flex items-center justify-between">
              <Link href="/buscar" className="flex items-center gap-1 text-sm font-medium text-navy-800/60">
                <ChevronLeft className="h-4 w-4" /> Categorías
              </Link>
              <p className="text-xs text-navy-800/50">
                {results.length} resultado{results.length !== 1 ? "s" : ""} para &ldquo;{query}&rdquo;
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {results.length === 0 && (
                <EmptyState
                  icon={Search}
                  title="No encontramos bretes con esa búsqueda"
                  description="Probá con otra palabra clave o explorá por categoría."
                  action={{ label: "Ver categorías", href: "/buscar" }}
                />
              )}
              {results.map((job) => (
                <Link key={job.id} href={`/vacantes/${job.id}`}>
                  <Card className="p-4 transition-all hover:-translate-y-0.5 hover:shadow-active">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-navy-900">{job.title}</p>
                          {job.isUrgent && (
                            <Badge tone="red" icon={<Flame className="h-3 w-3" />}>Urgente</Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-navy-800/50">{job.company.commercialName}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-navy-800/30" />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <TagChip icon={<MapPin className="h-3 w-3" />}>{job.location}</TagChip>
                      <TagChip>{labelFor(JOB_TYPES, job.contractType)}</TagChip>
                      {job.quantity && (
                        <TagChip icon={<Users className="h-3 w-3" />}>{job.quantity}</TagChip>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-5 text-xl font-extrabold tracking-tight text-navy-900">Buscar trabajo</h1>
            <p className="mt-1 text-sm text-navy-800/60">
              Elegí una categoría para ver las vacantes disponibles.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {LABOR_CATEGORIES.map((cat) => (
                <Link key={cat.value} href={`/buscar/${cat.value.toLowerCase()}`}>
                  <Card className="flex flex-col items-start gap-2.5 p-4 transition-all hover:-translate-y-0.5 hover:shadow-active">
                    <CategoryIcon category={cat.value} size="md" />
                    <span className="text-sm font-semibold text-navy-900">{cat.label}</span>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
