import type { Prisma } from "@prisma/client";

// Nombre a mostrar en el canal de alertas: usa el alias si el usuario definió
// uno, y si no cae al nombre real (mismo fallback que el chat de comunidad).
// El alias solo aplica acá — en el resto de la app se sigue mostrando el
// nombre real como siempre.
export function aliasDisplayNameFor(user: {
  email: string;
  role: string;
  workerProfile?: { fullName: string; alias: string | null } | null;
  companyProfile?: { commercialName: string; alias: string | null } | null;
}) {
  if (user.workerProfile) return user.workerProfile.alias || user.workerProfile.fullName;
  if (user.companyProfile) return user.companyProfile.alias || user.companyProfile.commercialName;
  if (user.role === "MODERATOR") return "Moderador";
  if (user.role === "ADMIN") return "Administración";
  return user.email;
}

export function canModerateScamAlerts(role: string | undefined) {
  return role === "MODERATOR" || role === "ADMIN";
}

export const SCAM_ALERT_INCLUDE = {
  author: { include: { workerProfile: true, companyProfile: true } },
  confirmations: { select: { userId: true } },
  _count: { select: { confirmations: true } },
} satisfies Prisma.ScamAlertInclude;

export type ScamAlertWithRelations = Prisma.ScamAlertGetPayload<{
  include: typeof SCAM_ALERT_INCLUDE;
}>;

export function serializeScamAlert(alert: ScamAlertWithRelations, viewerId?: string) {
  return {
    id: alert.id,
    title: alert.title,
    offerDescription: alert.offerDescription,
    suspicionReason: alert.suspicionReason,
    location: alert.location,
    modality: alert.modality,
    status: alert.status,
    createdAt: alert.createdAt.toISOString(),
    authorName: aliasDisplayNameFor(alert.author),
    confirmationsCount: alert._count.confirmations,
    confirmedByViewer: viewerId ? alert.confirmations.some((c) => c.userId === viewerId) : false,
  };
}
