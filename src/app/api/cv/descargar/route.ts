import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCvPdfBuffer } from "@/lib/cv-pdf";
import { readCriminalRecordImage } from "@/lib/storage";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: session.user.id },
    include: { references: true },
  });
  if (!worker) {
    return NextResponse.json({ error: "Completá tu perfil primero" }, { status: 400 });
  }

  const includeCriminalRecord =
    new URL(request.url).searchParams.get("incluirHojaDelincuencia") === "1";

  let criminalRecordImage: Buffer | undefined;
  if (includeCriminalRecord && worker.criminalRecordKey) {
    criminalRecordImage = await readCriminalRecordImage(worker.criminalRecordKey).catch(() => undefined);
  }

  const pdfBuffer = await generateCvPdfBuffer(worker, criminalRecordImage);
  const fileName = `CV-${worker.fullName.replace(/[^a-zA-Z0-9]+/g, "-")}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
