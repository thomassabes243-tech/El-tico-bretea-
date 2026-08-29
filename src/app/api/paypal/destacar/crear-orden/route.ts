import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPaypalOrder } from "@/lib/paypal";
import { FEATURED_PRICE_USD, FEATURED_DAYS } from "@/lib/constants";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Iniciá sesión con una cuenta de empresa" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const jobPostingId = String(body.jobPostingId || "");

  const jobPosting = await prisma.jobPosting.findUnique({
    where: { id: jobPostingId },
    include: { company: true },
  });
  if (!jobPosting || jobPosting.company.userId !== session.user.id) {
    return NextResponse.json({ error: "Vacante no encontrada" }, { status: 404 });
  }

  try {
    const paypalOrderId = await createPaypalOrder(
      FEATURED_PRICE_USD,
      "USD",
      `Destacar oferta: ${jobPosting.title}`
    );
    await prisma.featuredPurchase.create({
      data: {
        jobPostingId,
        amountCents: Math.round(FEATURED_PRICE_USD * 100),
        days: FEATURED_DAYS,
        paypalOrderId,
      },
    });
    return NextResponse.json({ orderId: paypalOrderId }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo iniciar el pago" },
      { status: 502 }
    );
  }
}
