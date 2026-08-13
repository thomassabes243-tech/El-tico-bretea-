import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "isActive debe ser booleano" }, { status: 400 });
  }

  const jobPosting = await prisma.jobPosting.findUnique({
    where: { id },
    include: { company: { select: { userId: true } } },
  });
  if (!jobPosting || jobPosting.company.userId !== session.user.id) {
    return NextResponse.json({ error: "Vacante no encontrada" }, { status: 404 });
  }

  await prisma.jobPosting.update({ where: { id }, data: { isActive: body.isActive } });
  return NextResponse.json({ ok: true });
}
