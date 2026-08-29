import { prisma } from "@/lib/prisma";

// Cotizaciones (Sección "servicios puntuales"): a pedido explícito del
// dueño del producto, una cuenta WORKER puede ofrecer servicios igual que
// una cuenta COMPANY -- reusa el mismo CompanyProfile (perfil de
// servicios, fotos, PDF, Plan Profesional), no un modelo nuevo. Antes esto
// era exclusivo de COMPANY (creada vía /registro/empresa, con campos de
// negocio formal como RFC que no tienen sentido para un profesional
// independiente). Si una cuenta WORKER entra por primera vez a ofrecer
// servicios, se le crea acá un CompanyProfile liviano a partir de los
// datos que ya cargó en su perfil de trabajador -- sin pasar por el
// registro de empresa completo.
export function canOfferServices(role: string | undefined): boolean {
  return role === "COMPANY" || role === "WORKER";
}

export async function findOrCreateServiceProfile(userId: string, role: string | undefined) {
  const existing = await prisma.companyProfile.findUnique({ where: { userId } });
  if (existing) return existing;
  if (role !== "WORKER") return null;

  const worker = await prisma.workerProfile.findUnique({ where: { userId } });
  if (!worker) return null;

  return prisma.companyProfile.create({
    data: {
      userId,
      commercialName: worker.fullName,
      legalId: "",
      responsibleName: worker.fullName,
      contactPhone: worker.phone,
      contactEmail: worker.email,
      location: worker.residence,
      activity: worker.profession,
    },
  });
}
