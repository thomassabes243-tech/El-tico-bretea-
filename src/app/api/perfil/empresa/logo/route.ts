import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_UPLOAD_BYTES } from "@/lib/chat-limits";
import { saveProfilePhoto, deleteProfilePhoto, StorageNotConfiguredError } from "@/lib/storage";
import { canOfferServices } from "@/lib/company-profile";

// Logo de la empresa: se sube desde el teléfono (cámara o galería), no se
// pega un link. Se sirve públicamente en /api/fotos/empresa/[id].

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !canOfferServices(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Completá tu perfil primero" }, { status: 400 });
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
    await saveProfilePhoto("company", company.id, buffer);
  } catch (err) {
    console.error("[perfil/empresa/logo] No se pudo guardar la imagen:", err);
    if (err instanceof StorageNotConfiguredError) {
      return NextResponse.json(
        { error: "Subir imágenes todavía no está disponible en este servidor. Avisale al administrador." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "No se pudo procesar la imagen" }, { status: 400 });
  }

  const url = `/api/fotos/empresa/${company.id}?v=${Date.now()}`;
  await prisma.companyProfile.update({ where: { id: company.id }, data: { logoUrl: url } });

  return NextResponse.json({ ok: true, url }, { status: 201 });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user || !canOfferServices(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const company = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!company) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  await deleteProfilePhoto("company", company.id).catch(() => undefined);
  await prisma.companyProfile.update({ where: { id: company.id }, data: { logoUrl: null } });

  return NextResponse.json({ ok: true });
}
