import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { locationShareSchema } from "@/lib/validations";
import { detectSuspiciousLocation, detectIpLocationMismatch } from "@/lib/safety";

const SHARE_DURATION_MS = 6 * 60 * 60 * 1000; // 6h, similar a "compartir viaje"

// Comparte la ubicación en tiempo real con un contacto de confianza -- nunca
// con la empresa. Solo el trabajador que la creó ve/administra el registro;
// el contacto la ve a través del link de solo lectura (shareToken), sin login.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return NextResponse.json({ error: "Solo trabajadores pueden compartir ubicación" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = locationShareSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const contact = await prisma.trustedContact.findUnique({
    where: { id: parsed.data.trustedContactId },
  });
  if (!contact || contact.userId !== session.user.id) {
    return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
  }

  const suspicionReason =
    (await detectSuspiciousLocation(session.user.id, {
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      accuracy: parsed.data.accuracy,
    })) ?? detectIpLocationMismatch(request, parsed.data);

  const share = await prisma.locationShare.create({
    data: {
      workerId: session.user.id,
      trustedContactId: parsed.data.trustedContactId,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      accuracy: parsed.data.accuracy,
      suspicious: Boolean(suspicionReason),
      suspicionReason,
      expiresAt: new Date(Date.now() + SHARE_DURATION_MS),
    },
  });

  return NextResponse.json({ id: share.id, shareToken: share.shareToken }, { status: 201 });
}
