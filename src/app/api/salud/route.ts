import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Endpoint liviano para un ping externo (ej. UptimeRobot, cron-job.org --
// gratis, sin necesidad de cuenta nueva de pago) que mantenga despierto el
// cómputo de Neon en el plan gratuito, que se suspende solo tras un rato de
// inactividad. La primera conexión después de una suspensión tarda más en
// establecerse, y esa demora sumada al pool chico de Prisma en serverless
// es lo que produce los "Timed out fetching a new connection from the
// pool" bajo tráfico concurrente justo después de un período sin uso.
//
// No requiere sesión ni hace nada más que una consulta mínima -- si esto
// falla, es una señal directa de un problema real de conexión a la base,
// sin nada de la app de por medio que pueda enmascararlo.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
