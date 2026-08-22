"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function createMeetingPoint(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const state = String(formData.get("state") || "").trim();

  if (!name || !address || !city || !state) {
    throw new Error("Completá todos los campos");
  }

  await prisma.safeMeetingPoint.create({ data: { name, address, city, state } });
  revalidatePath("/admin/puntos-encuentro");
}

export async function toggleMeetingPointActive(id: string, nextValue: boolean) {
  await requireAdmin();
  await prisma.safeMeetingPoint.update({ where: { id }, data: { isActive: nextValue } });
  revalidatePath("/admin/puntos-encuentro");
}

export async function deleteMeetingPoint(id: string) {
  await requireAdmin();
  await prisma.safeMeetingPoint.delete({ where: { id } }).catch(() => undefined);
  revalidatePath("/admin/puntos-encuentro");
}
