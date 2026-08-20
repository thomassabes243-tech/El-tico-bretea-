"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type CvPaymentClaimState = { error: string | null; ok?: boolean };

// El trabajador paga por fuera de la app (SINPE Móvil) y pega acá el código
// de comprobante que le dio su banco. No se verifica automáticamente -- un
// admin lo revisa a mano en /admin/pagos-cv y aprueba o rechaza.
export async function submitCvPaymentClaim(
  _prevState: CvPaymentClaimState,
  formData: FormData
): Promise<CvPaymentClaimState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return { error: "No autorizado" };
  }

  const referenceCode = String(formData.get("referenceCode") || "").trim();
  if (!referenceCode) {
    return { error: "Pegá el código de comprobante que te dio tu banco" };
  }
  if (referenceCode.length > 100) {
    return { error: "El código es demasiado largo" };
  }

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, cvUnlocked: true },
  });
  if (!worker) {
    return { error: "Completá tu perfil primero" };
  }
  if (worker.cvUnlocked) {
    return { error: "Ya tenés la descarga del CV desbloqueada" };
  }

  const pending = await prisma.cvPaymentClaim.findFirst({
    where: { workerId: worker.id, status: "PENDIENTE" },
  });
  if (pending) {
    return { error: "Ya tenés un comprobante en revisión, esperá a que el admin lo revise" };
  }

  await prisma.cvPaymentClaim.create({
    data: { workerId: worker.id, referenceCode },
  });

  revalidatePath("/cv");
  return { error: null, ok: true };
}
