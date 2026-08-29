import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serviceRequestSchema } from "@/lib/validations";
import { notifyCompaniesOfNewRequest } from "@/lib/push";
import { SERVICE_CATEGORIES } from "@/lib/constants";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Iniciá sesión para pedir un servicio" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = serviceRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Datos inválidos" },
      { status: 400 }
    );
  }

  const serviceRequest = await prisma.serviceRequest.create({
    data: {
      requesterId: session.user.id,
      category: parsed.data.category,
      mode: parsed.data.mode,
      description: parsed.data.description,
      locationLabel: parsed.data.locationLabel,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      budgetLabel: parsed.data.budgetLabel || null,
      contactPhone: parsed.data.contactPhone || null,
    },
  });

  // Notificación instantánea (Plan Profesional) -- solo a quien ya tiene el
  // plan activo y suscripción push guardada; el resto la ve igual al
  // entrar a la app, sin apuro. Nunca bloquea la respuesta al cliente si
  // falla (push no configurado, envío caído, etc.).
  const matchingCompanies = await prisma.companyProfile.findMany({
    where: {
      offersServices: true,
      professionalPlanActive: true,
      serviceCategories: { has: parsed.data.category },
    },
    select: { id: true },
  });
  const categoryLabel = SERVICE_CATEGORIES.find((c) => c.value === parsed.data.category)?.label ?? "";
  notifyCompaniesOfNewRequest(
    matchingCompanies.map((c) => c.id),
    {
      title: "Nueva solicitud de servicio",
      body: `${categoryLabel} en ${parsed.data.locationLabel}`,
      url: `/servicios/solicitudes/${serviceRequest.id}/cotizar`,
    }
  ).catch((err) => console.error("[servicios/solicitudes] No se pudo enviar la notificación push:", err));

  return NextResponse.json({ id: serviceRequest.id }, { status: 201 });
}
