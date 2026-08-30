import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_UPLOAD_BYTES } from "@/lib/chat-limits";
import { savePortfolioDoc, deletePortfolioDoc, StorageNotConfiguredError } from "@/lib/storage";
import { canOfferServices } from "@/lib/company-profile";

// Documento de portafolio (Cotizaciones): PDF opcional además de los campos
// estructurados del perfil de servicios -- ver ServiceProfileForm. Público
// una vez subido (se sirve sin sesión en portafolio-doc/publico/[id]),
// pero solo la propia empresa puede subirlo o borrarlo.

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || !canOfferServices(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!company) {
    return NextResponse.json({ error: "Completá tu perfil de empresa primero" }, { status: 400 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Adjuntá un archivo" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Solo se permiten archivos PDF" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "El archivo es muy grande (máx. 8MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // file.type es un Content-Type que declara el propio navegador del
  // cliente, no algo que el servidor verifique -- cualquiera puede subir un
  // archivo arbitrario con ese header falseado. A diferencia de las fotos
  // (que sharp recomprime y por lo tanto valida como imagen real), este PDF
  // se guarda tal cual, así que hace falta este chequeo de la firma real del
  // archivo (%PDF-) antes de aceptarlo.
  if (buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return NextResponse.json({ error: "El archivo no es un PDF válido" }, { status: 400 });
  }

  let key: string;
  try {
    key = await savePortfolioDoc(company.id, buffer);
  } catch (err) {
    console.error("[portafolio-doc] No se pudo guardar el PDF:", err);
    if (err instanceof StorageNotConfiguredError) {
      return NextResponse.json(
        { error: "Subir documentos todavía no está disponible en este servidor. Avisale al administrador." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "No se pudo procesar el archivo" }, { status: 400 });
  }

  await prisma.companyProfile.update({
    where: { id: company.id },
    data: { servicePortfolioDocKey: key, servicePortfolioDocName: file.name.slice(0, 200) },
  });

  return NextResponse.json({ ok: true, name: file.name }, { status: 201 });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user || !canOfferServices(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!company) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  if (company.servicePortfolioDocKey) {
    await deletePortfolioDoc(company.servicePortfolioDocKey).catch(() => undefined);
  }

  await prisma.companyProfile.update({
    where: { id: company.id },
    data: { servicePortfolioDocKey: null, servicePortfolioDocName: null },
  });

  return NextResponse.json({ ok: true });
}
