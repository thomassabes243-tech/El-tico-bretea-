import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { AcceptQuoteButton } from "@/components/forms/AcceptQuoteButton";
import { RateQuoteForm } from "@/components/forms/RateQuoteForm";
import { ReportButton } from "@/components/forms/ReportButton";
import { SERVICE_CATEGORIES, PROJECT_MAX_QUOTES } from "@/lib/constants";
import { DistanceBadge } from "@/components/servicios/DistanceBadge";
import { getServiceRatings } from "@/lib/service-ratings";
import { MapPin, ShieldCheck, Inbox, ClipboardList, Star } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  ABIERTA: "Esperando cotizaciones",
  CERRADA: "Contratado",
  CANCELADA: "Cancelada",
};

export default async function SolicitudDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");

  const { id } = await params;
  const serviceRequest = await prisma.serviceRequest.findUnique({
    where: { id },
    include: {
      quotes: {
        orderBy: { createdAt: "asc" },
        include: { company: true, review: true },
      },
    },
  });
  if (!serviceRequest || serviceRequest.requesterId !== session.user.id) notFound();

  // Perk del Plan Profesional: aparecer primero entre las cotizaciones de
  // esta misma solicitud. Nunca oculta ni bloquea a quien no paga, solo
  // reordena -- todas las cotizaciones siguen ahí.
  serviceRequest.quotes.sort((a, b) => Number(b.company.professionalPlanActive) - Number(a.company.professionalPlanActive));

  const cat = SERVICE_CATEGORIES.find((c) => c.value === serviceRequest.category);
  const ratings = await getServiceRatings(serviceRequest.quotes.map((q) => q.companyId));

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{cat?.emoji}</span>
            <div className="flex-1">
              <h1 className="flex items-center gap-1.5 text-lg font-extrabold text-navy-900">
                {cat?.label}
                {serviceRequest.mode === "PROYECTO" && (
                  <span className="flex items-center gap-1 rounded-full bg-peso-100 px-2 py-0.5 text-[10px] font-bold text-peso-700">
                    <ClipboardList className="h-2.5 w-2.5" /> Proyecto
                  </span>
                )}
              </h1>
              <p className="text-xs font-semibold text-navy-800/50">
                {STATUS_LABEL[serviceRequest.status]}
                {serviceRequest.mode === "PROYECTO" &&
                  serviceRequest.status === "ABIERTA" &&
                  ` · ${serviceRequest.quotes.length}/${PROJECT_MAX_QUOTES} cotizaciones`}
              </p>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm text-navy-800/75">{serviceRequest.description}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-navy-800/50">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {serviceRequest.locationLabel}
            </span>
            {serviceRequest.budgetLabel && <span>💰 Presupuesto: {serviceRequest.budgetLabel}</span>}
          </div>
        </Card>

        <h2 className="mt-6 text-base font-bold text-navy-900">
          Cotizaciones ({serviceRequest.quotes.length})
        </h2>

        <div className="mt-3 flex flex-col gap-3">
          {serviceRequest.quotes.length === 0 && (
            <Card className="flex flex-col items-center gap-2 p-8 text-center">
              <Inbox className="h-7 w-7 text-navy-800/30" />
              <p className="text-sm font-semibold text-navy-900">Todavía nadie cotizó</p>
              <p className="text-xs text-navy-800/50">
                Los profesionales de esta categoría y zona ya la pueden ver.
              </p>
            </Card>
          )}
          {serviceRequest.quotes.map((quote) => {
            const rating = ratings.get(quote.companyId);

            return (
              <Card key={quote.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-sm font-bold text-navy-900">
                      {quote.company.commercialName}
                      {quote.company.isVerified && (
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success-600" aria-label="Empresa verificada" />
                      )}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-navy-800/45">
                      {quote.company.isVerified ? "Verificado" : "Verificación pendiente"}
                      {rating && rating.count > 0 ? (
                        <>
                          {" · "}
                          <Star className="h-3 w-3 fill-warning-600 text-warning-600" />
                          {rating.average.toFixed(1)} · {rating.count} trabajo{rating.count !== 1 ? "s" : ""}
                        </>
                      ) : (
                        " · Nuevo en la plataforma"
                      )}
                    </p>
                  </div>
                  {quote.status === "ACEPTADA" && (
                    <span className="shrink-0 rounded-full bg-success-600/10 px-2 py-0.5 text-[11px] font-semibold text-success-600">
                      Contratado
                    </span>
                  )}
                  {quote.status === "RECHAZADA" && (
                    <span className="shrink-0 rounded-full bg-sand-100 px-2 py-0.5 text-[11px] font-semibold text-navy-800/40">
                      No elegido
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] font-medium text-navy-800/70">
                  <span className="rounded-full bg-mx-red-100 px-2.5 py-1 text-mx-red-700">
                    💰 {quote.priceLabel}
                  </span>
                  <span className="rounded-full bg-sand-100 px-2.5 py-1">🕐 {quote.availability}</span>
                  <DistanceBadge
                    aLat={serviceRequest.latitude}
                    aLon={serviceRequest.longitude}
                    bLat={quote.company.serviceLatitude}
                    bLon={quote.company.serviceLongitude}
                    className="rounded-full bg-sand-100 px-2.5 py-1"
                  />
                </div>

                {quote.message && (
                  <p className="mt-2 rounded-lg bg-sand-100 px-3 py-2 text-xs text-navy-800/75">
                    {quote.message}
                  </p>
                )}

                <div className="mt-3 flex items-center justify-between gap-3">
                  {serviceRequest.status === "ABIERTA" ? (
                    <AcceptQuoteButton quoteId={quote.id} />
                  ) : (
                    <span />
                  )}
                  <ReportButton
                    targetUserId={quote.company.userId}
                    targetType="COMPANY"
                    contextLabel={`Cotización de ${quote.company.commercialName}`}
                    isLoggedIn={Boolean(session.user)}
                  />
                </div>

                {quote.status === "ACEPTADA" &&
                  (quote.review ? (
                    <div className="mt-3 rounded-xl border border-sand-200 p-3">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={`h-4 w-4 ${n <= quote.review!.rating ? "fill-warning-600 text-warning-600" : "text-sand-200"}`}
                          />
                        ))}
                      </div>
                      {quote.review.comment && (
                        <p className="mt-1.5 text-xs text-navy-800/70">{quote.review.comment}</p>
                      )}
                    </div>
                  ) : (
                    <RateQuoteForm quoteId={quote.id} />
                  ))}
              </Card>
            );
          })}
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
