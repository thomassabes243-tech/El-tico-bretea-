import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { AvatarImage } from "@/components/brand/AvatarImage";
import { ReportButton } from "@/components/forms/ReportButton";
import { SaveWorkerButton } from "@/components/forms/SaveWorkerButton";
import { toWhatsappHref } from "@/lib/whatsapp";
import { LABOR_CATEGORIES, AVAILABILITY_OPTIONS, JOB_TYPES } from "@/lib/constants";
import { MapPin, Briefcase, GraduationCap, Sparkles, Phone, Mail, Lock, History } from "lucide-react";

function labelFor(list: readonly { value: string; label: string }[], value: string) {
  return list.find((i) => i.value === value)?.label ?? value;
}

export default async function PublicWorkerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [worker, session] = await Promise.all([
    prisma.workerProfile.findUnique({ where: { id } }),
    auth(),
  ]);

  if (!worker || !worker.isPublic) notFound();

  let initialSaved = false;
  if (session?.user?.role === "COMPANY") {
    const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
    if (company) {
      const existing = await prisma.savedWorker.findUnique({
        where: { companyId_workerId: { companyId: company.id, workerId: worker.id } },
      });
      initialSaved = Boolean(existing);
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-4">
              <AvatarImage
                src={worker.formalPhotoUrl}
                alt={worker.fullName}
                className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                fallback={<CategoryIcon category={worker.laborCategory} size="lg" />}
              />
              <div>
                <h1 className="flex items-center gap-1.5 text-lg font-extrabold text-navy-900">
                  {worker.fullName}
                </h1>
                <p className="text-sm text-navy-800/60">{worker.profession}</p>
              </div>
            </div>
            {session?.user?.role === "COMPANY" && (
              <SaveWorkerButton workerId={worker.id} initialSaved={initialSaved} />
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-navy-800/70">
            <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2.5 py-1">
              <MapPin className="h-3.5 w-3.5" /> {worker.residence}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2.5 py-1">
              <Briefcase className="h-3.5 w-3.5" /> {labelFor(LABOR_CATEGORIES, worker.laborCategory)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-sand-100 px-2.5 py-1">
              {worker.yearsExperience} años de experiencia
            </span>
          </div>
        </Card>

        <Card className="mt-4 p-5">
          <h2 className="text-sm font-bold text-navy-900">Contacto</h2>
          {worker.showPhone || worker.showWhatsapp || worker.showEmail ? (
            <div className="mt-3 flex flex-col gap-2 text-sm text-navy-800/80">
              {worker.showPhone && worker.phone && <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-navy-800/40" /> {worker.phone}</span>}
              {worker.showWhatsapp && worker.whatsapp && (
                <a
                  href={toWhatsappHref(
                    worker.whatsapp,
                    `Hola ${worker.fullName}, vi tu perfil en Méxicosinhambre.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-semibold text-success-600"
                >
                  <Phone className="h-4 w-4" /> WhatsApp: {worker.whatsapp}
                </a>
              )}
              {worker.showEmail && <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-navy-800/40" /> {worker.email}</span>}
            </div>
          ) : (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-navy-800/50">
              <Lock className="h-3.5 w-3.5" /> Este trabajador mantiene su contacto privado.
            </p>
          )}
        </Card>

        {(worker.workExperience || worker.companiesWorkedAt || worker.previousPositions) && (
          <Card className="mt-4 p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-navy-900">
              <History className="h-4 w-4" /> Experiencia laboral
            </h2>
            <dl className="mt-3 flex flex-col gap-2 text-sm text-navy-800/70">
              {worker.workExperience && (
                <div><dt className="font-semibold text-navy-900">Resumen</dt><dd>{worker.workExperience}</dd></div>
              )}
              {worker.companiesWorkedAt && (
                <div><dt className="font-semibold text-navy-900">Empresas donde trabajó</dt><dd>{worker.companiesWorkedAt}</dd></div>
              )}
              {worker.previousPositions && (
                <div><dt className="font-semibold text-navy-900">Puestos anteriores</dt><dd>{worker.previousPositions}</dd></div>
              )}
            </dl>
          </Card>
        )}

        {(worker.education || worker.degrees || worker.courses || worker.certifications) && (
          <Card className="mt-4 p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-navy-900">
              <GraduationCap className="h-4 w-4" /> Estudios y certificaciones
            </h2>
            <dl className="mt-3 flex flex-col gap-2 text-sm text-navy-800/70">
              {worker.education && <div><dt className="font-semibold text-navy-900">Estudios</dt><dd>{worker.education}</dd></div>}
              {worker.degrees && <div><dt className="font-semibold text-navy-900">Títulos</dt><dd>{worker.degrees}</dd></div>}
              {worker.courses && <div><dt className="font-semibold text-navy-900">Cursos</dt><dd>{worker.courses}</dd></div>}
              {worker.certifications && <div><dt className="font-semibold text-navy-900">Certificaciones</dt><dd>{worker.certifications}</dd></div>}
            </dl>
          </Card>
        )}

        {worker.skills && (
          <Card className="mt-4 p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-navy-900">
              <Sparkles className="h-4 w-4" /> Habilidades
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {worker.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                <span key={s} className="rounded-full bg-mx-red-100 px-2.5 py-1 text-xs font-medium text-mx-red-700">
                  {s}
                </span>
              ))}
            </div>
          </Card>
        )}

        <Card className="mt-4 p-5">
          <h2 className="text-sm font-bold text-navy-900">Disponibilidad</h2>
          <div className="mt-3 flex flex-col gap-1.5 text-sm text-navy-800/70">
            <p>Disponibilidad: <span className="font-semibold text-navy-900">{labelFor(AVAILABILITY_OPTIONS, worker.availability)}</span></p>
            <p>Tipo de trabajo: <span className="font-semibold text-navy-900">{labelFor(JOB_TYPES, worker.jobTypeSought)}</span></p>
            <p>Traslado: <span className="font-semibold text-navy-900">{worker.willingToRelocate ? "Sí" : "No"}</span></p>
            {worker.showSalaryExpectation && worker.salaryExpectation && (
              <p>Expectativa salarial: <span className="font-semibold text-navy-900">{worker.salaryExpectation}</span></p>
            )}
          </div>
        </Card>

        <div className="mt-4 px-1">
          <ReportButton targetUserId={worker.userId} targetType="USER" isLoggedIn={Boolean(session?.user)} />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
