import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelPaypalSubscription } from "@/lib/paypal";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const worker = await prisma.workerProfile.findUnique({ where: { userId: session.user.id } });
  if (!worker?.paypalSubscriptionId) {
    return NextResponse.json({ error: "No tenés una suscripción activa" }, { status: 400 });
  }

  await cancelPaypalSubscription(worker.paypalSubscriptionId, "Cancelado por el usuario").catch(() => undefined);
  await prisma.workerProfile.update({
    where: { userId: session.user.id },
    data: { isPremium: false, paypalSubscriptionId: null },
  });

  return NextResponse.json({ ok: true });
}
