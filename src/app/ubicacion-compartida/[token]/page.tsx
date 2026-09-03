import { notFound } from "next/navigation";
import { MapPin, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { LogoMark } from "@/components/brand/Logo";
import { Card } from "@/components/ui/Card";
import { displayNameFor } from "@/lib/chat-rooms";
import { cleanupExpiredLocationShares } from "@/lib/safety";

export default async function UbicacionCompartidaPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  await cleanupExpiredLocationShares().catch(() => undefined);

  const share = await prisma.locationShare.findUnique({
    where: { shareToken: token },
    include: {
      worker: { include: { workerProfile: true, companyProfile: true } },
      trustedContact: true,
    },
  });

  if (!share || share.expiresAt < new Date()) notFound();

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${share.latitude},${share.longitude}`;
  const workerName = displayNameFor(share.worker);

  return (
    <div className="flex min-h-screen flex-col items-center bg-sand-50 px-4 py-8">
      <LogoMark size={36} />
      <Card className="mt-6 w-full max-w-sm p-5">
        <h1 className="text-lg font-extrabold text-navy-900">
          {workerName} compartió su ubicación con vos
        </h1>
        <p className="mt-1 text-xs text-navy-800/50">
          Para: {share.trustedContact.name} · {share.status === "ACTIVA" ? "Activa" : "Finalizada"}
        </p>
        {share.label && (
          <p className="mt-1 text-xs font-semibold text-navy-800/60">Motivo: {share.label}</p>
        )}

        {share.suspicious && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-warning-600/25 bg-warning-600/10 p-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning-600" />
            <p className="text-xs leading-relaxed text-navy-800/70">
              Esta ubicación quedó marcada para revisión ({share.suspicionReason}). Puede ser un
              falso positivo, pero tenelo en cuenta.
            </p>
          </div>
        )}

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white"
        >
          <MapPin className="h-4 w-4" /> Ver en el mapa
        </a>

        <p className="mt-4 text-xs leading-relaxed text-navy-800/50">
          Este link es de solo lectura y se deja de actualizar cuando venza (hasta 6 horas desde
          que se compartió). Si algo no cuadra, comunicate directo con {workerName} o llamá al
          911 si creés que hay peligro real.
        </p>
      </Card>
    </div>
  );
}
