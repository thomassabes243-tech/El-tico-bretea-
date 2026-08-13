import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCvPdfBuffer } from "@/lib/cv-pdf";

export async function GET() {
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

  const pdfBuffer = await generateCvPdfBuffer(worker);
  const fileName = `CV-${worker.fullName.replace(/[^a-zA-Z0-9]+/g, "-")}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
