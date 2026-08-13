import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireCompany() {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") return null;
  return prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const company = await requireCompany();
  if (!company) return NextResponse.json({ error: "Solo empresas pueden guardar perfiles" }, { status: 403 });

  const { id: workerId } = await params;
  const worker = await prisma.workerProfile.findUnique({ where: { id: workerId } });
  if (!worker) return NextResponse.json({ error: "Trabajador no encontrado" }, { status: 404 });

  await prisma.savedWorker.upsert({
    where: { companyId_workerId: { companyId: company.id, workerId } },
    create: { companyId: company.id, workerId },
    update: {},
  });

  return NextResponse.json({ saved: true }, { status: 201 });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const company = await requireCompany();
  if (!company) return NextResponse.json({ error: "Solo empresas pueden guardar perfiles" }, { status: 403 });

  const { id: workerId } = await params;
  await prisma.savedWorker
    .delete({ where: { companyId_workerId: { companyId: company.id, workerId } } })
    .catch(() => undefined);

  return NextResponse.json({ saved: false });
}
