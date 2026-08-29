import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPaypalSubscription } from "@/lib/paypal";
import { canOfferServices } from "@/lib/company-profile";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !canOfferServices(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const subscriptionId = String(body.subscriptionId || "");
  if (!subscriptionId) {
    return NextResponse.json({ error: "Falta el identificador de la suscripción" }, { status: 400 });
  }

  try {
    const subscription = await getPaypalSubscription(subscriptionId);
    if (subscription.status !== "ACTIVE") {
      return NextResponse.json({ error: "La suscripción no está activa" }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo verificar la suscripción" },
      { status: 502 }
    );
  }

  await prisma.companyProfile.update({
    where: { userId: session.user.id },
    data: { professionalPlanActive: true, paypalSubscriptionId: subscriptionId },
  });

  return NextResponse.json({ ok: true });
}
