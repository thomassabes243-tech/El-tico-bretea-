import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readPortfolioPhoto } from "@/lib/storage";

// Pública a propósito, igual que el logo/foto de perfil -- se muestra en el
// perfil de servicios del profesional, que cualquiera puede ver sin cuenta.

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = await prisma.portfolioPhoto.findUnique({ where: { id }, select: { storageKey: true } });
  if (!photo) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  try {
    const bytes = await readPortfolioPhoto(photo.storageKey);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }
}
