import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jobPostingSchema } from "@/lib/validations";
import { JOB_CLOSURE_REASONS } from "@/lib/job-closure-reason";
import { textOrDefault, enumOrDefault } from "@/lib/form-defaults";

const VALID_CLOSURE_REASONS = JOB_CLOSURE_REASONS.map((r) => r.value);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const jobPosting = await prisma.jobPosting.findUnique({
    where: { id },
    include: { company: { select: { userId: true } } },
  });
  if (!jobPosting || jobPosting.company.userId !== session.user.id) {
    return NextResponse.json({ error: "Vacante no encontrada" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));

  // Cambio rápido de estado (cerrar/reactivar), sin validar el resto de campos.
  const bodyKeys = Object.keys(body);
  const isQuickStatusChange =
    typeof body.isActive === "boolean" &&
    bodyKeys.every((k) => k === "isActive" || k === "closureReason");

  if (isQuickStatusChange) {
    if (body.isActive) {
      await prisma.jobPosting.update({
        where: { id },
        data: { isActive: true, closureReason: null },
      });
      return NextResponse.json({ ok: true });
    }

    if (body.closureReason !== undefined && !VALID_CLOSURE_REASONS.includes(body.closureReason)) {
      return NextResponse.json({ error: "Motivo de cierre inválido" }, { status: 400 });
    }
    await prisma.jobPosting.update({
      where: { id },
      data: { isActive: false, closureReason: body.closureReason ?? null },
    });
    return NextResponse.json({ ok: true });
  }

  const parsed = jobPostingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  await prisma.jobPosting.update({
    where: { id },
    data: {
      title: textOrDefault(data.title),
      description: textOrDefault(data.description),
      laborCategory: enumOrDefault(data.laborCategory),
      location: textOrDefault(data.location),
      contractType: enumOrDefault(data.contractType),
      quantity: data.quantity ?? null,
      salary: data.salary || null,
      schedule: data.schedule || null,
      experienceRequired: data.experienceRequired || null,
      educationRequired: data.educationRequired || null,
      requirements: data.requirements || null,
      whatsapp: data.whatsapp || null,
      contactEmail: data.contactEmail || null,
      deadline: data.deadline ? new Date(data.deadline) : null,
    },
  });

  return NextResponse.json({ ok: true });
}
