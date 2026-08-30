import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canOfferServices } from "@/lib/company-profile";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !canOfferServices(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const endpoint = String(body.endpoint || "");
  if (!endpoint) {
    return NextResponse.json({ error: "Falta el endpoint" }, { status: 400 });
  }

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  // Scoped a companyId, no solo al endpoint: sin esto, cualquier cuenta
  // logueada podía borrar la suscripción push de OTRA empresa con solo
  // conocer su endpoint (nunca se valida que sea la propia).
  await prisma.pushSubscription.deleteMany({ where: { endpoint, companyId: company.id } });
  return NextResponse.json({ ok: true });
}
