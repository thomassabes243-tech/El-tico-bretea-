import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { workerRegistrationSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { textOrDefault, enumOrDefault, numberOrDefault } from "@/lib/form-defaults";

export async function POST(request: Request) {
  const { allowed } = await checkRateLimit(`registro:${getClientIp(request)}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos de registro. Probá de nuevo más tarde." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = workerRegistrationSchema.safeParse(body);

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
      role: "WORKER",
      workerProfile: {
        create: {
          fullName: textOrDefault(data.fullName),
          formalPhotoUrl: data.formalPhotoUrl || null,
          age: numberOrDefault(data.age),
          residence: textOrDefault(data.residence),
          phone: data.phone || null,
          whatsapp: data.whatsapp || null,
          email,
          profession: textOrDefault(data.profession),
          laborCategory: enumOrDefault(data.laborCategory),
          yearsExperience: numberOrDefault(data.yearsExperience),
          workExperience: data.workExperience || null,
          companiesWorkedAt: data.companiesWorkedAt || null,
          previousPositions: data.previousPositions || null,
          education: data.education || null,
          degrees: data.degrees || null,
          courses: data.courses || null,
          certifications: data.certifications || null,
          skills: data.skills || null,
          languages: data.languages || null,
          availability: enumOrDefault(data.availability),
          willingToRelocate: data.willingToRelocate,
          jobTypeSought: enumOrDefault(data.jobTypeSought),
          salaryExpectation: data.salaryExpectation || null,
          references: {
            create: (data.references ?? [])
              .filter((r) => r.name && r.company)
              .map((r) => ({
                name: r.name,
                company: r.company,
                phone: r.phone || null,
                email: r.email || null,
              })),
          },
        },
      },
    },
    select: { id: true, email: true },
  });

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
