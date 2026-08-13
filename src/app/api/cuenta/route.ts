import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  if (body.confirm !== "ELIMINAR") {
    return NextResponse.json({ error: "Confirmación inválida" }, { status: 400 });
  }

  // El borrado de User arrastra en cascada perfil, vacantes, aplicaciones,
  // mensajes de chat, archivos, bloqueos y asignaciones de moderación —
  // definido así en el schema (onDelete: Cascade).
  await prisma.user.delete({ where: { id: session.user.id } });

  return NextResponse.json({ ok: true });
}
