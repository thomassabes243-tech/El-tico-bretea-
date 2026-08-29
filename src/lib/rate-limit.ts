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

// Variante para login (src/lib/auth.ts): con checkRateLimit tal cual, un
// intento CORRECTO consumía el mismo presupuesto que uno fallido -- si
// antes hubo varios intentos con la contraseña mal tipeada (algo muy común
// en un celular), el intento bueno inmediatamente después podía terminar
// bloqueado igual, con el mismo error genérico que una contraseña
// incorrecta, sin ninguna señal de que en realidad era por exceso de
// intentos. Acá el conteo solo avanza en un fallo real, y un login
// correcto limpia el bucket -- así nunca se le cobra a alguien que
// demostró tener la contraseña correcta.
export async function isLoginRateLimited(key: string, max: number): Promise<boolean> {
  const bucket = await prisma.rateLimitBucket.findUnique({ where: { key } });
  if (!bucket || bucket.resetAt <= new Date()) return false;
  return bucket.count >= max;
}

export async function recordFailedLogin(key: string, windowMs: number): Promise<void> {
  const now = new Date();
  const bucket = await prisma.rateLimitBucket.findUnique({ where: { key } });
  if (!bucket || bucket.resetAt <= now) {
    await prisma.rateLimitBucket.upsert({
      where: { key },
      create: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) },
      update: { count: 1, resetAt: new Date(now.getTime() + windowMs) },
    });
    return;
  }
  await prisma.rateLimitBucket.update({ where: { key }, data: { count: { increment: 1 } } });
}

export async function clearLoginRateLimit(key: string): Promise<void> {
  await prisma.rateLimitBucket.deleteMany({ where: { key } }).catch(() => undefined);
}
