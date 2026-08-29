import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readPortfolioDoc } from "@/lib/storage";

// Sirve el PDF de portafolio públicamente, sin sesión -- mismo criterio que
// las fotos de portafolio: es contenido que el propio profesional decide
// mostrar en su perfil público de Cotizaciones para dar confianza.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const company = await prisma.companyProfile.findUnique({
    where: { id },
    select: { servicePortfolioDocKey: true, servicePortfolioDocName: true },
  });
  if (!company?.servicePortfolioDocKey) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  try {
    const bytes = await readPortfolioDoc(company.servicePortfolioDocKey);
    const fileName = (company.servicePortfolioDocName || "portafolio.pdf").replace(/"/g, "");
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
}
