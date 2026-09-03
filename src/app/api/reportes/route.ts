import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validations";
import { maybeAutoSuspend } from "@/lib/safety";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Iniciá sesión para reportar" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (parsed.data.targetUserId === session.user.id) {
    return NextResponse.json({ error: "No podés reportarte a vos mismo" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id: parsed.data.targetUserId } });
  if (!targetUser) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  await prisma.report.create({
    data: {
      reporterId: session.user.id,
      targetId: parsed.data.targetUserId,
      targetType: parsed.data.targetType,
      reason: parsed.data.reason,
      reasonCategory: parsed.data.reasonCategory,
      severity: parsed.data.severity,
    },
  });

  const autoSuspended =
    parsed.data.severity === "GRAVE" && (await maybeAutoSuspend(parsed.data.targetUserId));

  return NextResponse.json({ ok: true, autoSuspended }, { status: 201 });
}
