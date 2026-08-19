import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scamAlertFlagSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_FLAGS_PER_DAY = 10;
const WINDOW_MS = 24 * 60 * 60 * 1000;

// Reportar un alert puntual como falso/malicioso (ej. publicado contra un
// competidor). No lo oculta ni cambia su estado — solo lo deja disponible
// para que un moderador lo revise en el panel.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Iniciá sesión para reportar" }, { status: 401 });
  }

  const { allowed } = await checkRateLimit(`scam-alert-flag:${session.user.id}`, MAX_FLAGS_PER_DAY, WINDOW_MS);
  if (!allowed) {
    return NextResponse.json({ error: "Alcanzaste el máximo de reportes por día" }, { status: 429 });
  }

  const { id: alertId } = await params;
  const alert = await prisma.scamAlert.findUnique({ where: { id: alertId } });
  if (!alert) return NextResponse.json({ error: "Alerta no encontrada" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const parsed = scamAlertFlagSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Contanos brevemente el motivo" }, { status: 400 });
  }

  await prisma.scamAlertFlag.create({
    data: { alertId, reporterId: session.user.id, reason: parsed.data.reason },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
