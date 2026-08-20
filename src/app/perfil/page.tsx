import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, TagChip } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { AvatarImage } from "@/components/brand/AvatarImage";
import { recommendJobsForWorker } from "@/lib/recommendations";
import { DeleteAccountCard } from "@/components/forms/DeleteAccountCard";
import { LABOR_CATEGORIES, AVAILABILITY_OPTIONS, JOB_TYPES } from "@/lib/constants";
import { closureReasonLabel } from "@/lib/job-closure-reason";
import { MyApplicationsTabs } from "@/components/profile/MyApplicationsTabs";
import {
  MapPin,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Plus,
  ChevronRight,
  Send,
  Info,
  Pencil,
  History,
  FileText,
  Download,
  Eye,
  LogOut,
  Building2,
  Users,
  TrendingUp,
} from "lucide-react";

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
          <Card className="flex flex-col items-center p-5 text-center">
            <AvatarImage
              src={worker.formalPhotoUrl}
              alt={worker.fullName}
              className="h-20 w-20 rounded-full border-2 border-navy-900 object-cover"
              fallback={
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-navy-900 bg-navy-900/[0.07] text-2xl font-bold text-navy-800">
                  {worker.fullName.slice(0, 1).toUpperCase()}
                </div>
              }
            />
            <h1 className="mt-3 font-heading text-lg font-bold text-navy-900">{worker.fullName}</h1>
            <p className="mt-0.5 text-sm text-navy-800/60">{worker.profession}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <TagChip icon={<MapPin className="h-3.5 w-3.5" />}>{worker.residence}</TagChip>
              <TagChip icon={<Briefcase className="h-3.5 w-3.5" />}>
                {labelFor(LABOR_CATEGORIES, worker.laborCategory)}
              </TagChip>
              <TagChip>{worker.yearsExperience} años de experiencia</TagChip>
              {!worker.isPublic && <Badge tone="navy">Perfil no visible</Badge>}
            </div>
            <Link
              href="/perfil/editar"
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-navy-900 px-4 py-2.5 text-xs font-bold text-navy-900 hover:bg-sand-100"
            >
              <Pencil className="h-3.5 w-3.5" /> Editar Perfil
            </Link>
          </Card>

          <Card className="mt-4 p-5">
            <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-navy-900">
              <FileText className="h-4 w-4 text-navy-700" /> Mi CV
            </h2>
            <p className="mt-1.5 text-xs text-navy-800/50">
              Se genera automáticamente con los datos de tu perfil -- siempre actualizado.
            </p>
            <div className="mt-3 flex gap-2.5">
              <Link
                href="/cv"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-navy-900 py-2.5 text-xs font-bold text-navy-900 hover:bg-sand-100"
              >
                <Eye className="h-3.5 w-3.5" /> Ver
              </Link>
              <a
                href="/api/cv/descargar"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-navy-900 py-2.5 text-xs font-bold text-white hover:bg-navy-800"
              >
                <Download className="h-3.5 w-3.5" /> Descargar
              </a>
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

          {(worker.workExperience || worker.companiesWorkedAt || worker.previousPositions) && (
            <Card className="mt-4 p-5">
              <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-navy-900">
                <History className="h-4 w-4 text-navy-700" /> Experiencia laboral
              </h2>
              <div className="relative mt-4 flex flex-col gap-4 before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-sand-200">
                {worker.workExperience && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 ring-4 ring-white">
                      <History className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-xs font-bold text-navy-900">Resumen</p>
                    <p className="mt-0.5 text-sm text-navy-800/70">{worker.workExperience}</p>
                  </div>
                )}
                {worker.companiesWorkedAt && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-sand-200 ring-4 ring-white">
                      <Building2 className="h-3 w-3 text-navy-800" />
                    </div>
                    <p className="text-xs font-bold text-navy-900">Empresas donde trabajó</p>
                    <p className="mt-0.5 text-sm text-navy-800/70">{worker.companiesWorkedAt}</p>
                  </div>
                )}
                {worker.previousPositions && (
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-sand-200 ring-4 ring-white">
                      <Briefcase className="h-3 w-3 text-navy-800" />
                    </div>
                    <p className="text-xs font-bold text-navy-900">Puestos anteriores</p>
                    <p className="mt-0.5 text-sm text-navy-800/70">{worker.previousPositions}</p>
                  </div>
                )}
              </div>
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

          <Card className="mt-4 p-5">
            <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-navy-900">
              <Sparkles className="h-4 w-4 text-navy-700" /> Habilidades
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {worker.skills &&
                worker.skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                  <Badge key={s} tone="red" className="normal-case">{s}</Badge>
                ))}
              <Link
                href="/perfil/editar"
                className="flex items-center gap-1 rounded-full border border-dashed border-sand-200 px-2.5 py-1 text-[11px] font-semibold text-navy-800/60 hover:border-navy-700/40 hover:text-navy-800"
              >
                <Plus className="h-3 w-3" /> Añadir
              </Link>
            </div>
          </Card>

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
                <Sparkles className="h-4 w-4 text-colon-600" /> Vacantes recomendadas para vos
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
            <h2 className="flex items-center gap-2 font-heading text-sm font-bold text-navy-900">
              <Send className="h-4 w-4 text-navy-700" /> Mis aplicaciones
            </h2>
            <p className="mt-0.5 text-xs text-navy-800/50">Dale seguimiento a tus oportunidades.</p>
            <MyApplicationsTabs
              applications={worker.applications.map((app) => ({
                id: app.id,
                status: app.status,
                createdAt: app.createdAt.toISOString(),
                jobPosting: {
                  id: app.jobPosting.id,
                  title: app.jobPosting.title,
                  laborCategory: app.jobPosting.laborCategory,
                  isActive: app.jobPosting.isActive,
                  company: { commercialName: app.jobPosting.company.commercialName },
                },
              }))}
            />
          </Card>

          <Card className="mt-4 flex items-start gap-3 border-navy-700/15 bg-navy-900/[0.03] p-4">
            <ShieldCheck className="h-4 w-4 shrink-0 text-navy-700" />
            <p className="text-xs leading-relaxed text-navy-800/70">
              No solicitamos ni almacenamos carta de antecedentes penales. Ese trámite,
              si una empresa lo requiere, se maneja directo entre ambas partes.
            </p>
          </Card>

          <div className="mt-4 flex flex-col gap-2.5">
            <Link
              href="/perfil/editar"
              className="flex items-center justify-between rounded-xl border border-sand-200 bg-white p-4 shadow-ambient transition-colors hover:bg-sand-100"
            >
              <span className="flex items-center gap-2.5 text-sm font-semibold text-navy-900">
                <Pencil className="h-4 w-4 text-navy-800/60" /> Configuración de la cuenta
              </span>
              <ChevronRight className="h-4 w-4 text-navy-800/30" />
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button className="flex w-full items-center gap-2.5 rounded-xl border border-sand-200 bg-white p-4 text-sm font-semibold text-cr-red-600 shadow-ambient transition-colors hover:bg-cr-red-100/40">
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </form>
          </div>

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

    const newApplicationsCount = await prisma.jobApplication.count({
      where: { jobPosting: { companyId: company.id }, status: "ENVIADA" },
    });
    const activeJobs = company.jobPostings.filter((j) => j.isActive);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const activeThisWeek = activeJobs.filter((j) => j.createdAt >= oneWeekAgo).length;

    return (
      <div className="flex min-h-full flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
          <Card className="flex flex-col items-center p-5 text-center">
            <AvatarImage
              src={company.logoUrl}
              alt={company.commercialName}
              className="h-20 w-20 rounded-2xl border-2 border-navy-900 object-cover"
              fallback={
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-navy-900 bg-cr-red-600/[0.09] text-2xl font-bold text-cr-red-600">
                  {company.commercialName.slice(0, 1).toUpperCase()}
                </div>
              }
            />
            <h1 className="mt-3 flex items-center gap-1.5 font-heading text-lg font-bold text-navy-900">
              {company.commercialName}
              {company.isVerified && <ShieldCheck className="h-4 w-4 text-success-600" />}
            </h1>
            <p className="mt-0.5 text-sm text-navy-800/60">{company.activity}</p>
            <Badge tone={company.isVerified ? "success" : "warning"} className="mt-3">
              {company.isVerified ? "Empresa verificada ✓" : "Verificación pendiente"}
            </Badge>
            <Link
              href="/perfil/editar"
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-navy-900 px-4 py-2.5 text-xs font-bold text-navy-900 hover:bg-sand-100"
            >
              <Pencil className="h-3.5 w-3.5" /> Editar Perfil
            </Link>
          </Card>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900/[0.06] text-navy-900">
                <Briefcase className="h-4.5 w-4.5" />
              </div>
              <p className="mt-2.5 font-heading text-2xl font-bold text-navy-900">{activeJobs.length}</p>
              <p className="text-xs font-medium text-navy-800/60">Bretes activos</p>
              {activeThisWeek > 0 && (
                <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-success-600">
                  <TrendingUp className="h-3 w-3" /> +{activeThisWeek} esta semana
                </p>
              )}
            </Card>
            <Card className="p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cr-red-600/[0.09] text-cr-red-600">
                <Users className="h-4.5 w-4.5" />
              </div>
              <p className="mt-2.5 font-heading text-2xl font-bold text-navy-900">{newApplicationsCount}</p>
              <p className="text-xs font-medium text-navy-800/60">Candidatos nuevos</p>
            </Card>
          </div>

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
              <Button href="/empresa/vacantes/nueva" size="sm" variant="secondary" className="rounded-full">
                <Plus className="h-3.5 w-3.5" /> Publicar
              </Button>
            </div>
            {company.jobPostings.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="Todavía no publicaste ningún brete"
                description="Publicá tu primera vacante y empezá a recibir aplicantes."
                action={{ label: "Publicar brete", href: "/empresa/vacantes/nueva" }}
                className="mt-3 border-none bg-sand-50 p-6 shadow-none"
              />
            ) : (
              <div className="mt-3 flex flex-col gap-2.5">
                {company.jobPostings.map((job) => (
                  <Link key={job.id} href={`/vacantes/${job.id}/aplicantes`}>
                    <div className="flex items-center gap-3 rounded-xl border border-sand-200 p-3">
                      <CategoryIcon category={job.laborCategory} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-semibold text-navy-900">{job.title}</p>
                          {job.isUrgent && job.isActive && <Badge tone="red">Urgente</Badge>}
                        </div>
                        <p className="mt-0.5 text-xs text-navy-800/50">
                          {job._count.applications} aplicante{job._count.applications !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Badge tone={job.isActive ? "success" : "neutral"}>
                        {job.isActive
                          ? "Activa"
                          : `Cerrada${closureReasonLabel(job.closureReason) ? ` · ${closureReasonLabel(job.closureReason)}` : ""}`}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card className="mt-4 p-5">
            <h2 className="text-sm font-bold text-navy-900">Buscar personal</h2>
            <p className="mt-1 text-xs text-navy-800/50">
              También podés explorar perfiles de trabajadores directamente en{" "}
              <Link href="/buscar-personal" className="font-semibold text-cr-red-600">
                Buscar personal
              </Link>{" "}
              o revisar tus{" "}
              <Link href="/empresa/guardados" className="font-semibold text-cr-red-600">
                trabajadores guardados
              </Link>.
            </p>
          </Card>

          <div className="mt-4 flex flex-col gap-2.5">
            <Link
              href="/perfil/editar"
              className="flex items-center justify-between rounded-xl border border-sand-200 bg-white p-4 shadow-ambient transition-colors hover:bg-sand-100"
            >
              <span className="flex items-center gap-2.5 text-sm font-semibold text-navy-900">
                <Pencil className="h-4 w-4 text-navy-800/60" /> Configuración de la cuenta
              </span>
              <ChevronRight className="h-4 w-4 text-navy-800/30" />
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button className="flex w-full items-center gap-2.5 rounded-xl border border-sand-200 bg-white p-4 text-sm font-semibold text-cr-red-600 shadow-ambient transition-colors hover:bg-cr-red-100/40">
                <LogOut className="h-4 w-4" /> Cerrar sesión
              </button>
            </form>
          </div>

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
          <h1 className="font-heading text-lg font-bold text-navy-900">Panel de moderación</h1>
          <p className="mt-2 text-sm text-navy-800/60">
            Tu única función es bloquear el acceso de un usuario a las salas de chat que
            tenés asignadas. No tenés acceso a información administrativa sensible.
          </p>
        </Card>

        <Card className="mt-4 p-5">
          <h2 className="text-sm font-bold text-navy-900">Mis salas asignadas</h2>
          {!moderator || moderator.assignments.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="Todavía no tenés salas asignadas"
              description="Un administrador te va a asignar salas de chat para moderar."
              className="mt-3 border-none bg-sand-50 p-6 shadow-none"
            />
          ) : (
            <div className="mt-3 flex flex-col gap-2.5">
              {moderator.assignments.map((a) => (
                <Link key={a.id} href={`/comunidad/${a.chatRoom.category.toLowerCase()}/moderacion`}>
                  <div className="flex items-center gap-3 rounded-xl border border-sand-200 p-3">
                    <CategoryIcon category={a.chatRoom.category} size="sm" />
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

        <form
          className="mt-4"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button className="flex w-full items-center gap-2.5 rounded-xl border border-sand-200 bg-white p-4 text-sm font-semibold text-cr-red-600 shadow-ambient transition-colors hover:bg-cr-red-100/40">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </form>
      </main>
      <BottomNav />
    </div>
  );
}
