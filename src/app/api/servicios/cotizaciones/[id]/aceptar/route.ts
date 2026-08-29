import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const quote = await prisma.serviceQuote.findUnique({
    where: { id },
    include: { serviceRequest: true },
  });
  if (!quote || quote.serviceRequest.requesterId !== session.user.id) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  if (quote.serviceRequest.status !== "ABIERTA") {
    return NextResponse.json({ error: "Esta solicitud ya se cerró" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.serviceQuote.update({ where: { id: quote.id }, data: { status: "ACEPTADA" } }),
    prisma.serviceQuote.updateMany({
      where: { serviceRequestId: quote.serviceRequestId, id: { not: quote.id } },
      data: { status: "RECHAZADA" },
    }),
    prisma.serviceRequest.update({
      where: { id: quote.serviceRequestId },
      data: { status: "CERRADA", closedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
