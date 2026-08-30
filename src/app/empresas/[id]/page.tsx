import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { AvatarImage } from "@/components/brand/AvatarImage";
import { ReportButton } from "@/components/forms/ReportButton";
import { PremiumBadge } from "@/components/brand/PremiumBadge";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { getServiceRatings } from "@/lib/service-ratings";
import { ShieldCheck, MapPin, ChevronRight, Wrench, Star, Phone, FileText, Briefcase } from "lucide-react";

function serviceLabelFor(value: string) {
  return SERVICE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export default async function EmpresaPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [company, session] = await Promise.all([
    prisma.companyProfile.findUnique({
      where: { id },
      include: {
        jobPostings: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
        portfolioPhotos: { orderBy: { createdAt: "desc" } },
      },
    }),
    auth(),
  ]);
  if (!company) notFound();

  const ratings = company.offersServices ? await getServiceRatings([company.id]) : new Map();
  const rating = ratings.get(company.id);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <AvatarImage
              src={company.logoUrl}
              alt={company.commercialName}
              className="h-16 w-16 shrink-0 rounded-2xl object-cover"
              fallback={
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-mx-red-600/[0.09] text-xl font-extrabold text-mx-red-600">
                  {company.commercialName.slice(0, 1).toUpperCase()}
                </div>
              }
            />
            <div>
              <h1 className="flex items-center gap-1.5 text-lg font-extrabold text-navy-900">
                {company.commercialName}
                {company.isVerified && <ShieldCheck className="h-4 w-4 text-success-600" />}
                {company.offersServices && company.professionalPlanActive && (
                  <PremiumBadge label="Destacado" />
                )}
              </h1>
              <p className="text-sm text-navy-800/60">{company.activity}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-navy-800/50">
            <MapPin className="h-3.5 w-3.5" /> {company.location}
          </div>
          {company.description && (
            <p className="mt-3 text-sm text-navy-800/70">{company.description}</p>
          )}
          <p className="mt-3 text-xs font-semibold text-navy-800/50">
            {company.isVerified ? "Empresa verificada ✓" : "Verificación pendiente de revisión"}
          </p>
          <div className="mt-3">
            <ReportButton targetUserId={company.userId} targetType="COMPANY" isLoggedIn={Boolean(session?.user)} />
          </div>
        </Card>

        {company.offersServices && (
          <section className="mt-5">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
              <Wrench className="h-4 w-4 text-peso-600" /> Cotizaciones
            </h2>
            <Card className="mt-3 p-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-navy-800/60">
                {rating && rating.count > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-navy-900">
                    <Star className="h-3.5 w-3.5 fill-peso-500 text-peso-500" />
                    {rating.average.toFixed(1)} ({rating.count})
                  </span>
                )}
                {company.serviceYearsExperience != null && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" /> {company.serviceYearsExperience} años de experiencia
                  </span>
                )}
                {company.serviceZoneLabel && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {company.serviceZoneLabel}
                  </span>
                )}
                {company.contactPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {company.contactPhone}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {company.serviceCategories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-sand-100 px-2.5 py-1 text-[11px] font-semibold text-navy-800/70"
                  >
                    {serviceLabelFor(cat)}
                  </span>
                ))}
              </div>

              {company.serviceDescription && (
                <p className="mt-3 text-sm leading-relaxed text-navy-800/70">
                  {company.serviceDescription}
                </p>
              )}

              {company.portfolioPhotos.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {company.portfolioPhotos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={`/api/fotos/portafolio/${photo.id}`}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {company.servicePortfolioDocKey && (
                <a
                  href={`/api/perfil/empresa/portafolio-doc/publico/${company.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-2 rounded-xl border border-sand-200 p-3 text-xs font-semibold text-mx-red-600"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">
                    {company.servicePortfolioDocName || "Ver portafolio (PDF)"}
                  </span>
                </a>
              )}

              <Button href="/servicios/nueva" fullWidth className="mt-4">
                Pedir una cotización
              </Button>
            </Card>
          </section>
        )}

        <section className="mt-5">
          <h2 className="text-sm font-bold text-navy-900">Vacantes activas</h2>
          <div className="mt-3 flex flex-col gap-3">
            {company.jobPostings.length === 0 && (
              <Card className="p-5 text-center text-sm text-navy-800/60">
                Esta empresa no tiene vacantes activas en este momento.
              </Card>
            )}
            {company.jobPostings.map((job) => (
              <Link key={job.id} href={`/vacantes/${job.id}`}>
                <Card className="flex items-center gap-3 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CategoryIcon category={job.laborCategory} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-navy-900">{job.title}</p>
                    <p className="truncate text-xs text-navy-800/50">{job.location}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-navy-800/30" />
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
