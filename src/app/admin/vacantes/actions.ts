"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function toggleJobPostingActive(jobPostingId: string, nextValue: boolean) {
  await requireAdmin();
  // closureReason es específico de cuando la empresa cierra su propia vacante
  // (puesto lleno / caducada); una acción del admin no aplica ninguno de esos
  // motivos, así que se limpia para no dejar un motivo viejo mostrándose.
  await prisma.jobPosting.update({
    where: { id: jobPostingId },
    data: { isActive: nextValue, closureReason: null },
  });
  revalidatePath("/admin/vacantes");
}

// Curación editorial ("Brete Premium"): solo el admin la activa, igual que
// el Premium de trabajadores -- no es algo que la empresa se auto-asigne.
export async function toggleJobPostingFeatured(jobPostingId: string, nextValue: boolean) {
  await requireAdmin();
  await prisma.jobPosting.update({
    where: { id: jobPostingId },
    data: { isFeatured: nextValue },
  });
  revalidatePath("/admin/vacantes");
  revalidatePath("/");
}
