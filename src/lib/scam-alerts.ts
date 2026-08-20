import type { Prisma } from "@prisma/client";
import { displayNameFor } from "@/lib/chat-rooms";

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
    authorName: displayNameFor(alert.author),
    confirmationsCount: alert._count.confirmations,
    confirmedByViewer: viewerId ? alert.confirmations.some((c) => c.userId === viewerId) : false,
  };
}
