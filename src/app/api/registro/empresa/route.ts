import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { companyRegistrationSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const { allowed } = checkRateLimit(`registro:${getClientIp(request)}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos de registro. Probá de nuevo más tarde." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = companyRegistrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const email = data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con ese correo" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: "COMPANY",
      companyProfile: {
        create: {
          commercialName: data.commercialName,
          legalId: data.legalId,
          responsibleName: data.responsibleName,
          contactPhone: data.contactPhone,
          contactEmail: data.contactEmail,
          location: data.location,
          activity: data.activity,
          logoUrl: data.logoUrl || null,
          description: data.description || null,
        },
      },
    },
    select: { id: true, email: true },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
