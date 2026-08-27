"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canModerateScamAlerts } from "@/lib/scam-alerts";

export async function toggleScamAlertFlagResolved(flagId: string, alertId: string, nextValue: boolean) {
  const session = await auth();
  if (!session?.user || !canModerateScamAlerts(session.user.role)) {
    throw new Error("No autorizado");
  }
  await prisma.scamAlertFlag.update({ where: { id: flagId }, data: { resolved: nextValue } });
  revalidatePath(`/alertas-estafa/${alertId}`);
}
