import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { SCAM_ALERT_MODALITIES, SCAM_ALERT_STATUS_LABELS } from "@/lib/constants";
import { SCAM_ALERT_INCLUDE, serializeScamAlert, canModerateScamAlerts } from "@/lib/scam-alerts";
import { ScamAlertActions } from "@/components/community/ScamAlertActions";

function modalityLabel(value: string | null) {
  if (!value) return null;
  return SCAM_ALERT_MODALITIES.find((m) => m.value === value)?.label ?? value;
}

export default async function AlertaEstafaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const alertRaw = await prisma.scamAlert.findUnique({
    where: { id },
    include: SCAM_ALERT_INCLUDE,
  });
  if (!alertRaw) notFound();

  const alert = serializeScamAlert(alertRaw, session?.user?.id);

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <Link href="/alertas-estafa" className="flex items-center gap-1 text-sm font-medium text-navy-800/60">
          <ChevronLeft className="h-4 w-4" /> Alertas de estafas
        </Link>

        <div className="mt-3 flex items-start justify-between gap-2">
          <h1 className="text-xl font-extrabold tracking-tight text-navy-900">{alert.title}</h1>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              alert.status === "VERIFICADO"
                ? "bg-success-600/10 text-success-600"
                : alert.status === "DESCARTADO"
                  ? "bg-navy-800/10 text-navy-800/50"
                  : "bg-warning-600/10 text-warning-600"
            }`}
          >
            {SCAM_ALERT_STATUS_LABELS[alert.status]}
          </span>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-navy-800/50">
          <span>Publicado por {alert.authorName}</span>
          {alert.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {alert.location}
            </span>
          )}
          {modalityLabel(alert.modality) && <span>{modalityLabel(alert.modality)}</span>}
        </div>

        <Card className="mt-4 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-800/40">Oferta o empresa</p>
          <p className="mt-1 whitespace-pre-line text-sm text-navy-900">{alert.offerDescription}</p>
        </Card>

        <Card className="mt-3 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-800/40">Por qué se sospecha</p>
          <p className="mt-1 whitespace-pre-line text-sm text-navy-900">{alert.suspicionReason}</p>
        </Card>

        <div className="mt-4">
          <ScamAlertActions
            alertId={alert.id}
            isLoggedIn={Boolean(session?.user)}
            initialConfirmed={alert.confirmedByViewer}
            initialCount={alert.confirmationsCount}
            canModerate={canModerateScamAlerts(session?.user?.role)}
            status={alert.status}
          />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
