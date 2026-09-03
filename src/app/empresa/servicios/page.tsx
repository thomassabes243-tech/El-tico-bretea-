import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthShell } from "@/components/layout/AuthShell";
import { Card } from "@/components/ui/Card";
import { ServiceProfileForm } from "@/components/forms/ServiceProfileForm";
import { SubscribeButton } from "@/components/forms/SubscribeButton";
import { CancelSubscriptionButton } from "@/components/forms/CancelSubscriptionButton";
import { PushNotificationToggle } from "@/components/forms/PushNotificationToggle";
import { getAppSettings } from "@/lib/settings";
import { formatPesos } from "@/lib/format";
import { canOfferServices, findOrCreateServiceProfile } from "@/lib/company-profile";

export default async function ServiciosPage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");
  if (!canOfferServices(session.user.role)) redirect("/perfil");

  await findOrCreateServiceProfile(session.user.id, session.user.role);

  const [company, settings] = await Promise.all([
    prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
      include: { portfolioPhotos: { orderBy: { createdAt: "desc" } } },
    }),
    getAppSettings(),
  ]);
  // Nunca mandar a una cuenta ya logueada al formulario de ALTA de empresa
  // (pide correo/contraseña de nuevo, sin chequeo de sesión, y si escribe su
  // propio correo la API le responde "Ya existe una cuenta con ese correo"
  // -- bug reportado por el dueño). Para COMPANY, esto solo puede faltar si
  // el perfil de empresa nunca se creó (caso excepcional, sí corresponde
  // completarlo ahí); para WORKER, findOrCreateServiceProfile ya debería
  // haber creado uno -- si aun así falta (ej. WorkerProfile incompleto),
  // que vuelva a su perfil en vez de un alta de cuenta nueva.
  if (!company) redirect(session.user.role === "WORKER" ? "/perfil" : "/registro/empresa");

  return (
    // Rediseño visual (alcance acotado): DM Sans para toda la sección de
    // Cotizaciones, ver src/app/servicios/layout.tsx -- esta pantalla vive
    // fuera de ese segmento de rutas, así que se envuelve acá directo.
    <div className="contents font-dm-sans">
    <AuthShell
      title="Cotizaciones"
      subtitle="Ofrecé tus servicios a clientes que necesitan un trabajo puntual, además de tus vacantes."
    >
      <ServiceProfileForm
        companyId={company.id}
        initialOffersServices={company.offersServices}
        initialCategories={company.serviceCategories}
        initialZoneLabel={company.serviceZoneLabel ?? ""}
        initialDescription={company.serviceDescription ?? ""}
        initialYearsExperience={company.serviceYearsExperience}
        initialContactPhone={company.contactPhone ?? ""}
        initialLogoUrl={company.logoUrl}
        hasLocation={company.serviceLatitude != null && company.serviceLongitude != null}
        initialPhotos={company.portfolioPhotos.map((p) => ({
          id: p.id,
          url: `/api/fotos/portafolio/${p.id}`,
        }))}
        initialPortfolioDocName={company.servicePortfolioDocName}
      />

      {company.offersServices && (
        <Card className="mt-4 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-peso-600" />
            <p className="text-sm font-bold text-navy-900">
              Plan Profesional — ${formatPesos(settings.professionalPricePesos)} MXN/mes
            </p>
          </div>
          <ul className="mt-2 list-disc pl-5 text-xs leading-relaxed text-navy-800/65">
            <li>Aparecés primero en la bandeja de solicitudes.</li>
            <li>Notificaciones inmediatas de nuevas solicitudes.</li>
            <li>Verificación de identidad prioritaria (mismo criterio, revisión más rápida).</li>
          </ul>
          <p className="mt-2 text-[11px] text-navy-800/45">
            Sin este plan, tu perfil sigue visible y recibiendo solicitudes igual — nunca queda
            invisible ni bloqueado.
          </p>
          <div className="mt-3">
            {company.professionalPlanActive ? (
              <div className="flex flex-col gap-2">
                <CancelSubscriptionButton cancelUrl="/api/paypal/profesional/cancelar" label="Cancelar Plan Profesional" />
                <PushNotificationToggle />
              </div>
            ) : settings.paypalProfessionalPlanId ? (
              <SubscribeButton
                planId={settings.paypalProfessionalPlanId}
                confirmUrl="/api/paypal/profesional/confirmar"
                containerId="paypal-profesional-buttons"
              />
            ) : (
              <p className="rounded-lg bg-sand-100 px-3 py-2.5 text-center text-xs text-navy-800/50">
                Disponible próximamente
              </p>
            )}
          </div>
        </Card>
      )}
    </AuthShell>
    </div>
  );
}
