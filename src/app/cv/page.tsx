import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LABOR_CATEGORIES, AVAILABILITY_OPTIONS, JOB_TYPES } from "@/lib/constants";
import { Info } from "lucide-react";

function labelFor(list: readonly { value: string; label: string }[], value: string) {
  return list.find((i) => i.value === value)?.label ?? value;
}

export default async function CvPage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");

  if (session.user.role !== "WORKER") {
    return (
      <div className="flex min-h-full flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
          <Card className="p-6 text-center text-sm text-navy-800/70">
            La generación de CV está disponible para cuentas de trabajador.
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
    include: { references: true },
  });
  if (!worker) redirect("/registro/trabajador");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Mi CV</h1>
        <p className="mt-1 text-sm text-navy-800/60">
          Vista previa de tu currículum, generado a partir de tu perfil.
        </p>

        <Card className="mt-5 flex flex-col gap-5 p-6">
          <div>
            <h2 className="text-lg font-extrabold text-navy-900">{worker.fullName}</h2>
            <p className="text-sm text-navy-800/60">{worker.profession} · {labelFor(LABOR_CATEGORIES, worker.laborCategory)}</p>
            <p className="mt-1 text-xs text-navy-800/50">{worker.residence} · {worker.yearsExperience} años de experiencia</p>
          </div>

          {worker.workExperience && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wide text-navy-800/50">Experiencia</h3>
              <p className="mt-1.5 text-sm text-navy-800/80">{worker.workExperience}</p>
            </section>
          )}

          {(worker.education || worker.degrees || worker.courses || worker.certifications) && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wide text-navy-800/50">Estudios</h3>
              <p className="mt-1.5 text-sm text-navy-800/80">
                {[worker.education, worker.degrees, worker.courses, worker.certifications]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </section>
          )}

          {worker.skills && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wide text-navy-800/50">Habilidades</h3>
              <p className="mt-1.5 text-sm text-navy-800/80">{worker.skills}</p>
            </section>
          )}

          {worker.languages && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wide text-navy-800/50">Idiomas</h3>
              <p className="mt-1.5 text-sm text-navy-800/80">{worker.languages}</p>
            </section>
          )}

          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-navy-800/50">Disponibilidad</h3>
            <p className="mt-1.5 text-sm text-navy-800/80">
              {labelFor(AVAILABILITY_OPTIONS, worker.availability)} · {labelFor(JOB_TYPES, worker.jobTypeSought)}
            </p>
          </section>

          {worker.references.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-wide text-navy-800/50">Referencias</h3>
              <ul className="mt-1.5 flex flex-col gap-1 text-sm text-navy-800/80">
                {worker.references.map((r) => (
                  <li key={r.id}>{r.name} — {r.company}</li>
                ))}
              </ul>
            </section>
          )}
        </Card>

        <Card className="mt-4 flex gap-2.5 border-navy-700/15 bg-navy-900/[0.03] p-4">
          <Info className="h-4 w-4 shrink-0 text-navy-700" />
          <p className="text-xs leading-relaxed text-navy-800/70">
            La descarga en PDF (US$2, cobrado en colones) llega en una próxima entrega, una
            vez esté conectado un procesador de pagos compatible con Costa Rica. El PDF
            generado se elimina automáticamente a los 3 meses; los datos de tu perfil se
            mantienen.
          </p>
        </Card>

        <Button variant="outline" fullWidth className="mt-4" disabled>
          Descargar PDF — próximamente
        </Button>
      </main>
      <BottomNav />
    </div>
  );
}
