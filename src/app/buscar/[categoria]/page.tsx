import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Search, MapPin, Users, ChevronRight, Flame } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { Badge, TagChip } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
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

        <div className="mt-3.5 flex items-center gap-3.5">
          <CategoryIcon category={category.value} size="lg" />
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-navy-900">{category.label}</h1>
            <p className="text-xs text-navy-800/50">
              {jobPostings.length === 0
                ? "Sin bretes activos por ahora"
                : `${jobPostings.length} brete${jobPostings.length !== 1 ? "s" : ""} disponible${jobPostings.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {jobPostings.length === 0 && (
            <EmptyState
              icon={Search}
              title="No hay bretes por aquí todavía"
              description="Cuando aparezcan nuevas oportunidades en esta categoría, las vas a encontrar aquí."
              action={{ label: "Ver otras categorías", href: "/buscar" }}
            />
          )}
          {jobPostings.map((job) => (
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
                  {job.salary && (
                    <TagChip className="bg-cr-red-100 text-cr-red-700">{job.salary}</TagChip>
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
