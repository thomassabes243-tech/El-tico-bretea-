import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jobPostingSchema } from "@/lib/validations";

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

  // Cambio rápido de estado (botón cerrar/reactivar): solo isActive, sin validar el resto de campos.
  if (typeof body.isActive === "boolean" && Object.keys(body).length === 1) {
    await prisma.jobPosting.update({ where: { id }, data: { isActive: body.isActive } });
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
      title: data.title,
      description: data.description,
      laborCategory: data.laborCategory,
      location: data.location,
      contractType: data.contractType,
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
