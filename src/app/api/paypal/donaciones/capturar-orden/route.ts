import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { capturePaypalOrder } from "@/lib/paypal";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const orderId = String(body.orderId || "");
  if (!orderId) {
    return NextResponse.json({ error: "Falta el identificador de la orden" }, { status: 400 });
  }

  const donation = await prisma.donation.findUnique({ where: { paypalOrderId: orderId } });
  if (!donation) {
    return NextResponse.json({ error: "No se encontró esa donación" }, { status: 404 });
  }
  // Ya se confirmó antes (ej. doble clic) -- devolvemos éxito sin volver a
  // capturar, PayPal rechaza capturar dos veces la misma orden.
  if (donation.status === "COMPLETADA") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  try {
    const result = await capturePaypalOrder(orderId);
    if (result.status !== "COMPLETED") {
      await prisma.donation.update({ where: { paypalOrderId: orderId }, data: { status: "FALLIDA" } });
      return NextResponse.json({ error: "El pago no se completó" }, { status: 502 });
    }
    await prisma.donation.update({
      where: { paypalOrderId: orderId },
      data: { status: "COMPLETADA", completedAt: new Date(), payerEmail: result.payer?.email_address },
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    await prisma.donation.update({ where: { paypalOrderId: orderId }, data: { status: "FALLIDA" } }).catch(() => undefined);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo confirmar el pago" },
      { status: 502 }
    );
  }
}
