import { prisma } from "@/lib/prisma";

// Limitador de tasa respaldado por base de datos (tabla RateLimitBucket):
// funciona igual en un solo servidor que en varias instancias serverless
// (Vercel), a diferencia de un contador en memoria de proceso, que no se
// comparte entre invocaciones.

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): Promise<{ allowed: boolean }> {
  const now = new Date();

  // Limpieza oportunista de buckets vencidos, sin necesidad de un cron
  // aparte (misma idea que la limpieza perezosa de archivos de chat).
  if (Math.random() < 0.02) {
    await prisma.rateLimitBucket.deleteMany({ where: { resetAt: { lt: now } } }).catch(() => undefined);
  }

  const bucket = await prisma.rateLimitBucket.findUnique({ where: { key } });

  if (!bucket || bucket.resetAt <= now) {
    await prisma.rateLimitBucket.upsert({
      where: { key },
      create: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) },
      update: { count: 1, resetAt: new Date(now.getTime() + windowMs) },
    });
    return { allowed: true };
  }

  if (bucket.count >= max) {
    return { allowed: false };
  }

  await prisma.rateLimitBucket.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
  return { allowed: true };
}
