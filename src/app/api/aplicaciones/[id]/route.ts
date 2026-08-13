import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { APPLICATION_STATUS_OPTIONS } from "@/lib/application-status";

const VALID_STATUSES = APPLICATION_STATUS_OPTIONS.map((s) => s.value);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (typeof body.status !== "string" || !VALID_STATUSES.includes(body.status as never)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const application = await prisma.jobApplication.findUnique({
    where: { id },
    include: { jobPosting: { include: { company: { select: { userId: true } } } } },
  });
  if (!application || application.jobPosting.company.userId !== session.user.id) {
    return NextResponse.json({ error: "Aplicación no encontrada" }, { status: 404 });
  }

  await prisma.jobApplication.update({
    where: { id },
    data: { status: body.status },
  });

  return NextResponse.json({ ok: true });
}
