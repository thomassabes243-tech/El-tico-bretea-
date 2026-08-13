import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { LABOR_CATEGORIES, AVAILABILITY_OPTIONS, JOB_TYPES } from "@/lib/constants";
import { MapPin, Phone, Mail, Briefcase, GraduationCap, Sparkles, ShieldCheck } from "lucide-react";

function labelFor(list: readonly { value: string; label: string }[], value: string) {
  return list.find((i) => i.value === value)?.label ?? value;
}

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");

  if (session.user.role === "WORKER") {
    const worker = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
      include: { references: true },
    });
    if (!worker) redirect("/registro/trabajador");

    return (
      <div className="flex min-h-full flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-navy-900/[0.07] text-xl font-extrabold text-navy-800">
                {worker.fullName.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-navy-900">{worker.fullName}</h1>
                <p className="text-sm text-navy-800/60">{worker.profession}</p>
              </div>
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
            <h2 className="text-sm font-bold text-navy-900">Contacto (privado)</h2>
            <p className="mt-1 text-xs text-navy-800/50">
              Solo vos decidís qué contacto se muestra públicamente. Por ahora es visible solo para vos.
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-navy-800/80">
              <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-navy-800/40" /> {worker.phone}</span>
              <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-navy-800/40" /> {worker.email}</span>
            </div>
          </Card>

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
                  <span key={s} className="rounded-full bg-cr-red-100 px-2.5 py-1 text-xs font-medium text-cr-red-700">
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
            </div>
          </Card>

          {worker.references.length > 0 && (
            <Card className="mt-4 p-5">
              <h2 className="text-sm font-bold text-navy-900">Referencias laborales</h2>
              <div className="mt-3 flex flex-col gap-3">
                {worker.references.map((r) => (
                  <div key={r.id} className="text-sm text-navy-800/70">
                    <p className="font-semibold text-navy-900">{r.name} — {r.company}</p>
                    {r.phone && <p>Tel: {r.phone}</p>}
                    {r.email && <p>Correo: {r.email}</p>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="mt-4 flex items-start gap-3 border-navy-700/15 bg-navy-900/[0.03] p-4">
            <ShieldCheck className="h-4 w-4 shrink-0 text-navy-700" />
            <p className="text-xs leading-relaxed text-navy-800/70">
              No solicitamos ni almacenamos carta de antecedentes penales. Ese trámite,
              si una empresa lo requiere, se maneja directo entre ambas partes.
            </p>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (session.user.role === "COMPANY") {
    const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
    if (!company) redirect("/registro/empresa");

    return (
      <div className="flex min-h-full flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cr-red-600/[0.09] text-xl font-extrabold text-cr-red-600">
                {company.commercialName.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h1 className="flex items-center gap-1.5 text-lg font-extrabold text-navy-900">
                  {company.commercialName}
                  {company.isVerified && <ShieldCheck className="h-4 w-4 text-success-600" />}
                </h1>
                <p className="text-sm text-navy-800/60">{company.activity}</p>
              </div>
            </div>
            <p className="mt-2 text-xs font-semibold text-navy-800/50">
              {company.isVerified ? "Empresa verificada ✓" : "Verificación pendiente de revisión"}
            </p>
          </Card>

          <Card className="mt-4 p-5">
            <h2 className="text-sm font-bold text-navy-900">Datos de la empresa</h2>
            <dl className="mt-3 flex flex-col gap-2 text-sm text-navy-800/70">
              <div><dt className="font-semibold text-navy-900">Responsable</dt><dd>{company.responsibleName}</dd></div>
              <div><dt className="font-semibold text-navy-900">Ubicación</dt><dd>{company.location}</dd></div>
              <div><dt className="font-semibold text-navy-900">Contacto</dt><dd>{company.contactPhone} · {company.contactEmail}</dd></div>
              {company.description && <div><dt className="font-semibold text-navy-900">Descripción</dt><dd>{company.description}</dd></div>}
            </dl>
          </Card>

          <Card className="mt-4 p-5">
            <h2 className="text-sm font-bold text-navy-900">Vacantes</h2>
            <p className="mt-1 text-xs text-navy-800/50">
              La publicación de vacantes llega en una próxima entrega. Mientras tanto podés
              usar{" "}
              <Link href="/buscar-personal" className="font-semibold text-cr-red-600">
                Buscar personal
              </Link>{" "}
              para ver perfiles de trabajadores.
            </p>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Card className="p-5">
          <h1 className="text-lg font-extrabold text-navy-900">Panel de moderación</h1>
          <p className="mt-2 text-sm text-navy-800/60">
            Como moderador podés bloquear el acceso de un usuario a las salas de chat que
            tenés asignadas. Esta herramienta llega en una próxima entrega.
          </p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
            className="mt-4"
          >
            <button className="text-sm font-semibold text-cr-red-600">Cerrar sesión</button>
          </form>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
