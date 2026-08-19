import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scamAlertSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_ALERTS_PER_DAY = 5;
const WINDOW_MS = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Iniciá sesión para publicar una alerta" }, { status: 401 });
  }

  const { allowed } = await checkRateLimit(`scam-alert:${session.user.id}`, MAX_ALERTS_PER_DAY, WINDOW_MS);
  if (!allowed) {
    return NextResponse.json(
      { error: "Alcanzaste el máximo de alertas por día. Probá de nuevo más tarde." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsed = scamAlertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const alert = await prisma.scamAlert.create({
    data: {
      authorId: session.user.id,
      title: parsed.data.title,
      offerDescription: parsed.data.offerDescription,
      suspicionReason: parsed.data.suspicionReason,
      location: parsed.data.location || null,
      modality: parsed.data.modality,
    },
  });

  return NextResponse.json({ id: alert.id }, { status: 201 });
}
