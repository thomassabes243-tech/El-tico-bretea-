import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { workerProfileUpdateSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = workerProfileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!worker) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  const data = parsed.data;

  await prisma.$transaction([
    prisma.workerProfile.update({
      where: { id: worker.id },
      data: {
        fullName: data.fullName,
        formalPhotoUrl: data.formalPhotoUrl || null,
        age: data.age,
        residence: data.residence,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        profession: data.profession,
        laborCategory: data.laborCategory,
        yearsExperience: data.yearsExperience,
        workExperience: data.workExperience || null,
        companiesWorkedAt: data.companiesWorkedAt || null,
        previousPositions: data.previousPositions || null,
        education: data.education || null,
        degrees: data.degrees || null,
        courses: data.courses || null,
        certifications: data.certifications || null,
        skills: data.skills || null,
        languages: data.languages || null,
        availability: data.availability,
        willingToRelocate: data.willingToRelocate,
        jobTypeSought: data.jobTypeSought,
        salaryExpectation: data.salaryExpectation || null,
        isPublic: data.isPublic,
        showPhone: data.showPhone,
        showWhatsapp: data.showWhatsapp,
        showEmail: data.showEmail,
        showSalaryExpectation: data.showSalaryExpectation,
        alias: data.alias || null,
      },
    }),
    prisma.workerReference.deleteMany({ where: { workerId: worker.id } }),
    prisma.workerReference.createMany({
      data: (data.references ?? [])
        .filter((r) => r.name && r.company)
        .map((r) => ({
          workerId: worker.id,
          name: r.name,
          company: r.company,
          phone: r.phone || null,
          email: r.email || null,
        })),
    }),
  ]);

  return NextResponse.json({ ok: true });
}
