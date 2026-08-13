import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { AvatarImage } from "@/components/brand/AvatarImage";
import { ReportButton } from "@/components/forms/ReportButton";
import { ShieldCheck, MapPin, ChevronRight } from "lucide-react";

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
      },
    }),
    auth(),
  ]);
  if (!company) notFound();

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
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cr-red-600/[0.09] text-xl font-extrabold text-cr-red-600">
                  {company.commercialName.slice(0, 1).toUpperCase()}
                </div>
              }
            />
            <div>
              <h1 className="flex items-center gap-1.5 text-lg font-extrabold text-navy-900">
                {company.commercialName}
                {company.isVerified && <ShieldCheck className="h-4 w-4 text-success-600" />}
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
