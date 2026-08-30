import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiImproveCv, AiNotConfiguredError } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { allowed } = await checkRateLimit(`ai-cv:${session.user.id}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Probaste varias veces seguidas. Esperá un rato." }, { status: 429 });
  }

  const worker = await prisma.workerProfile.findUnique({ where: { userId: session.user.id } });
  if (!worker) {
    return NextResponse.json({ error: "Completá tu perfil primero" }, { status: 400 });
  }

  try {
    const suggestions = await aiImproveCv(worker);
    return NextResponse.json({ suggestions });
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "No se pudo generar sugerencias" },
      { status: 502 }
    );
  }
}
