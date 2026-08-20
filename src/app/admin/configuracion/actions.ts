"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { updateAppSettings } from "@/lib/settings";

export async function saveSettings(formData: FormData) {
  await requireAdmin();

  const cvPriceColones = Number(formData.get("cvPriceColones"));
  const premiumPriceColones = Number(formData.get("premiumPriceColones"));
  const bankTransferAccount = String(formData.get("bankTransferAccount") || "").trim();
  const bankTransferHolder = String(formData.get("bankTransferHolder") || "").trim();
  const contactWhatsapp = String(formData.get("contactWhatsapp") || "").replace(/\D/g, "");

  if ([cvPriceColones, premiumPriceColones].some((n) => !Number.isFinite(n) || n < 0)) {
    throw new Error("Todos los valores deben ser números válidos mayores o iguales a 0");
  }

  await updateAppSettings({
    cvPriceColones: Math.round(cvPriceColones),
    premiumPriceColones: Math.round(premiumPriceColones),
    bankTransferAccount: bankTransferAccount || null,
    bankTransferHolder: bankTransferHolder || null,
    contactWhatsapp: contactWhatsapp || null,
  });

  revalidatePath("/admin/configuracion");
  revalidatePath("/premium");
  revalidatePath("/cv");
}
