import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Inbox, MapPin, Users, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { LABOR_CATEGORIES, JOB_TYPES } from "@/lib/constants";
import { getAdEligibility, getActiveAds } from "@/lib/ads";
import { AdSlot } from "@/components/ads/AdSlot";
import type { LaborCategory } from "@prisma/client";

function labelFor(list: readonly { value: string; label: string }[], value: string) {
  return list.find((i) => i.value === value)?.label ?? value;
}

export default async function BuscarCategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const category = LABOR_CATEGORIES.find((c) => c.value.toLowerCase() === categoria);
  if (!category) notFound();

  const [jobPostings, adEligible, ads] = await Promise.all([
    prisma.jobPosting.findMany({
      where: { laborCategory: category.value as LaborCategory, isActive: true },
      include: { company: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    getAdEligibility(),
    getActiveAds(),
  ]);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Link href="/buscar" className="flex items-center gap-1 text-sm font-medium text-navy-800/60">
          <ChevronLeft className="h-4 w-4" /> Categorías
        </Link>

        <div className="mt-3 flex items-center gap-3">
          <CategoryIcon category={category.value} size="lg" />
          <h1 className="text-xl font-extrabold tracking-tight text-navy-900">{category.label}</h1>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {jobPostings.length === 0 && (
            <Card className="flex flex-col items-center gap-3 p-8 text-center">
              <Inbox className="h-8 w-8 text-navy-800/30" />
              <p className="text-sm font-semibold text-navy-900">
                Todavía no hay vacantes publicadas en esta categoría
              </p>
              <p className="text-xs text-navy-800/50">Volvé pronto.</p>
            </Card>
          )}
          {jobPostings.map((job) => (
            <Link key={job.id} href={`/vacantes/${job.id}`}>
              <Card className="p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-navy-900">{job.title}</p>
                    <p className="text-xs text-navy-800/50">{job.company.commercialName}</p>
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
                  {job.salary && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-cr-red-100 px-2 py-0.5 text-cr-red-700">
                      {job.salary}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <AdSlot eligible={adEligible} ads={ads} />
      </main>
      <BottomNav />
    </div>
  );
}
