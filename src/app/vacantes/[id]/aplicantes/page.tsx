import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { MapPin, Briefcase } from "lucide-react";

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

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Link href={`/vacantes/${jobPosting.id}`} className="text-sm font-medium text-navy-800/60">
          ← {jobPosting.title}
        </Link>
        <h1 className="mt-2 text-xl font-extrabold tracking-tight text-navy-900">
          Aplicantes ({jobPosting.applications.length})
        </h1>

        <div className="mt-5 flex flex-col gap-3">
          {jobPosting.applications.length === 0 && (
            <Card className="p-6 text-center text-sm text-navy-800/60">
              Todavía nadie ha aplicado a esta vacante.
            </Card>
          )}
          {jobPosting.applications.map((app) => (
            <Card key={app.id} className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-navy-900">{app.worker.fullName}</p>
                <span className="text-[11px] text-navy-800/45">
                  {app.createdAt.toLocaleDateString("es-CR")}
                </span>
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
      </main>
      <BottomNav />
    </div>
  );
}
