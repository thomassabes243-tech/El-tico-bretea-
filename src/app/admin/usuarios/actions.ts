"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function toggleUserBlocked(userId: string, nextValue: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { isBlocked: nextValue } });
  revalidatePath("/admin/usuarios");
}
