import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendLoginCodeEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Ingresá un correo válido" }, { status: 400 });
  }

  const { allowed } = await checkRateLimit(`passwordless-code:${email}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Pediste varios códigos. Esperá un rato para volver a intentar." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.isBlocked) {
    const code = String(randomInt(100000, 1000000));
    const codeHash = await bcrypt.hash(code, 10);
    await prisma.passwordlessCode.create({
      data: { userId: user.id, codeHash, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    });
    try {
      const sent = await sendLoginCodeEmail(email, code);
      if (!sent) return NextResponse.json({ error: "El correo de acceso todavía no está configurado." }, { status: 503 });
    } catch {
      return NextResponse.json({ error: "No se pudo enviar el código. Intentá nuevamente más tarde." }, { status: 503 });
    }
  }

  // La misma respuesta exista o no la cuenta evita revelar correos registrados.
  return NextResponse.json({ ok: true });
}

