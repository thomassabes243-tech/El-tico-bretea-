import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serviceProfileSchema, serviceLocationSchema } from "@/lib/validations";
import { canOfferServices } from "@/lib/company-profile";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !canOfferServices(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = serviceProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Datos inválidos" },
      { status: 400 }
    );
  }

  const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!company) {
    return NextResponse.json({ error: "Completá tu perfil de empresa primero" }, { status: 400 });
  }

  const updated = await prisma.companyProfile.update({
    where: { id: company.id },
    data: {
      offersServices: parsed.data.offersServices,
      serviceCategories: parsed.data.serviceCategories,
      serviceZoneLabel: parsed.data.serviceZoneLabel || null,
      serviceDescription: parsed.data.serviceDescription || null,
      serviceYearsExperience: parsed.data.serviceYearsExperience ?? null,
      contactPhone: parsed.data.contactPhone || null,
    },
  });

  return NextResponse.json({ ok: true, offersServices: updated.offersServices });
}

// Ubicación base para calcular distancia real más adelante (Cotizaciones) --
// mismo patrón de navigator.geolocation que ya usan las funciones de
// seguridad, nunca se pide sin que la propia empresa lo active a mano.
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || !canOfferServices(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = serviceLocationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ubicación inválida" }, { status: 400 });
  }

  const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!company) {
    return NextResponse.json({ error: "Completá tu perfil de empresa primero" }, { status: 400 });
  }

  await prisma.companyProfile.update({
    where: { id: company.id },
    data: { serviceLatitude: parsed.data.latitude, serviceLongitude: parsed.data.longitude },
  });

  return NextResponse.json({ ok: true });
}
