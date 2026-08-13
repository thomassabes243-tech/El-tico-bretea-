"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function toggleReportResolved(reportId: string, nextValue: boolean) {
  await requireAdmin();
  await prisma.report.update({ where: { id: reportId }, data: { resolved: nextValue } });
  revalidatePath("/admin/reportes");
}
