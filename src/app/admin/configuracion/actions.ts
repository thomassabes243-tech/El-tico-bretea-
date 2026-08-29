"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { updateAppSettings } from "@/lib/settings";

export async function saveSettings(formData: FormData) {
  await requireAdmin();

  const premiumPricePesos = Number(formData.get("premiumPricePesos"));
  const professionalPricePesos = Number(formData.get("professionalPricePesos"));
  const employerPlanPricePesos = Number(formData.get("employerPlanPricePesos"));

  if (!Number.isFinite(premiumPricePesos) || premiumPricePesos < 0) {
    throw new Error("El valor debe ser un número válido mayor o igual a 0");
  }
  if (!Number.isFinite(professionalPricePesos) || professionalPricePesos < 0) {
    throw new Error("El valor debe ser un número válido mayor o igual a 0");
  }
  if (!Number.isFinite(employerPlanPricePesos) || employerPlanPricePesos < 0) {
    throw new Error("El valor debe ser un número válido mayor o igual a 0");
  }

  await updateAppSettings({
    premiumPricePesos: Math.round(premiumPricePesos),
    professionalPricePesos: Math.round(professionalPricePesos),
    employerPlanPricePesos: Math.round(employerPlanPricePesos),
  });

  revalidatePath("/admin/configuracion");
  revalidatePath("/premium");
  revalidatePath("/empresa/servicios");
  revalidatePath("/empresa/vacantes/nueva");
}
