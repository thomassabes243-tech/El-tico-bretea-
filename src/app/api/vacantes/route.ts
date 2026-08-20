import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jobPostingSchema } from "@/lib/validations";
import { textOrDefault, enumOrDefault } from "@/lib/form-defaults";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Solo empresas pueden publicar vacantes" }, { status: 403 });
  }

  const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!company) {
    return NextResponse.json({ error: "Completá el perfil de tu empresa primero" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = jobPostingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const jobPosting = await prisma.jobPosting.create({
    data: {
      companyId: company.id,
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
      isUrgent: data.isUrgent,
    },
  });

  return NextResponse.json({ id: jobPosting.id }, { status: 201 });
}
