import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Entrada liviana para poder escribir en el chat de comunidad sin pasar por
// el registro completo de trabajador/empresa: solo correo + alias, sin
// contraseña que la persona tenga que elegir o recordar. Por dentro sigue
// creando una cuenta real (mismo modelo User, misma sesión de Auth.js) para
// no duplicar la lógica de moderación/bloqueo/sesión -- la "contraseña" es
// un valor aleatorio generado en el cliente que la persona nunca ve ni
// necesita volver a escribir.
//
// El correo NO se verifica (no hay envío de correos en la app). Eso significa
// que cualquiera puede escribir cualquier correo, incluido uno inventado --
// por eso, si el correo ya tiene una cuenta real registrada, se rechaza acá
// mismo (nunca se deja "tomar" una cuenta existente sin su contraseña real).
const schema = z.object({
  email: z.string().email("Correo inválido"),
  alias: z.string().min(1, "Elegí un alias").max(40, "Máximo 40 caracteres"),
  password: z.string().min(20),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { allowed } = await checkRateLimit(
    `acceso-rapido:${getClientIp(request)}`,
    10,
    60 * 60 * 1000
  );
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Probá de nuevo más tarde." },
      { status: 429 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json(
      { error: "Ese correo ya tiene una cuenta. Iniciá sesión normalmente para usarlo." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: { email, passwordHash, role: "WORKER", chatAlias: parsed.data.alias.trim() },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
