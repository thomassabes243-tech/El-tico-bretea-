import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canModerateScamAlerts } from "@/lib/scam-alerts";

const VALID_STATUSES = ["VERIFICADO", "DESCARTADO", "SIN_VERIFICAR"] as const;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !canModerateScamAlerts(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const status = body?.status;
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const { id: alertId } = await params;
  const alert = await prisma.scamAlert.findUnique({ where: { id: alertId } });
  if (!alert) return NextResponse.json({ error: "Alerta no encontrada" }, { status: 404 });

  await prisma.scamAlert.update({
    where: { id: alertId },
    data: { status, reviewedAt: new Date() },
  });

  return NextResponse.json({ status });
}
