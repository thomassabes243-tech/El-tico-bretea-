import { prisma } from "@/lib/prisma";
import { CURRENT_APP } from "@/lib/tenant";

// Antes se buscaba/creaba por un id fijo ("singleton") -- esa misma cadena
// está hardcodeada igual en el schema de la otra app (El Tico Bretea),
// así que las dos apps leían y escribían la MISMA fila física sin que
// nadie lo supiera. Ahora se busca por appId: cada app tiene su propia
// fila real, con su propio id autogenerado.
export async function getAppSettings() {
  const existing = await prisma.appSettings.findUnique({ where: { appId: CURRENT_APP } });
  if (existing) return existing;
  return prisma.appSettings.create({ data: { appId: CURRENT_APP } });
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
    where: { appId: CURRENT_APP },
    create: { appId: CURRENT_APP, ...data },
    update: { ...data, ...resetPlans },
  });
}
