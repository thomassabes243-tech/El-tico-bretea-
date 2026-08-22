import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["ATENDIDA", "FALSA_ALARMA"] as const;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const status = body?.status;
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const { id } = await params;
  await prisma.panicAlert.updateMany({
    where: { id, workerId: session.user.id },
    data: { status, resolvedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
