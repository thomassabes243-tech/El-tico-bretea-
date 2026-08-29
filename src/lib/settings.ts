import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export async function getAppSettings() {
  const existing = await prisma.appSettings.findUnique({ where: { id: SETTINGS_ID } });
  if (existing) return existing;
  return prisma.appSettings.create({ data: { id: SETTINGS_ID } });
}

export async function updateAppSettings(data: {
  premiumPricePesos?: number;
  professionalPricePesos?: number;
  employerPlanPricePesos?: number;
}) {
  const current = await getAppSettings();
  // Si el precio cambia, el plan de PayPal ya creado quedó con el precio
  // viejo (PayPal no permite cambiar el monto de un plan existente) -- se
  // borra el ID guardado para que /api/admin/paypal/planes cree uno nuevo
  // con el precio actual la próxima vez que se ejecute. Los que ya estaban
  // suscriptos siguen pagando el precio con el que se suscribieron.
  const resetPlans: {
    paypalPremiumPlanId?: null;
    paypalProfessionalPlanId?: null;
    paypalEmployerPlanId?: null;
  } = {};
  if (data.premiumPricePesos != null && data.premiumPricePesos !== current.premiumPricePesos) {
    resetPlans.paypalPremiumPlanId = null;
  }
  if (
    data.professionalPricePesos != null &&
    data.professionalPricePesos !== current.professionalPricePesos
  ) {
    resetPlans.paypalProfessionalPlanId = null;
  }
  if (
    data.employerPlanPricePesos != null &&
    data.employerPlanPricePesos !== current.employerPlanPricePesos
  ) {
    resetPlans.paypalEmployerPlanId = null;
  }

  return prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: { ...data, ...resetPlans },
  });
}
