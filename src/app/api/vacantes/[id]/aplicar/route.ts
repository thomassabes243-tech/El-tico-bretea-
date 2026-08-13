import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return NextResponse.json({ error: "Solo trabajadores pueden aplicar" }, { status: 403 });
  }

  const worker = await prisma.workerProfile.findUnique({ where: { userId: session.user.id } });
  if (!worker) {
    return NextResponse.json({ error: "Completá tu perfil primero" }, { status: 400 });
  }

  const { id } = await params;
  const jobPosting = await prisma.jobPosting.findUnique({ where: { id } });
  if (!jobPosting || !jobPosting.isActive) {
    return NextResponse.json({ error: "Vacante no disponible" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.slice(0, 1000) : null;

  const existing = await prisma.jobApplication.findUnique({
    where: { jobPostingId_workerId: { jobPostingId: id, workerId: worker.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya aplicaste a esta vacante" }, { status: 409 });
  }

  const application = await prisma.jobApplication.create({
    data: { jobPostingId: id, workerId: worker.id, message },
  });

  return NextResponse.json({ id: application.id }, { status: 201 });
}
