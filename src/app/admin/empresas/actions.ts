"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function toggleCompanyVerified(companyId: string, nextValue: boolean) {
  await requireAdmin();
  await prisma.companyProfile.update({
    where: { id: companyId },
    data: { isVerified: nextValue, verifiedAt: nextValue ? new Date() : null },
  });
  revalidatePath("/admin/empresas");
}
