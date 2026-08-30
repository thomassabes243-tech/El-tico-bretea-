import { Fragment } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Inbox, MapPin, Users, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { PremiumCategoryBanner } from "@/components/brand/PremiumCategoryBanner";
import { LABOR_CATEGORIES, JOB_TYPES } from "@/lib/constants";
import { findJobPostingsFeaturedFirst, isFeatured } from "@/lib/job-postings";
import { getAdEligibility, getActiveAds } from "@/lib/ads";
import { SalarySemaforo } from "@/components/vacantes/SalarySemaforo";
import { AdSlot } from "@/components/ads/AdSlot";
import { AdSenseSlot } from "@/components/ads/AdSenseSlot";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  const [jobPostings, adEligible, ads, session] = await Promise.all([
    findJobPostingsFeaturedFirst({ laborCategory: category.value as LaborCategory, isActive: true }, 30),
    getAdEligibility(),
    getActiveAds(),
    auth(),
  ]);

  // Premium destacado por categoría: invitación contextualizada a la
  // categoría que se está explorando, para trabajador o empresa según el
  // rol de quien está logueado -- nunca se le muestra a alguien que ya es
  // Premium/Destacado (no gritar "comprame" a quien ya pagó).
  let premiumBannerVariant: "worker" | "company" | null = null;
  if (session?.user?.role === "WORKER") {
    const worker = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
      select: { isPremium: true },
    });
    if (worker && !worker.isPremium) premiumBannerVariant = "worker";
  } else if (session?.user?.role === "COMPANY") {
    const company = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
      select: { offersServices: true, professionalPlanActive: true },
    });
    if (company?.offersServices && !company.professionalPlanActive) premiumBannerVariant = "company";
  }

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

        {premiumBannerVariant && (
          <PremiumCategoryBanner variant={premiumBannerVariant} categoryLabel={category.label} />
        )}

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
          {jobPostings.map((job, index) => (
            <Fragment key={job.id}>
              {index === 3 && jobPostings.length > 4 && <AdSenseSlot eligible={adEligible} />}
              <Link href={`/vacantes/${job.id}`}>
                <Card className="p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
                        {job.title}
                        {isFeatured(job.featuredUntil) && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-peso-100 px-1.5 py-0.5 text-[10px] font-bold text-peso-700">
                            <Sparkles className="h-2.5 w-2.5" /> Destacada
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
                      {labelFor(JOB_TYPES, job.contractType)}
                    </span>
                    {job.quantity && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2 py-0.5">
                        <Users className="h-3 w-3" /> {job.quantity}
                      </span>
                    )}
                    {job.salary && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-mx-red-100 px-2 py-0.5 text-mx-red-700">
                        {job.salary}
                        <SalarySemaforo category={job.laborCategory} salaryText={job.salary} compact />
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            </Fragment>
          ))}
        </div>

        <AdSlot eligible={adEligible} ads={ads} />
      </main>
      <BottomNav />
    </div>
  );
}
