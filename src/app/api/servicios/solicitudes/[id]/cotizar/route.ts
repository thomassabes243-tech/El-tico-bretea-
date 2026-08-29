import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serviceQuoteSchema } from "@/lib/validations";
import { PROJECT_MAX_QUOTES } from "@/lib/constants";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Iniciá sesión con una cuenta de empresa" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = serviceQuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Datos inválidos" },
      { status: 400 }
    );
  }

  const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!company || !company.offersServices) {
    return NextResponse.json({ error: "Activá 'Ofrecer servicios' en tu perfil primero" }, { status: 400 });
  }

  const serviceRequest = await prisma.serviceRequest.findUnique({
    where: { id },
    include: { _count: { select: { quotes: true } } },
  });
  if (!serviceRequest || serviceRequest.status !== "ABIERTA") {
    return NextResponse.json({ error: "Esta solicitud ya no está disponible" }, { status: 400 });
  }
  if (!company.serviceCategories.includes(serviceRequest.category)) {
    return NextResponse.json({ error: "Esta solicitud no es de una categoría que ofrecés" }, { status: 400 });
  }
  if (serviceRequest.mode === "PROYECTO" && serviceRequest._count.quotes >= PROJECT_MAX_QUOTES) {
    return NextResponse.json(
      { error: "Este proyecto ya alcanzó el máximo de cotizaciones" },
      { status: 400 }
    );
  }

  try {
    const quote = await prisma.serviceQuote.create({
      data: {
        serviceRequestId: id,
        companyId: company.id,
        priceLabel: parsed.data.priceLabel,
        availability: parsed.data.availability,
        message: parsed.data.message || null,
      },
    });
    return NextResponse.json({ id: quote.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ya enviaste una cotización para esta solicitud" }, { status: 400 });
  }
}
