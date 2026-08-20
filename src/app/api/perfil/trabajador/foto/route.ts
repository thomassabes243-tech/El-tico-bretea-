import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_UPLOAD_BYTES } from "@/lib/chat-limits";
import { saveProfilePhoto, deleteProfilePhoto, StorageNotConfiguredError } from "@/lib/storage";

// Foto de perfil del trabajador: se sube desde el teléfono (cámara o
// galería), no se pega un link. Se sirve públicamente en /api/fotos/trabajador/[id]
// -- distinto de la hoja de delincuencia, que es privada.

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!worker) {
    return NextResponse.json({ error: "Completá tu perfil primero" }, { status: 400 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Adjuntá una foto" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "La imagen es muy grande (máx. 8MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await saveProfilePhoto("worker", worker.id, buffer);
  } catch (err) {
    console.error("[perfil/trabajador/foto] No se pudo guardar la imagen:", err);
    if (err instanceof StorageNotConfiguredError) {
      return NextResponse.json(
        { error: "Subir fotos todavía no está disponible en este servidor. Avisale al administrador." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "No se pudo procesar la imagen" }, { status: 400 });
  }

  const url = `/api/fotos/trabajador/${worker.id}?v=${Date.now()}`;
  await prisma.workerProfile.update({ where: { id: worker.id }, data: { formalPhotoUrl: url } });

  return NextResponse.json({ ok: true, url }, { status: 201 });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!worker) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  await deleteProfilePhoto("worker", worker.id).catch(() => undefined);
  await prisma.workerProfile.update({ where: { id: worker.id }, data: { formalPhotoUrl: null } });

  return NextResponse.json({ ok: true });
}
