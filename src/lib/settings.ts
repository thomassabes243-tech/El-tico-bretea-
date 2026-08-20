import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export async function getAppSettings() {
  const existing = await prisma.appSettings.findUnique({ where: { id: SETTINGS_ID } });
  if (existing) return existing;
  return prisma.appSettings.create({ data: { id: SETTINGS_ID } });
}

export async function updateAppSettings(data: {
  cvPriceColones: number;
  premiumPriceColones: number;
  sinpeMovilNumber?: string | null;
  sinpeMovilName?: string | null;
  contactWhatsapp?: string | null;
}) {
  return prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  });
}
