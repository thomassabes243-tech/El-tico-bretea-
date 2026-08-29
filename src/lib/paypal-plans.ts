import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import { createPaypalMonthlyPlan } from "@/lib/paypal";

// Crea en PayPal los planes de suscripción que todavía no existan (ver nota
// en el schema sobre por qué paypal*PlanId puede volver a quedar en null
// cuando cambia un precio). Usado tanto desde el botón del panel admin como
// desde la ruta que se dispara una sola vez al desplegar.
export async function ensurePaypalPlansExist() {
  const settings = await getAppSettings();
  const updates: {
    paypalPremiumPlanId?: string;
    paypalProfessionalPlanId?: string;
    paypalEmployerPlanId?: string;
  } = {};

  if (!settings.paypalPremiumPlanId) {
    updates.paypalPremiumPlanId = await createPaypalMonthlyPlan(
      "El Mexa Chamba Premium",
      "Suscripción mensual Premium para trabajadores",
      "Premium trabajador",
      settings.premiumPricePesos
    );
  }
  if (!settings.paypalProfessionalPlanId) {
    updates.paypalProfessionalPlanId = await createPaypalMonthlyPlan(
      "El Mexa Chamba — Plan Profesional",
      "Suscripción mensual Plan Profesional (Cotizaciones)",
      "Plan Profesional",
      settings.professionalPricePesos
    );
  }
  if (!settings.paypalEmployerPlanId) {
    updates.paypalEmployerPlanId = await createPaypalMonthlyPlan(
      "El Mexa Chamba — Plan Empleador",
      "Suscripción mensual Plan Empleador (vacantes activas ilimitadas)",
      "Plan Empleador",
      settings.employerPlanPricePesos
    );
  }

  if (Object.keys(updates).length > 0) {
    await prisma.appSettings.update({ where: { id: settings.id }, data: updates });
  }

  return {
    paypalPremiumPlanId: updates.paypalPremiumPlanId ?? settings.paypalPremiumPlanId,
    paypalProfessionalPlanId: updates.paypalProfessionalPlanId ?? settings.paypalProfessionalPlanId,
    paypalEmployerPlanId: updates.paypalEmployerPlanId ?? settings.paypalEmployerPlanId,
  };
}
