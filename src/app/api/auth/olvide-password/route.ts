import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { forgotPasswordRequestSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";
import { PASSWORD_RESET_CODE_TTL_MS, PASSWORD_RESET_MAX_REQUESTS } from "@/lib/constants";

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();

  const { allowed } = await checkRateLimit(`olvide-password:${email}`, PASSWORD_RESET_MAX_REQUESTS, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Ya pediste varios códigos. Esperá un rato antes de volver a intentar." },
      { status: 429 }
    );
  }

  // Misma respuesta exista o no la cuenta -- evita que alguien use este
  // endpoint para confirmar qué correos están registrados.
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    await prisma.passwordResetCode.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_CODE_TTL_MS),
      },
    });
    const sent = await sendPasswordResetEmail(email, code);
    if (!sent) {
      return NextResponse.json(
        { error: "El envío de correos no está configurado todavía. Avisale al administrador del sitio." },
        { status: 503 }
      );
    }
  }

  return NextResponse.json({ ok: true });
}
