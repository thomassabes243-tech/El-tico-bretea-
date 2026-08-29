import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { capturePaypalOrder } from "@/lib/paypal";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Iniciá sesión con una cuenta de empresa" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const orderId = String(body.orderId || "");
  if (!orderId) {
    return NextResponse.json({ error: "Falta el identificador de la orden" }, { status: 400 });
  }

  const purchase = await prisma.featuredPurchase.findUnique({
    where: { paypalOrderId: orderId },
    include: { jobPosting: { include: { company: true } } },
  });
  if (!purchase || purchase.jobPosting.company.userId !== session.user.id) {
    return NextResponse.json({ error: "No se encontró esa compra" }, { status: 404 });
  }
  if (purchase.status === "COMPLETADA") {
    return NextResponse.json({ ok: true, featuredUntil: purchase.jobPosting.featuredUntil }, { status: 200 });
  }

  try {
    const result = await capturePaypalOrder(orderId);
    if (result.status !== "COMPLETED") {
      await prisma.featuredPurchase.update({ where: { paypalOrderId: orderId }, data: { status: "FALLIDA" } });
      return NextResponse.json({ error: "El pago no se completó" }, { status: 502 });
    }

    // Si ya estaba destacada (compró de nuevo antes de que venza), suma los
    // días al vencimiento actual en vez de reiniciar el conteo.
    const base =
      purchase.jobPosting.featuredUntil && purchase.jobPosting.featuredUntil > new Date()
        ? purchase.jobPosting.featuredUntil
        : new Date();
    const featuredUntil = new Date(base.getTime() + purchase.days * 24 * 60 * 60 * 1000);

    const [, updatedJob] = await prisma.$transaction([
      prisma.featuredPurchase.update({
        where: { paypalOrderId: orderId },
        data: { status: "COMPLETADA", completedAt: new Date(), payerEmail: result.payer?.email_address },
      }),
      prisma.jobPosting.update({ where: { id: purchase.jobPostingId }, data: { featuredUntil } }),
    ]);

    return NextResponse.json({ ok: true, featuredUntil: updatedJob.featuredUntil }, { status: 200 });
  } catch (err) {
    await prisma.featuredPurchase.update({ where: { paypalOrderId: orderId }, data: { status: "FALLIDA" } }).catch(() => undefined);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo confirmar el pago" },
      { status: 502 }
    );
  }
}
