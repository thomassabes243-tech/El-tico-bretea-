import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPaypalOrder } from "@/lib/paypal";

// Monto libre, pero con un piso y un techo razonables -- evita órdenes de
// $0 (inútiles) o typos con demasiados ceros que después haya que reversar.
const MIN_PESOS = 10;
const MAX_PESOS = 50000;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const amountPesos = Math.round(Number(body.amountPesos));

  if (!Number.isFinite(amountPesos) || amountPesos < MIN_PESOS || amountPesos > MAX_PESOS) {
    return NextResponse.json(
      { error: `El monto debe ser entre $${MIN_PESOS} y $${MAX_PESOS} pesos` },
      { status: 400 }
    );
  }

  try {
    const paypalOrderId = await createPaypalOrder(amountPesos, "Donación a El Mexa Chamba");
    await prisma.donation.create({ data: { amountPesos, paypalOrderId } });
    return NextResponse.json({ orderId: paypalOrderId }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo iniciar el pago" },
      { status: 502 }
    );
  }
}
