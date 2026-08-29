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
//
// connection_limit es el ajuste que faltaba y que de verdad ataca la causa
// de fondo (no solo la síntoma del timeout): sin esto, Prisma calcula un
// límite de conexiones por defecto pensado para un proceso de servidor de
// larga duración (num_cpus*2+1), no para serverless. Cada invocación de
// función en Vercel corre su propio PrismaClient con su propio pool -- con
// tráfico concurrente (varias visitas al mismo tiempo, cada una disparando
// 2-3 queries en paralelo vía Promise.all) se pueden abrir muchas más
// conexiones reales contra Neon de las que el plan gratuito tiene
// disponibles, incluso usando la cadena "pooled" (pgbouncer) -- eso es lo
// que probablemente causó "Can't reach database server" de forma
// intermitente bajo carga, no un timeout de reconexión. Achicar el pool
// por invocación a un número bajo (en vez de dejarlo sin límite) hace que
// el exceso de queries espere su turno (con el pool_timeout ya generoso de
// arriba) en vez de saturar las conexiones reales de Neon.
function withPoolTuning(url: string | undefined): string | undefined {
  if (!url) return url;
  const extra: string[] = [];
  if (!/[?&]connect_timeout=/.test(url)) extra.push("connect_timeout=20");
  if (!/[?&]pool_timeout=/.test(url)) extra.push("pool_timeout=30");
  if (!/[?&]connection_limit=/.test(url)) extra.push("connection_limit=5");
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
