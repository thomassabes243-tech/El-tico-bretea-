import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DetailHeader } from "@/components/nav/DetailHeader";
import { Card } from "@/components/ui/Card";
import { Badge, TagChip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { AvatarImage } from "@/components/brand/AvatarImage";
import { ApplyButton } from "@/components/forms/ApplyButton";
import { ShareJobButton } from "@/components/forms/ShareJobButton";
import { ReportButton } from "@/components/forms/ReportButton";
import { closureReasonLabel } from "@/lib/job-closure-reason";
import { toWhatsappHref } from "@/lib/whatsapp";
import { getSiteUrl } from "@/lib/site";
import { LABOR_CATEGORIES, JOB_TYPES } from "@/lib/constants";
import {
  MapPin,
  Briefcase,
  Users,
  Calendar,
  ShieldCheck,
  Phone,
  Mail,
  Flame,
  FileText,
  CheckCircle2,
  Send,
  Share2,
} from "lucide-react";

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

  const title = `${jobPosting.title} en ${jobPosting.company.commercialName} — El Tico Bretea`;
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

  const requirementLines = jobPosting.requirements
    ? jobPosting.requirements.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    : [];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DetailHeader
        title="Detalle del Brete"
        fallbackHref="/buscar"
        action={
          <a href="#compartir" aria-label="Compartir" className="flex h-10 w-10 items-center justify-center rounded-full text-navy-900 transition-colors hover:bg-sand-100">
            <Share2 className="h-4.5 w-4.5" />
          </a>
        }
      />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-32 pt-5">
        <Card className="flex flex-col items-center p-5 text-center">
          {!jobPosting.isActive && (
            <Badge tone="neutral" className="mb-3">
              Vacante cerrada
              {closureReasonLabel(jobPosting.closureReason) && ` · ${closureReasonLabel(jobPosting.closureReason)}`}
            </Badge>
          )}
          <AvatarImage
            src={jobPosting.company.logoUrl}
            alt={jobPosting.company.commercialName}
            className="mb-3 h-20 w-20 rounded-2xl border border-sand-200 object-cover shadow-ambient"
            fallback={
              <div className="mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-sand-200">
                <CategoryIcon category={jobPosting.laborCategory} size="lg" className="h-full w-full rounded-none" />
              </div>
            }
          />
          <h1 className="font-heading text-xl font-bold leading-snug text-navy-900">{jobPosting.title}</h1>
          <Link
            href={`/empresas/${jobPosting.companyId}`}
            className="mt-1 flex items-center gap-1 text-sm font-medium text-navy-800/60"
          >
            {jobPosting.company.commercialName}
            {jobPosting.company.isVerified && <ShieldCheck className="h-3.5 w-3.5 text-success-600" />}
          </Link>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {jobPosting.salary && (
              <TagChip icon={<span className="text-xs">₡</span>}>{jobPosting.salary}</TagChip>
            )}
            <TagChip icon={<MapPin className="h-3.5 w-3.5" />}>{jobPosting.location}</TagChip>
            <TagChip icon={<Briefcase className="h-3.5 w-3.5" />}>
              {labelFor(LABOR_CATEGORIES, jobPosting.laborCategory)}
            </TagChip>
            <TagChip>{labelFor(JOB_TYPES, jobPosting.contractType)}</TagChip>
            {jobPosting.quantity && (
              <TagChip icon={<Users className="h-3.5 w-3.5" />}>
                {jobPosting.quantity} puesto{jobPosting.quantity > 1 ? "s" : ""}
              </TagChip>
            )}
            {jobPosting.deadline && (
              <TagChip icon={<Calendar className="h-3.5 w-3.5" />}>
                Hasta {jobPosting.deadline.toLocaleDateString("es-CR")}
              </TagChip>
            )}
          </div>

          {jobPosting.isUrgent && jobPosting.isActive && (
            <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-cr-red-600 py-2.5 text-sm font-bold text-white">
              <Flame className="h-4 w-4" /> CONTRATACIÓN URGENTE
            </div>
          )}
        </Card>

        <Card className="mt-4 p-5">
          <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-navy-900">
            <FileText className="h-4 w-4 text-navy-700" /> Descripción del brete
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy-800/75">{jobPosting.description}</p>
        </Card>

        {(jobPosting.salary || jobPosting.schedule || jobPosting.experienceRequired || jobPosting.educationRequired) && (
          <Card className="mt-4 p-5">
            <h2 className="font-heading text-sm font-bold text-navy-900">Detalles</h2>
            <dl className="mt-2 flex flex-col gap-1.5 text-sm text-navy-800/75">
              {jobPosting.salary && <div>Salario: <span className="font-semibold text-navy-900">{jobPosting.salary}</span></div>}
              {jobPosting.schedule && <div>Horario: <span className="font-semibold text-navy-900">{jobPosting.schedule}</span></div>}
              {jobPosting.experienceRequired && <div>Experiencia: <span className="font-semibold text-navy-900">{jobPosting.experienceRequired}</span></div>}
              {jobPosting.educationRequired && <div>Estudios: <span className="font-semibold text-navy-900">{jobPosting.educationRequired}</span></div>}
            </dl>
          </Card>
        )}

        {requirementLines.length > 0 && (
          <Card className="mt-4 p-5">
            <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-navy-900">
              <CheckCircle2 className="h-4 w-4 text-navy-700" /> Requisitos
            </h2>
            <ul className="mt-2 flex flex-col gap-2">
              {requirementLines.map((line, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-navy-800/75">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {jobPosting.isActive && (
          <Card id="aplicar" className="mt-4 scroll-mt-20 p-5">
            <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-navy-900">
              <Send className="h-4 w-4 text-navy-700" /> Aplicar
            </h2>
            <div className="mt-3">
              {!session?.user ? (
                <p className="text-sm text-navy-800/60">
                  <Link href="/iniciar-sesion" className="font-semibold text-cr-red-600">Iniciá sesión</Link> como
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
                        `Hola, te escribo por la vacante "${jobPosting.title}" en El Tico Bretea.`
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

        <Card id="compartir" className="mt-4 scroll-mt-20 p-5">
          <ShareJobButton jobId={jobPosting.id} title={jobPosting.title} siteUrl={getSiteUrl()} />
        </Card>

        <div className="mt-4 px-1">
          <ReportButton
            targetUserId={jobPosting.company.userId}
            targetType="JOB_POSTING"
            contextLabel={`Vacante: ${jobPosting.title}`}
            isLoggedIn={Boolean(session?.user)}
          />
        </div>
      </main>

      {/* CTA fija -- refleja el estado real de aplicación, no un botón decorativo */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(26,43,72,0.05)]">
        <div className="mx-auto w-full max-w-lg">
          {!jobPosting.isActive ? (
            <Button disabled fullWidth>
              Vacante cerrada
            </Button>
          ) : alreadyApplied ? (
            <Button disabled fullWidth>
              <CheckCircle2 className="h-4 w-4" /> Ya aplicaste
            </Button>
          ) : !session?.user ? (
            <Button href="/iniciar-sesion" fullWidth>
              Iniciá sesión para postularme
            </Button>
          ) : session.user.role !== "WORKER" ? (
            <Button disabled fullWidth>
              Solo trabajadores pueden aplicar
            </Button>
          ) : (
            <Button href="#aplicar" fullWidth>
              <Send className="h-4 w-4" /> Postularme ahora
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
