import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";
import { isLoginRateLimited, recordFailedLogin, clearLoginRateLimit } from "@/lib/rate-limit";
import { PASSWORD_RESET_CODE_TTL_MS, PASSWORD_RESET_MAX_ATTEMPTS } from "@/lib/constants";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();
  const rateLimitKey = `restablecer-password:${email}`;

  if (await isLoginRateLimited(rateLimitKey, PASSWORD_RESET_MAX_ATTEMPTS)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Pedí un código nuevo más tarde." },
      { status: 429 }
    );
  }

  const genericError = { error: "Código incorrecto o vencido" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await recordFailedLogin(rateLimitKey, PASSWORD_RESET_CODE_TTL_MS);
    return NextResponse.json(genericError, { status: 400 });
  }

  const candidates = await prisma.passwordResetCode.findMany({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  let matched: (typeof candidates)[number] | null = null;
  for (const candidate of candidates) {
    if (await bcrypt.compare(parsed.data.code, candidate.codeHash)) {
      matched = candidate;
      break;
    }
  }

  if (!matched) {
    await recordFailedLogin(rateLimitKey, PASSWORD_RESET_CODE_TTL_MS);
    return NextResponse.json(genericError, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.passwordResetCode.update({ where: { id: matched.id }, data: { usedAt: new Date() } }),
  ]);
  await clearLoginRateLimit(rateLimitKey);
  // También limpia cualquier bloqueo de login previo -- la persona acaba de
  // probar de sobra que es dueña de la cuenta.
  await clearLoginRateLimit(`login:${email}`);

  return NextResponse.json({ ok: true });
}
