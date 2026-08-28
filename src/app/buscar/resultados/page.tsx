import Link from "next/link";
import { ChevronLeft, Inbox, MapPin, Users, ChevronRight, Search, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { JOB_TYPES } from "@/lib/constants";

function labelFor(list: readonly { value: string; label: string }[], value: string) {
  return list.find((i) => i.value === value)?.label ?? value;
}

export default async function BuscarResultadosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const jobPostings = query
    ? await prisma.jobPosting.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
            { company: { commercialName: { contains: query, mode: "insensitive" } } },
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
        <Link href="/" className="flex items-center gap-1 text-sm font-medium text-navy-800/60">
          <ChevronLeft className="h-4 w-4" /> Inicio
        </Link>

        <form action="/buscar/resultados" method="GET" className="mt-3">
          <div className="flex items-center gap-2 rounded-2xl border border-sand-200 bg-white px-4 py-3 shadow-sm shadow-navy-900/[0.04]">
            <Search className="h-4.5 w-4.5 shrink-0 text-navy-800/40" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Buscar trabajos, empresas o palabras clave..."
              className="w-full bg-transparent text-sm text-navy-900 placeholder:text-navy-800/40 outline-none"
            />
          </div>
        </form>

        <h1 className="mt-5 text-lg font-extrabold tracking-tight text-navy-900">
          {query ? `Resultados para "${query}"` : "Buscá una palabra clave"}
        </h1>

        <div className="mt-4 flex flex-col gap-3">
          {query && jobPostings.length === 0 && (
            <Card className="flex flex-col items-center gap-3 p-8 text-center">
              <Inbox className="h-8 w-8 text-navy-800/30" />
              <p className="text-sm font-semibold text-navy-900">No encontramos vacantes para esa búsqueda</p>
              <p className="text-xs text-navy-800/50">Probá con otra palabra o mirá las categorías.</p>
            </Card>
          )}
          {jobPostings.map((job) => (
            <Link key={job.id} href={`/vacantes/${job.id}`}>
              <Card className="p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-navy-900">{job.title}</p>
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
                    {labelFor(JOB_TYPES, job.contractType)}
                  </span>
                  {job.quantity && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2 py-0.5">
                      <Users className="h-3 w-3" /> {job.quantity}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
