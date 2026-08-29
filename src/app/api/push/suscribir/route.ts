import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!company?.professionalPlanActive) {
    return NextResponse.json({ error: "Necesitás el Plan Profesional activo" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const { endpoint, keys } = body || {};
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { companyId: company.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    update: { companyId: company.id, p256dh: keys.p256dh, auth: keys.auth },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
