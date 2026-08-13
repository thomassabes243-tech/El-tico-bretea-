"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function toggleJobPostingActive(jobPostingId: string, nextValue: boolean) {
  await requireAdmin();
  await prisma.jobPosting.update({ where: { id: jobPostingId }, data: { isActive: nextValue } });
  revalidatePath("/admin/vacantes");
}
