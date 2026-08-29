import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_UPLOAD_BYTES } from "@/lib/chat-limits";
import { savePortfolioPhoto, StorageNotConfiguredError } from "@/lib/storage";
import { canOfferServices } from "@/lib/company-profile";

// Tope de fotos de portafolio por perfil -- suficiente para mostrar trabajos
// realizados sin que la galería se vuelva infinita.
const MAX_PORTFOLIO_PHOTOS = 8;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !canOfferServices(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, _count: { select: { portfolioPhotos: true } } },
  });
  if (!company) {
    return NextResponse.json({ error: "Completá tu perfil de empresa primero" }, { status: 400 });
  }
  if (company._count.portfolioPhotos >= MAX_PORTFOLIO_PHOTOS) {
    return NextResponse.json(
      { error: `Máximo ${MAX_PORTFOLIO_PHOTOS} fotos de portafolio` },
      { status: 400 }
    );
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Adjuntá una imagen" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "La imagen es muy grande (máx. 8MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const saved = await savePortfolioPhoto(buffer);
    const photo = await prisma.portfolioPhoto.create({
      data: {
        companyId: company.id,
        storageKey: saved.key,
        mimeType: saved.mimeType,
        sizeBytes: saved.sizeBytes,
      },
    });
    return NextResponse.json(
      { ok: true, photo: { id: photo.id, url: `/api/fotos/portafolio/${photo.id}` } },
      { status: 201 }
    );
  } catch (err) {
    console.error("[perfil/empresa/portafolio] No se pudo guardar la imagen:", err);
    if (err instanceof StorageNotConfiguredError) {
      return NextResponse.json(
        { error: "Subir imágenes todavía no está disponible en este servidor. Avisale al administrador." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "No se pudo procesar la imagen" }, { status: 400 });
  }
}
