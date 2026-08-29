import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthShell } from "@/components/layout/AuthShell";
import { Card } from "@/components/ui/Card";
import { JobPostingForm } from "@/components/forms/JobPostingForm";
import { SubscribeButton } from "@/components/forms/SubscribeButton";
import { CancelSubscriptionButton } from "@/components/forms/CancelSubscriptionButton";
import { getAppSettings } from "@/lib/settings";
import { countActiveJobPostings } from "@/lib/job-posting-limits";
import { FREE_ACTIVE_JOBS_LIMIT } from "@/lib/constants";
import { formatPesos } from "@/lib/format";

export default async function NuevaVacantePage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");
  if (session.user.role !== "COMPANY") redirect("/perfil");

  const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!company) redirect("/registro/empresa");

  const [activeCount, settings] = await Promise.all([
    countActiveJobPostings(company.id),
    getAppSettings(),
  ]);
  const atLimit = !company.employerPlanActive && activeCount >= FREE_ACTIVE_JOBS_LIMIT;

  return (
    <AuthShell title="Publicar vacante" subtitle="Los trabajadores podrán verla y aplicar directamente.">
      {!company.employerPlanActive && (
        <Card className="mb-4 flex items-center gap-2.5 p-3.5">
          <Briefcase className="h-4 w-4 shrink-0 text-navy-800/50" />
          <p className="text-xs text-navy-800/60">
            <strong className="text-navy-900">{activeCount}/{FREE_ACTIVE_JOBS_LIMIT}</strong> vacantes activas del
            plan gratis.
          </p>
        </Card>
      )}

      {atLimit ? (
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-peso-600" />
            <p className="text-sm font-bold text-navy-900">
              Plan Empleador — ${formatPesos(settings.employerPlanPricePesos)} MXN/mes
            </p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-navy-800/65">
            Llegaste al límite de {FREE_ACTIVE_JOBS_LIMIT} vacantes activas al mismo tiempo del plan
            gratis. Activá el Plan Empleador para publicar todas las que necesites sin límite, o{" "}
            <Link href="/perfil" className="font-semibold text-mx-red-600">
              cerrá alguna vacante
            </Link>{" "}
            para liberar un lugar gratis.
          </p>
          <div className="mt-3">
            {settings.paypalEmployerPlanId ? (
              <SubscribeButton
                planId={settings.paypalEmployerPlanId}
                confirmUrl="/api/paypal/empleador/confirmar"
                containerId="paypal-empleador-buttons"
              />
            ) : (
              <p className="rounded-lg bg-sand-100 px-3 py-2.5 text-center text-xs text-navy-800/50">
                Disponible próximamente
              </p>
            )}
          </div>
        </Card>
      ) : (
        <>
          <JobPostingForm />
          {company.employerPlanActive && (
            <Card className="mt-4 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-peso-600" />
                <p className="text-sm font-bold text-navy-900">Plan Empleador activo</p>
              </div>
              <p className="mt-1 text-xs text-navy-800/50">Sin límite de vacantes activas simultáneas.</p>
              <div className="mt-3">
                <CancelSubscriptionButton cancelUrl="/api/paypal/empleador/cancelar" label="Cancelar Plan Empleador" />
              </div>
            </Card>
          )}
        </>
      )}
    </AuthShell>
  );
}
