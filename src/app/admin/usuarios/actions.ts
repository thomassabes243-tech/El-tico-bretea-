"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function toggleUserBlocked(userId: string, nextValue: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { isBlocked: nextValue } });
  revalidatePath("/admin/usuarios");
}

/**
 * Premium de cortesía otorgado a mano por un admin. Hasta que exista un
 * procesador de pagos conectado, esta es la única forma real de activar
 * Premium — sin esto, el flag nunca podría encenderse.
 */
export async function toggleWorkerPremium(workerId: string, nextValue: boolean) {
  await requireAdmin();
  await prisma.workerProfile.update({ where: { id: workerId }, data: { isPremium: nextValue } });
  revalidatePath("/admin/usuarios");
}
