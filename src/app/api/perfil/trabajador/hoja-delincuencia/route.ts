import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_UPLOAD_BYTES } from "@/lib/chat-limits";
import { saveCriminalRecordImage, deleteCriminalRecordImage, readCriminalRecordImage } from "@/lib/storage";

// Documento privado y sensible (Sección 4 del pedido del producto): solo el
// propio trabajador puede subirlo, verlo o borrarlo. Nunca se expone en el
// perfil público ni a otras cuentas — solo se incluye en el CV en PDF si el
// propio trabajador lo elige al momento de descargar.

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
    select: { criminalRecordKey: true },
  });
  if (!worker?.criminalRecordKey) {
    return NextResponse.json({ error: "No hay ningún documento subido" }, { status: 404 });
  }

  try {
    const bytes = await readCriminalRecordImage(worker.criminalRecordKey);
    return new NextResponse(new Uint8Array(bytes), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store" },
    });
  } catch {
    return NextResponse.json({ error: "Archivo no disponible" }, { status: 404 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, criminalRecordKey: true },
  });
  if (!worker) {
    return NextResponse.json({ error: "Completá tu perfil primero" }, { status: 400 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Adjuntá una imagen" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Solo se permiten imágenes (foto o escaneo del documento)" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "La imagen es muy grande (máx. 8MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let key: string;
  try {
    key = await saveCriminalRecordImage(worker.id, buffer);
  } catch {
    return NextResponse.json({ error: "No se pudo procesar la imagen" }, { status: 400 });
  }

  await prisma.workerProfile.update({
    where: { id: worker.id },
    data: { criminalRecordKey: key, criminalRecordUploadedAt: new Date() },
  });

  return NextResponse.json({ ok: true, uploadedAt: new Date().toISOString() }, { status: 201 });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, criminalRecordKey: true },
  });
  if (!worker) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  if (worker.criminalRecordKey) {
    await deleteCriminalRecordImage(worker.criminalRecordKey).catch(() => undefined);
  }

  await prisma.workerProfile.update({
    where: { id: worker.id },
    data: { criminalRecordKey: null, criminalRecordUploadedAt: null },
  });

  return NextResponse.json({ ok: true });
}
