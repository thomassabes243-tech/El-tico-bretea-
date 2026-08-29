"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { JOB_POSTINGS_CACHE_TAG } from "@/lib/job-postings";

export async function toggleJobPostingActive(jobPostingId: string, nextValue: boolean) {
  await requireAdmin();
  // closureReason es específico de cuando la empresa cierra su propia vacante
  // (puesto lleno / caducada); una acción del admin no aplica ninguno de esos
  // motivos, así que se limpia para no dejar un motivo viejo mostrándose.
  await prisma.jobPosting.update({
    where: { id: jobPostingId },
    data: { isActive: nextValue, closureReason: null },
  });
  updateTag(JOB_POSTINGS_CACHE_TAG);
  revalidatePath("/admin/vacantes");
}
