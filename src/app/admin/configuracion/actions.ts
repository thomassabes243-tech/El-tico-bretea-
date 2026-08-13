"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { updateAppSettings } from "@/lib/settings";

export async function saveSettings(formData: FormData) {
  await requireAdmin();

  const cvPriceColones = Number(formData.get("cvPriceColones"));
  const premiumPriceColones = Number(formData.get("premiumPriceColones"));
  const freeDailyFileLimit = Number(formData.get("freeDailyFileLimit"));
  const companyDailyFileLimit = Number(formData.get("companyDailyFileLimit"));

  if (
    [cvPriceColones, premiumPriceColones, freeDailyFileLimit, companyDailyFileLimit].some(
      (n) => !Number.isFinite(n) || n < 0
    )
  ) {
    throw new Error("Todos los valores deben ser números válidos mayores o iguales a 0");
  }

  await updateAppSettings({
    cvPriceColones: Math.round(cvPriceColones),
    premiumPriceColones: Math.round(premiumPriceColones),
    freeDailyFileLimit: Math.round(freeDailyFileLimit),
    companyDailyFileLimit: Math.round(companyDailyFileLimit),
  });

  revalidatePath("/admin/configuracion");
  revalidatePath("/premium");
  revalidatePath("/cv");
}
