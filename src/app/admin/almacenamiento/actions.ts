"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { cleanupExpiredChatFiles } from "@/lib/storage";

export async function runCleanupNow() {
  await requireAdmin();
  const deleted = await cleanupExpiredChatFiles();
  revalidatePath("/admin/almacenamiento");
  return deleted;
}
