"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function approveCvClaim(claimId: string) {
  const session = await requireAdmin();

  const claim = await prisma.cvPaymentClaim.findUnique({ where: { id: claimId } });
  if (!claim || claim.status !== "PENDIENTE") return;

  await prisma.$transaction([
    prisma.cvPaymentClaim.update({
      where: { id: claimId },
      data: { status: "APROBADO", reviewedAt: new Date(), reviewedById: session.user.id },
    }),
    prisma.workerProfile.update({
      where: { id: claim.workerId },
      data: { cvUnlocked: true },
    }),
  ]);

  revalidatePath("/admin/pagos-cv");
}

export async function rejectCvClaim(claimId: string) {
  const session = await requireAdmin();

  await prisma.cvPaymentClaim.updateMany({
    where: { id: claimId, status: "PENDIENTE" },
    data: { status: "RECHAZADO", reviewedAt: new Date(), reviewedById: session.user.id },
  });

  revalidatePath("/admin/pagos-cv");
}
