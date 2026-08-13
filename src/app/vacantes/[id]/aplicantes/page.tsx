import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { recommendWorkersForJob } from "@/lib/recommendations";
import { JobPostingStatusToggle } from "@/components/forms/JobPostingStatusToggle";
import { ApplicationStatusSelect } from "@/components/forms/ApplicationStatusSelect";
import { MapPin, Briefcase, Sparkles, Info, Pencil } from "lucide-react";

export default async function AplicantesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");

  const { id } = await params;
  const jobPosting = await prisma.jobPosting.findUnique({
    where: { id },
    include: {
      company: true,
      applications: {
        orderBy: { createdAt: "desc" },
        include: { worker: true },
      },
    },
  });

  if (!jobPosting || jobPosting.company.userId !== session.user.id) notFound();

  const appliedWorkerIds = jobPosting.applications.map((a) => a.workerId);
  const recommended = jobPosting.isActive
    ? await recommendWorkersForJob(jobPosting, appliedWorkerIds)
    : [];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Link href={`/vacantes/${jobPosting.id}`} className="text-sm font-medium text-navy-800/60">
          ← {jobPosting.title}
        </Link>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h1 className="text-xl font-extrabold tracking-tight text-navy-900">
            Aplicantes ({jobPosting.applications.length})
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/empresa/vacantes/${jobPosting.id}/editar`}
              className="flex items-center gap-1.5 rounded-lg border border-sand-200 px-2.5 py-1.5 text-xs font-semibold text-navy-800/70 hover:bg-sand-100"
            >
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Link>
            <JobPostingStatusToggle jobId={jobPosting.id} isActive={jobPosting.isActive} />
          </div>
        </div>
        {!jobPosting.isActive && (
          <p className="mt-1 text-xs font-semibold text-navy-800/50">
            Esta vacante está cerrada: ya no aparece en búsquedas ni recibe nuevas aplicaciones.
          </p>
        )}

        <div className="mt-5 flex flex-col gap-3">
          {jobPosting.applications.length === 0 && (
            <Card className="p-6 text-center text-sm text-navy-800/60">
              Todavía nadie ha aplicado a esta vacante.
            </Card>
          )}
          {jobPosting.applications.map((app) => (
            <Card key={app.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-navy-900">{app.worker.fullName}</p>
                  <span className="text-[11px] text-navy-800/45">
                    {app.createdAt.toLocaleDateString("es-CR")}
                  </span>
                </div>
                <ApplicationStatusSelect applicationId={app.id} status={app.status} />
              </div>
              <p className="text-xs text-navy-800/60">{app.worker.profession}</p>
              <div className="mt-1.5 flex items-center gap-3 text-[11px] text-navy-800/50">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {app.worker.residence}</span>
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {app.worker.yearsExperience} años</span>
              </div>
              {app.message && (
                <p className="mt-2 rounded-lg bg-sand-100 px-3 py-2 text-xs text-navy-800/75">{app.message}</p>
              )}
              <Link
                href={`/trabajadores/${app.worker.id}`}
                className="mt-2 inline-block text-xs font-semibold text-cr-red-600"
              >
                Ver perfil completo
              </Link>
            </Card>
          ))}
        </div>

        {recommended.length > 0 && (
          <div className="mt-8">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
              <Sparkles className="h-4 w-4 text-colon-600" /> Trabajadores recomendados
            </h2>
            <p className="mt-1 text-xs text-navy-800/50">
              Por categoría y ubicación. No aplicaron todavía, pero podrían encajar.
            </p>
            <div className="mt-3 flex flex-col gap-2.5">
              {recommended.map((w) => (
                <Link key={w.id} href={`/trabajadores/${w.id}`}>
                  <Card className="flex items-center gap-3 p-3.5">
                    <CategoryIcon category={w.laborCategory} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-navy-900">
                        {w.fullName}
                        {w.isPremium && (
                          <span className="shrink-0 rounded-full bg-colon-100 px-1.5 py-0.5 text-[9px] font-bold text-colon-700">
                            PREMIUM
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-navy-800/50">
                        {w.profession} · {w.residence}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-navy-800/40">
              <Info className="h-3 w-3" /> Una recomendación nunca garantiza contratación.
            </p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
