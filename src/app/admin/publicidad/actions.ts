"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ICON_OPTIONS } from "@/lib/ad-icons";

export async function createAd(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const href = String(formData.get("href") || "").trim();
  const ctaLabel = String(formData.get("ctaLabel") || "").trim();
  const iconKey = String(formData.get("iconKey") || "sparkles");

  if (!title || !description || !href || !ctaLabel) {
    throw new Error("Completá todos los campos");
  }
  if (!href.startsWith("/")) {
    throw new Error("El enlace debe ser una ruta interna, ej. /premium");
  }
  if (!(iconKey in ICON_OPTIONS)) {
    throw new Error("Ícono inválido");
  }

  await prisma.advertisement.create({
    data: { title, description, href, ctaLabel, iconKey },
  });

  revalidatePath("/admin/publicidad");
}

export async function toggleAdActive(id: string, nextValue: boolean) {
  await requireAdmin();
  await prisma.advertisement.update({ where: { id }, data: { isActive: nextValue } });
  revalidatePath("/admin/publicidad");
}

export async function deleteAd(id: string) {
  await requireAdmin();
  await prisma.advertisement.delete({ where: { id } }).catch(() => undefined);
  revalidatePath("/admin/publicidad");
}
