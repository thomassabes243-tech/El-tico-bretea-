import { prisma } from "@/lib/prisma";

// Sección 8: límites diarios de archivos en el chat.
export const FREE_DAILY_FILE_LIMIT = 5;
export const COMPANY_DAILY_FILE_LIMIT = 10;
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB antes de comprimir

type LimitCheck = {
  allowed: boolean;
  limit: number | null; // null = sin límite (Premium)
  usedToday: number;
};

export async function checkDailyFileLimit(userId: string): Promise<LimitCheck> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { workerProfile: { select: { isPremium: true } } },
  });

  const isPremium = user?.workerProfile?.isPremium ?? false;
  const limit = isPremium
    ? null
    : user?.role === "COMPANY"
      ? COMPANY_DAILY_FILE_LIMIT
      : FREE_DAILY_FILE_LIMIT;

  if (limit === null) {
    return { allowed: true, limit: null, usedToday: 0 };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const usedToday = await prisma.chatFile.count({
    where: { uploaderId: userId, createdAt: { gte: since } },
  });

  return { allowed: usedToday < limit, limit, usedToday };
}
