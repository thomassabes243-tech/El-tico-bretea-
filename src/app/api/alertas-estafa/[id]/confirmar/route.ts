import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Iniciá sesión para confirmar" }, { status: 401 });
  }

  const { id: alertId } = await params;
  const alert = await prisma.scamAlert.findUnique({ where: { id: alertId } });
  if (!alert) return NextResponse.json({ error: "Alerta no encontrada" }, { status: 404 });

  await prisma.scamAlertConfirmation.upsert({
    where: { alertId_userId: { alertId, userId: session.user.id } },
    create: { alertId, userId: session.user.id },
    update: {},
  });

  return NextResponse.json({ confirmed: true }, { status: 201 });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Iniciá sesión para confirmar" }, { status: 401 });
  }

  const { id: alertId } = await params;
  await prisma.scamAlertConfirmation
    .delete({ where: { alertId_userId: { alertId, userId: session.user.id } } })
    .catch(() => undefined);

  return NextResponse.json({ confirmed: false });
}
