import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { detectAndCreateJobFromMessage } from "@/lib/job-auto-detect";

// Se dispara automáticamente desde POST /api/comunidad/[category]/messages
// (ver esa ruta) cada vez que se envía un mensaje nuevo en el chat de
// Comunidad -- este endpoint también queda disponible para relanzar la
// detección a mano sobre un mensaje puntual (ej. si la API de Claude falló
// una vez y se quiere reintentar).
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const messageId = typeof body?.messageId === "string" ? body.messageId : null;
  if (!messageId) {
    return NextResponse.json({ error: "Falta messageId" }, { status: 400 });
  }

  const result = await detectAndCreateJobFromMessage(messageId);
  return NextResponse.json(result, { status: result.created ? 201 : 200 });
}
