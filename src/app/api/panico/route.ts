import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { panicAlertSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { detectIpLocationMismatch } from "@/lib/safety";

// Botón de pánico: dispara una alerta inmediata, no un check-in con plazo.
// Aviso legal explícito en el flujo (ver /perfil o donde se monte el botón):
// esto es apoyo entre personas, no un servicio de emergencia -- para
// peligro real hay que llamar al 911.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "WORKER") {
    return NextResponse.json({ error: "Solo trabajadores pueden usar el botón de pánico" }, { status: 403 });
  }

  const { allowed } = await checkRateLimit(`panico:${session.user.id}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Demasiadas alertas en poco tiempo" }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = panicAlertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (parsed.data.trustedContactId) {
    const contact = await prisma.trustedContact.findUnique({
      where: { id: parsed.data.trustedContactId },
    });
    if (!contact || contact.userId !== session.user.id) {
      return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
    }
  }

  const suspicionReason =
    parsed.data.latitude != null && parsed.data.longitude != null
      ? detectIpLocationMismatch(request, { latitude: parsed.data.latitude, longitude: parsed.data.longitude })
      : null;

  const alert = await prisma.panicAlert.create({
    data: {
      workerId: session.user.id,
      trustedContactId: parsed.data.trustedContactId,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      note: parsed.data.note || null,
      suspicious: Boolean(suspicionReason),
      suspicionReason,
    },
  });

  return NextResponse.json({ id: alert.id, shareToken: alert.shareToken }, { status: 201 });
}
