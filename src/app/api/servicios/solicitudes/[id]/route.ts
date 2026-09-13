import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = new Set(["ABIERTA", "CANCELADA"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const serviceRequest = await prisma.serviceRequest.findUnique({
    where: { id },
    select: { requesterId: true, status: true },
  });
  if (!serviceRequest || serviceRequest.requesterId !== session.user.id) {
    return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
  }
  if (serviceRequest.status === "CERRADA") {
    return NextResponse.json({ error: "Una solicitud con contratación confirmada no puede reabrirse" }, { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  const status = String(body.status || "");
  if (!ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  await prisma.serviceRequest.update({
    where: { id },
    data: {
      status: status as "ABIERTA" | "CANCELADA",
      closedAt: status === "CANCELADA" ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true });
}

