import { notFound } from "next/navigation";
import { MapPin, AlertTriangle, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { LogoMark } from "@/components/brand/Logo";
import { Card } from "@/components/ui/Card";
import { displayNameFor } from "@/lib/chat-rooms";

const STATUS_LABEL: Record<string, string> = {
  ACTIVA: "Activa — sin atender",
  ATENDIDA: "Atendida",
  FALSA_ALARMA: "Marcada como falsa alarma",
};

export default async function PanicoPublicoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const alert = await prisma.panicAlert.findUnique({
    where: { shareToken: token },
    include: {
      worker: { include: { workerProfile: true, companyProfile: true } },
      trustedContact: true,
    },
  });
  if (!alert) notFound();

  const mapsUrl =
    alert.latitude != null && alert.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${alert.latitude},${alert.longitude}`
      : null;
  const workerName = displayNameFor(alert.worker);

  return (
    <div className="flex min-h-screen flex-col items-center bg-sand-50 px-4 py-8">
      <LogoMark size={36} />
      <Card className="mt-6 w-full max-w-sm border-mx-red-600/30 p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-mx-red-600" />
          <h1 className="text-lg font-extrabold text-navy-900">Alerta de {workerName}</h1>
        </div>
        <p className="mt-1 text-xs font-semibold text-mx-red-700">{STATUS_LABEL[alert.status]}</p>
        {alert.trustedContact && (
          <p className="mt-1 text-xs text-navy-800/50">Para: {alert.trustedContact.name}</p>
        )}
        {alert.note && (
          <p className="mt-3 whitespace-pre-line text-sm text-navy-900">{alert.note}</p>
        )}

        {alert.suspicious && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-warning-600/25 bg-warning-600/10 p-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning-600" />
            <p className="text-xs leading-relaxed text-navy-800/70">
              La ubicación de esta alerta quedó marcada para revisión ({alert.suspicionReason}).
              Puede ser un falso positivo, pero tenelo en cuenta.
            </p>
          </div>
        )}

        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 rounded-xl bg-mx-red-600 px-4 py-3 text-sm font-semibold text-white"
          >
            <MapPin className="h-4 w-4" /> Ver ubicación en el mapa
          </a>
        )}

        <p className="mt-4 text-xs leading-relaxed text-navy-800/50">
          Esto es una herramienta de apoyo entre personas, no un servicio de emergencia. Si hay
          sospecha real de peligro, llamá al <strong>911</strong> primero, y después contactá a{" "}
          {workerName}.
        </p>
      </Card>
    </div>
  );
}
