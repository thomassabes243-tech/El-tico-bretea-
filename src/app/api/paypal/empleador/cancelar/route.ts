import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelPaypalSubscription } from "@/lib/paypal";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!company?.employerPaypalSubscriptionId) {
    return NextResponse.json({ error: "No tenés una suscripción activa" }, { status: 400 });
  }

  await cancelPaypalSubscription(company.employerPaypalSubscriptionId, "Cancelado por el usuario").catch(() => undefined);
  await prisma.companyProfile.update({
    where: { userId: session.user.id },
    data: { employerPlanActive: false, employerPaypalSubscriptionId: null },
  });

  return NextResponse.json({ ok: true });
}
