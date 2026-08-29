import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { AvatarImage } from "@/components/brand/AvatarImage";
import { recommendJobsForWorker } from "@/lib/recommendations";
import { DeleteAccountCard } from "@/components/forms/DeleteAccountCard";
import { LABOR_CATEGORIES, AVAILABILITY_OPTIONS, JOB_TYPES } from "@/lib/constants";
import { applicationStatusMeta } from "@/lib/application-status";
import { closureReasonLabel } from "@/lib/job-closure-reason";
import { MapPin, Phone, Mail, Briefcase, GraduationCap, Sparkles, ShieldCheck, Plus, ChevronRight, Send, Info, Pencil, History, MessagesSquare } from "lucide-react";

function labelFor(list: readonly { value: string; label: string }[], value: string) {
  return list.find((i) => i.value === value)?.label ?? value;
}

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");
  if (session.user.role === "ADMIN") redirect("/admin");

  if (session.user.role === "WORKER") {
    const worker = await prisma.workerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        references: true,
        applications: {
          orderBy: { createdAt: "desc" },
          include: { jobPosting: { include: { company: true } } },
        },
      },
    });
    if (!worker) redirect("/registro/trabajador");

    const recommendedJobs = await recommendJobsForWorker(worker);

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
                  fallback={
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-navy-900/[0.07] text-xl font-extrabold text-navy-800">
                      {worker.fullName.slice(0, 1).toUpperCase()}
                    </div>
                  }
                />
                <div>
                  <h1 className="text-lg font-extrabold text-navy-900">{worker.fullName}</h1>
                  <p className="text-sm text-navy-800/60">{worker.profession}</p>
                </div>
              </div>
              <Link
                href="/perfil/editar"
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-sand-200 px-2.5 py-1.5 text-xs font-semibold text-navy-800/70 hover:bg-sand-100"
              >
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Link>
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
              {!worker.isPublic && (
                <span className="inline-flex items-center gap-1 rounded-full bg-navy-900/[0.06] px-2.5 py-1 text-navy-800/60">
                  Perfil no visible para empresas
                </span>
              )}
            </div>
          </Card>

          <Card className="mt-4 p-5">
            <h2 className="text-sm font-bold text-navy-900">Contacto (privado)</h2>
            <p className="mt-1 text-xs text-navy-800/50">
              Solo vos decidís qué contacto se muestra públicamente. Por ahora es visible solo para vos.
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-navy-800/80">
              {worker.phone && (
                <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-navy-800/40" /> {worker.phone}</span>
              )}
              <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-navy-800/40" /> {worker.email}</span>
            </div>
          </Card>

          <Link href="/seguridad" className="mt-4 block">
            <Card className="flex items-center gap-3 border-mx-red-600/20 bg-mx-red-100/30 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mx-red-600/15 text-mx-red-600">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-navy-900">Seguridad</p>
                <p className="text-xs text-navy-800/50">Contactos de confianza, compartir ubicación y botón de pánico</p>
              </div>
              <ChevronRight className="h-4.5 w-4.5 text-navy-800/30" />
            </Card>
          </Link>

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

          {recommendedJobs.length > 0 && (
            <Card className="mt-4 p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-navy-900">
                <Sparkles className="h-4 w-4 text-peso-600" /> Vacantes recomendadas para vos
              </h2>
              <p className="mt-1 text-xs text-navy-800/50">Por tu categoría y ubicación.</p>
              <div className="mt-3 flex flex-col gap-2.5">
                {recommendedJobs.map((job) => (
                  <Link key={job.id} href={`/vacantes/${job.id}`}>
                    <div className="flex items-center gap-3 rounded-xl border border-sand-200 p-3">
                      <CategoryIcon category={job.laborCategory} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-navy-900">{job.title}</p>
                        <p className="truncate text-xs text-navy-800/50">
                          {job.company.commercialName} · {job.location}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-navy-800/30" />
                    </div>
                  </Link>
                ))}
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-navy-800/40">
                <Info className="h-3 w-3" /> Una recomendación nunca garantiza contratación.
              </p>
            </Card>
          )}

          <Card className="mt-4 p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-navy-900">
              <Send className="h-4 w-4" /> Mis aplicaciones
            </h2>
            {worker.applications.length === 0 ? (
              <p className="mt-2 text-xs text-navy-800/50">
                Todavía no aplicaste a ninguna vacante.{" "}
                <Link href="/buscar" className="font-semibold text-mx-red-600">Buscar trabajo</Link>
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-2.5">
                {worker.applications.map((app) => {
                  const statusMeta = applicationStatusMeta(app.status);
                  return (
                    <Link key={app.id} href={`/vacantes/${app.jobPosting.id}`}>
                      <div className="flex items-center gap-3 rounded-xl border border-sand-200 p-3">
                        <CategoryIcon category={app.jobPosting.laborCategory} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-navy-900">{app.jobPosting.title}</p>
                          <p className="truncate text-xs text-navy-800/50">{app.jobPosting.company.commercialName}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${statusMeta.className}`}>
                          {statusMeta.label}
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-navy-800/30" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="mt-4 flex items-start gap-3 border-navy-700/15 bg-navy-900/[0.03] p-4">
            <ShieldCheck className="h-4 w-4 shrink-0 text-navy-700" />
            <p className="text-xs leading-relaxed text-navy-800/70">
              No solicitamos ni almacenamos carta de antecedentes penales. Ese trámite,
              si una empresa lo requiere, se maneja directo entre ambas partes.
            </p>
          </Card>

          <DeleteAccountCard />
        </main>
        <BottomNav />
      </div>
    );
  }

  if (session.user.role === "COMPANY") {
    const company = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        jobPostings: {
          orderBy: { createdAt: "desc" },
          include: { _count: { select: { applications: true } } },
        },
      },
    });
    if (!company) redirect("/registro/empresa");

    return (
      <div className="flex min-h-full flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
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
                  </h1>
                  <p className="text-sm text-navy-800/60">{company.activity}</p>
                </div>
              </div>
              <Link
                href="/perfil/editar"
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-sand-200 px-2.5 py-1.5 text-xs font-semibold text-navy-800/70 hover:bg-sand-100"
              >
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Link>
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
              <div><dt className="font-semibold text-navy-900">Contacto</dt><dd>{[company.contactPhone, company.contactEmail].filter(Boolean).join(" · ")}</dd></div>
              {company.description && <div><dt className="font-semibold text-navy-900">Descripción</dt><dd>{company.description}</dd></div>}
            </dl>
          </Card>

          <Card className="mt-4 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-navy-900">Mis vacantes</h2>
              <Button href="/empresa/vacantes/nueva" size="sm" variant="secondary">
                <Plus className="h-3.5 w-3.5" /> Publicar
              </Button>
            </div>
            {company.jobPostings.length === 0 ? (
              <p className="mt-3 text-xs text-navy-800/50">
                Todavía no has publicado ninguna vacante.
              </p>
            ) : (
              <div className="mt-3 flex flex-col gap-2.5">
                {company.jobPostings.map((job) => (
                  <Link key={job.id} href={`/vacantes/${job.id}/aplicantes`}>
                    <div className="flex items-center gap-3 rounded-xl border border-sand-200 p-3">
                      <CategoryIcon category={job.laborCategory} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-navy-900">{job.title}</p>
                        <p className="text-xs text-navy-800/50">
                          {job._count.applications} aplicante{job._count.applications !== 1 ? "s" : ""}
                          {!job.isActive &&
                            ` · Cerrada${closureReasonLabel(job.closureReason) ? ` (${closureReasonLabel(job.closureReason)})` : ""}`}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-navy-800/30" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Link href="/empresa/servicios" className="mt-4 block">
            <Card className="flex items-center gap-3.5 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mx-red-600/[0.09] text-mx-red-600">
                <Sparkles className="h-5 w-5" strokeWidth={2.1} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-navy-900">Cotizaciones</p>
                <p className="text-xs text-navy-800/50">
                  {company.offersServices
                    ? "Ya ofrecés servicios puntuales — editar"
                    : "Ofrecé servicios puntuales a clientes (electricista, plomero, etc.)"}
                </p>
              </div>
              <ChevronRight className="h-4.5 w-4.5 text-navy-800/30" />
            </Card>
          </Link>

          <Card className="mt-4 p-5">
            <h2 className="text-sm font-bold text-navy-900">Buscar personal</h2>
            <p className="mt-1 text-xs text-navy-800/50">
              También podés explorar perfiles de trabajadores directamente en{" "}
              <Link href="/buscar-personal" className="font-semibold text-mx-red-600">
                Buscar personal
              </Link>{" "}
              o revisar tus{" "}
              <Link href="/empresa/guardados" className="font-semibold text-mx-red-600">
                trabajadores guardados
              </Link>.
            </p>
          </Card>

          <DeleteAccountCard />
        </main>
        <BottomNav />
      </div>
    );
  }

  const moderator = await prisma.moderator.findUnique({
    where: { userId: session.user.id },
    include: { assignments: { include: { chatRoom: true } } },
  });

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Card className="p-5">
          <h1 className="text-lg font-extrabold text-navy-900">Panel de moderación</h1>
          <p className="mt-2 text-sm text-navy-800/60">
            Tu única función es bloquear el acceso de un usuario a las salas de chat que
            tenés asignadas. No tenés acceso a información administrativa sensible.
          </p>
        </Card>

        <Card className="mt-4 p-5">
          <h2 className="text-sm font-bold text-navy-900">Mis salas asignadas</h2>
          {!moderator || moderator.assignments.length === 0 ? (
            <p className="mt-2 text-xs text-navy-800/50">
              Todavía no tenés salas asignadas.
            </p>
          ) : (
            <div className="mt-3 flex flex-col gap-2.5">
              {moderator.assignments.map((a) => (
                <Link key={a.id} href="/comunidad/moderacion">
                  <div className="flex items-center gap-3 rounded-xl border border-sand-200 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-navy-900/[0.07] text-navy-800">
                      <MessagesSquare className="h-4 w-4" strokeWidth={2.1} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-navy-900">{a.chatRoom.name}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-navy-800/30" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="mt-4 p-5">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="text-sm font-semibold text-mx-red-600">Cerrar sesión</button>
          </form>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
