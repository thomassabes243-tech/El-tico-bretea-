import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiAnalyzeJobPosting, AiNotConfiguredError } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Iniciá sesión para analizar una oferta" }, { status: 401 });
  }

  const { allowed } = await checkRateLimit(`ai-oferta:${session.user.id}`, 20, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Probaste varias veces seguidas. Esperá un rato." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const jobPostingId = typeof body.jobPostingId === "string" ? body.jobPostingId : "";
  if (!jobPostingId) {
    return NextResponse.json({ error: "Falta la oferta a analizar" }, { status: 400 });
  }

  const jobPosting = await prisma.jobPosting.findUnique({
    where: { id: jobPostingId },
    include: { company: { select: { isVerified: true } } },
  });
  if (!jobPosting) {
    return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
  }

  try {
    const analysis = await aiAnalyzeJobPosting({
      title: jobPosting.title,
      description: jobPosting.description,
      salary: jobPosting.salary,
      location: jobPosting.location,
      whatsapp: jobPosting.whatsapp,
      contactEmail: jobPosting.contactEmail,
      companyVerified: jobPosting.company.isVerified,
    });
    return NextResponse.json({ analysis });
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo analizar la oferta" },
      { status: 502 }
    );
  }
}
