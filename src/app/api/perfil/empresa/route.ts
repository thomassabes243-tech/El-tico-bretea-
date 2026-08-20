import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { companyProfileUpdateSchema } from "@/lib/validations";
import { textOrDefault } from "@/lib/form-defaults";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = companyProfileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, legalId: true, isVerified: true, contactEmail: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  const data = parsed.data;
  const newLegalId = textOrDefault(data.legalId);
  const legalIdChanged = newLegalId !== company.legalId;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { chatAlias: data.chatAlias || null },
    }),
    prisma.companyProfile.update({
      where: { id: company.id },
      data: {
        commercialName: textOrDefault(data.commercialName),
        legalId: newLegalId,
        responsibleName: textOrDefault(data.responsibleName),
        contactPhone: data.contactPhone || null,
        contactEmail: data.contactEmail || company.contactEmail,
        location: textOrDefault(data.location),
        activity: textOrDefault(data.activity),
        logoUrl: data.logoUrl || null,
        description: data.description || null,
        // Cambiar la identificación legal invalida una verificación previa: estaba
        // atada a esos datos específicos y debe revisarse de nuevo.
        ...(legalIdChanged && company.isVerified ? { isVerified: false, verifiedAt: null } : {}),
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
