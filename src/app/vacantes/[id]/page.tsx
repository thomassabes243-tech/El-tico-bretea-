import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { ApplyButton } from "@/components/forms/ApplyButton";
import { ShareJobButton } from "@/components/forms/ShareJobButton";
import { ReportButton } from "@/components/forms/ReportButton";
import { closureReasonLabel } from "@/lib/job-closure-reason";
import { toWhatsappHref } from "@/lib/whatsapp";
import { getSiteUrl } from "@/lib/site";
import { LABOR_CATEGORIES, JOB_TYPES } from "@/lib/constants";
import { isFeatured } from "@/lib/job-postings";
import { MapPin, Briefcase, Users, Calendar, ShieldCheck, Sparkles, Phone, Mail } from "lucide-react";

function labelFor(list: readonly { value: string; label: string }[], value: string) {
  return list.find((i) => i.value === value)?.label ?? value;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const jobPosting = await prisma.jobPosting.findUnique({
    where: { id },
    include: { company: { select: { commercialName: true } } },
  });
  if (!jobPosting) return {};

  const title = `${jobPosting.title} en ${jobPosting.company.commercialName} — El Mexa Chamba`;
  const description = `${labelFor(LABOR_CATEGORIES, jobPosting.laborCategory)} en ${jobPosting.location}. ${jobPosting.description}`.slice(0, 200);

  return {
    title,
    description,
    openGraph: { title, description, url: `/vacantes/${id}`, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function VacanteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const jobPosting = await prisma.jobPosting.findUnique({
    where: { id },
    include: { company: true },
  });
  if (!jobPosting) notFound();

  let alreadyApplied = false;
  if (session?.user?.role === "WORKER") {
    const worker = await prisma.workerProfile.findUnique({ where: { userId: session.user.id } });
    if (worker) {
      const existing = await prisma.jobApplication.findUnique({
        where: { jobPostingId_workerId: { jobPostingId: id, workerId: worker.id } },
      });
      alreadyApplied = Boolean(existing);
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Card className="p-5">
          <div className="flex items-start gap-3.5">
            <CategoryIcon category={jobPosting.laborCategory} size="lg" />
            <div className="flex-1">
              <h1 className="flex items-center gap-2 text-lg font-extrabold text-navy-900">
                {jobPosting.title}
                {isFeatured(jobPosting.featuredUntil) && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-peso-100 px-2 py-0.5 text-[10px] font-bold text-peso-700">
                    <Sparkles className="h-2.5 w-2.5" /> Destacada
                  </span>
                )}
              </h1>
              <Link
                href={`/empresas/${jobPosting.companyId}`}
                className="mt-0.5 flex items-center gap-1 text-sm font-medium text-navy-800/60"
              >
                {jobPosting.company.commercialName}
                {jobPosting.company.isVerified && (
                  <ShieldCheck className="h-3.5 w-3.5 text-success-600" aria-label="Empresa verificada" />
                )}
              </Link>
            </div>
          </div>

          {!jobPosting.isActive && (
            <p className="mt-3 rounded-lg bg-sand-100 px-3 py-1.5 text-xs font-semibold text-navy-800/60">
              Esta vacante ya no está activa
              {closureReasonLabel(jobPosting.closureReason) && `: ${closureReasonLabel(jobPosting.closureReason)}`}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-navy-800/70">
            <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2.5 py-1">
              <MapPin className="h-3.5 w-3.5" /> {jobPosting.location}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2.5 py-1">
              <Briefcase className="h-3.5 w-3.5" /> {labelFor(LABOR_CATEGORIES, jobPosting.laborCategory)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2.5 py-1">
              {labelFor(JOB_TYPES, jobPosting.contractType)}
            </span>
            {jobPosting.quantity && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2.5 py-1">
                <Users className="h-3.5 w-3.5" /> {jobPosting.quantity} puesto{jobPosting.quantity > 1 ? "s" : ""}
              </span>
            )}
            {jobPosting.deadline && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2.5 py-1">
                <Calendar className="h-3.5 w-3.5" /> Hasta {jobPosting.deadline.toLocaleDateString("es-MX")}
              </span>
            )}
          </div>

          <div className="mt-4 border-t border-sand-200 pt-4">
            <ShareJobButton jobId={jobPosting.id} title={jobPosting.title} siteUrl={getSiteUrl()} />
          </div>
        </Card>

        <Card className="mt-4 p-5">
          <h2 className="text-sm font-bold text-navy-900">Descripción</h2>
          <p className="mt-1.5 whitespace-pre-line text-sm text-navy-800/75">{jobPosting.description}</p>
        </Card>

        {(jobPosting.salary || jobPosting.schedule || jobPosting.experienceRequired || jobPosting.educationRequired) && (
          <Card className="mt-4 p-5">
            <h2 className="text-sm font-bold text-navy-900">Detalles</h2>
            <dl className="mt-2 flex flex-col gap-1.5 text-sm text-navy-800/75">
              {jobPosting.salary && <div>Salario: <span className="font-semibold text-navy-900">{jobPosting.salary}</span></div>}
              {jobPosting.schedule && <div>Horario: <span className="font-semibold text-navy-900">{jobPosting.schedule}</span></div>}
              {jobPosting.experienceRequired && <div>Experiencia: <span className="font-semibold text-navy-900">{jobPosting.experienceRequired}</span></div>}
              {jobPosting.educationRequired && <div>Estudios: <span className="font-semibold text-navy-900">{jobPosting.educationRequired}</span></div>}
            </dl>
          </Card>
        )}

        {jobPosting.requirements && (
          <Card className="mt-4 p-5">
            <h2 className="text-sm font-bold text-navy-900">Requisitos</h2>
            <p className="mt-1.5 whitespace-pre-line text-sm text-navy-800/75">{jobPosting.requirements}</p>
          </Card>
        )}

        {jobPosting.isActive && (
          <Card className="mt-4 p-5">
            <h2 className="text-sm font-bold text-navy-900">Aplicar</h2>
            <div className="mt-3">
              {!session?.user ? (
                <p className="text-sm text-navy-800/60">
                  <Link href="/iniciar-sesion" className="font-semibold text-mx-red-600">Iniciá sesión</Link> como
                  trabajador para aplicar a esta vacante.
                </p>
              ) : session.user.role !== "WORKER" ? (
                <p className="text-sm text-navy-800/60">Solo cuentas de trabajador pueden aplicar.</p>
              ) : alreadyApplied ? (
                <p className="text-sm font-semibold text-success-600">Ya aplicaste a esta vacante.</p>
              ) : (
                <ApplyButton jobPostingId={jobPosting.id} />
              )}

              {(jobPosting.whatsapp || jobPosting.contactEmail) && (
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-navy-800/60">
                  {jobPosting.whatsapp && (
                    <a
                      href={toWhatsappHref(
                        jobPosting.whatsapp,
                        `Hola, te escribo por la vacante "${jobPosting.title}" en El Mexa Chamba.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-semibold text-success-600"
                    >
                      <Phone className="h-3.5 w-3.5" /> WhatsApp: {jobPosting.whatsapp}
                    </a>
                  )}
                  {jobPosting.contactEmail && (
                    <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {jobPosting.contactEmail}</span>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        <div className="mt-4 px-1">
          <ReportButton
            targetUserId={jobPosting.company.userId}
            targetType="JOB_POSTING"
            contextLabel={`Vacante: ${jobPosting.title}`}
            isLoggedIn={Boolean(session?.user)}
          />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
