import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { jobPostingSchema } from "@/lib/validations";
import { getOrCreateImportCompany } from "@/lib/ai-import";
import { textOrDefault, enumOrDefault } from "@/lib/form-defaults";

// Publica una oferta importada de Facebook/WhatsApp. Usa exactamente el
// mismo modelo/validación que /api/vacantes (creación normal de una
// empresa) -- la única diferencia es quién puede llamarla (admin, no
// empresa) y a qué companyId se atribuye (la cuenta reservada para
// importados, ver getOrCreateImportCompany). La oferta resultante es una
// JobPosting normal: aparece en el mismo listado, se puede editar/cerrar
// igual que cualquier otra.
export async function POST(request: Request) {
  await requireAdmin();

  const body = await request.json();
  const parsed = jobPostingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const company = await getOrCreateImportCompany();

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
