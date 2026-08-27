import Link from "next/link";
import { AlertTriangle, Flag, Inbox, MapPin, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SCAM_ALERT_MODALITIES, SCAM_ALERT_STATUS_LABELS } from "@/lib/constants";
import { SCAM_ALERT_INCLUDE, serializeScamAlert, canModerateScamAlerts } from "@/lib/scam-alerts";

function modalityLabel(value: string | null) {
  if (!value) return null;
  return SCAM_ALERT_MODALITIES.find((m) => m.value === value)?.label ?? value;
}

export default async function AlertasEstafaPage() {
  const session = await auth();
  const canModerate = canModerateScamAlerts(session?.user?.role);
  const alertsRaw = await prisma.scamAlert.findMany({
    include: SCAM_ALERT_INCLUDE,
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const alerts = alertsRaw.map((a) => serializeScamAlert(a, session?.user?.id));

  const unresolvedFlagCounts = canModerate
    ? await prisma.scamAlertFlag.groupBy({
        by: ["alertId"],
        where: { alertId: { in: alerts.map((a) => a.id) }, resolved: false },
        _count: { alertId: true },
      })
    : [];
  const flagCountByAlertId = new Map(unresolvedFlagCounts.map((f) => [f.alertId, f._count.alertId]));

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mx-red-100 text-mx-red-600">
            <AlertTriangle className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Alertas de estafas</h1>
            <p className="text-xs text-navy-800/50">Reportes públicos de ofertas sospechosas</p>
          </div>
        </div>

        <Card className="mt-4 flex items-start gap-2.5 border-navy-900/10 bg-navy-900/[0.03] p-3.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-navy-800/60" />
          <p className="text-xs leading-relaxed text-navy-800/70">
            Cualquier persona puede publicar y ver estas alertas, sin cuenta especial. Un
            reporte &ldquo;sin verificar&rdquo; no significa que sea falso — significa que
            todavía no lo revisó un moderador. Si estás en peligro real, llamá al{" "}
            <strong>911</strong>.
          </p>
        </Card>

        <Button href="/alertas-estafa/nueva" variant="secondary" fullWidth className="mt-4">
          <AlertTriangle className="h-4 w-4" /> Reportar una oferta sospechosa
        </Button>

        <div className="mt-5 flex flex-col gap-3">
          {alerts.length === 0 && (
            <Card className="flex flex-col items-center gap-2 p-8 text-center">
              <Inbox className="h-6 w-6 text-navy-800/30" />
              <p className="text-sm text-navy-800/50">Todavía no hay alertas publicadas.</p>
            </Card>
          )}

          {alerts.map((alert) => (
            <Link key={alert.id} href={`/alertas-estafa/${alert.id}`}>
              <Card className="p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-navy-900">{alert.title}</p>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {canModerate && (flagCountByAlertId.get(alert.id) ?? 0) > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-mx-red-100 px-2 py-0.5 text-[10px] font-semibold text-mx-red-600">
                        <Flag className="h-3 w-3" /> {flagCountByAlertId.get(alert.id)}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
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
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-navy-800/60">{alert.offerDescription}</p>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-navy-800/45">
                  <span>{alert.authorName}</span>
                  {alert.location && (
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" /> {alert.location}
                    </span>
                  )}
                  {modalityLabel(alert.modality) && <span>{modalityLabel(alert.modality)}</span>}
                  {alert.confirmationsCount > 0 && (
                    <span>{alert.confirmationsCount} confirmaciones</span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
