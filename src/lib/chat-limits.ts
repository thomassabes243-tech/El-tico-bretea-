import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";

// Sección 8: límites diarios de archivos en el chat. Los valores por
// defecto viven en AppSettings y son editables desde /admin sin necesidad
// de actualizar la app (Sección 20).
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB antes de comprimir

type LimitCheck = {
  allowed: boolean;
  limit: number | null; // null = sin límite (Premium)
  usedToday: number;
};

export async function checkDailyFileLimit(userId: string): Promise<LimitCheck> {
  const [user, settings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { workerProfile: { select: { isPremium: true } } },
    }),
    getAppSettings(),
  ]);

  const isPremium = user?.workerProfile?.isPremium ?? false;
  const limit = isPremium
    ? null
    : user?.role === "COMPANY"
      ? settings.companyDailyFileLimit
      : settings.freeDailyFileLimit;

  if (limit === null) {
    return { allowed: true, limit: null, usedToday: 0 };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const usedToday = await prisma.chatFile.count({
    where: { uploaderId: userId, createdAt: { gte: since } },
  });

  return { allowed: usedToday < limit, limit, usedToday };
}
