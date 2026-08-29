import { PrismaClient } from "@prisma/client";

// Neon (plan gratuito) suspende el cómputo tras un rato sin uso -- la
// primera conexión después de eso tarda más en establecerse mientras Neon
// lo "despierta" (unos segundos, no instantáneo). Los tiempos por defecto
// de Prisma (pool_timeout de 10s) son cortos para eso: varias requests
// concurrentes justo después de un período inactivo pueden agotar el pool
// esperando esa reconexión y fallar con "Timed out fetching a new
// connection from the pool" incluso cuando la base ya está respondiendo
// bien. Se agregan acá -- sin pisar lo que ya venga en DATABASE_URL -- en
// vez de depender de editar la variable de entorno en Vercel.
function withPoolTuning(url: string | undefined): string | undefined {
  if (!url) return url;
  const extra: string[] = [];
  if (!/[?&]connect_timeout=/.test(url)) extra.push("connect_timeout=20");
  if (!/[?&]pool_timeout=/.test(url)) extra.push("pool_timeout=30");
  if (extra.length === 0) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${extra.join("&")}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url: withPoolTuning(process.env.DATABASE_URL) } },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
