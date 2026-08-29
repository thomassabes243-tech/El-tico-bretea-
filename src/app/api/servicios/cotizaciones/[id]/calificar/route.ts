import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serviceReviewSchema } from "@/lib/validations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = serviceReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Datos inválidos" },
      { status: 400 }
    );
  }

  const quote = await prisma.serviceQuote.findUnique({
    where: { id },
    include: { serviceRequest: true, review: true },
  });
  if (!quote || quote.serviceRequest.requesterId !== session.user.id) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
  if (quote.status !== "ACEPTADA") {
    return NextResponse.json({ error: "Solo se puede calificar a quien contrataste" }, { status: 400 });
  }
  if (quote.review) {
    return NextResponse.json({ error: "Ya calificaste esta cotización" }, { status: 400 });
  }

  const review = await prisma.serviceReview.create({
    data: {
      serviceQuoteId: quote.id,
      companyId: quote.companyId,
      reviewerId: session.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
  });

  return NextResponse.json({ id: review.id }, { status: 201 });
}
