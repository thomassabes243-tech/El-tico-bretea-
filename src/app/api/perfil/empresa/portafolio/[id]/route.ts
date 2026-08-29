import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deletePortfolioPhoto } from "@/lib/storage";
import { canOfferServices } from "@/lib/company-profile";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !canOfferServices(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const photo = await prisma.portfolioPhoto.findUnique({
    where: { id },
    include: { company: { select: { userId: true } } },
  });
  if (!photo || photo.company.userId !== session.user.id) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  await deletePortfolioPhoto(photo.storageKey).catch(() => undefined);
  await prisma.portfolioPhoto.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
