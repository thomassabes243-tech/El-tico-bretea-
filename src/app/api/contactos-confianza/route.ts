import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { trustedContactSchema } from "@/lib/validations";

const MAX_TRUSTED_CONTACTS = 5;

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const contacts = await prisma.trustedContact.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ contacts });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const count = await prisma.trustedContact.count({ where: { userId: session.user.id } });
  if (count >= MAX_TRUSTED_CONTACTS) {
    return NextResponse.json(
      { error: `Máximo ${MAX_TRUSTED_CONTACTS} contactos de confianza` },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsed = trustedContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const contact = await prisma.trustedContact.create({
    data: { userId: session.user.id, name: parsed.data.name, phone: parsed.data.phone },
  });

  return NextResponse.json({ contact }, { status: 201 });
}
