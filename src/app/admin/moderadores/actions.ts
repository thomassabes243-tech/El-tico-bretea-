"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export type AssignModeratorState = { error: string | null };

// Devuelve { error } en vez de lanzar una excepción para los casos de
// validación esperables (correo de otro tipo de cuenta, contraseña corta,
// etc.). Un `throw` acá no lo captura nadie del lado del cliente porque el
// <form> llama la acción directo (sin try/catch propio) -- React lo trata
// como un error real, lo manda al error boundary más cercano y en
// producción termina mostrando el "Minified React error" genérico en vez
// del mensaje de validación. Con useActionState, el estado devuelto se
// muestra en el propio formulario sin romper el resto de la página.
export async function assignModerator(
  _prevState: AssignModeratorState,
  formData: FormData
): Promise<AssignModeratorState> {
  await requireAdmin();

  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const chatRoomId = String(formData.get("chatRoomId") || "");

  if (!email || !chatRoomId) {
    return { error: "Correo y sala son requeridos" };
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    if (password.length < 8) {
      return {
        error: "Para crear una cuenta nueva de moderador, la contraseña debe tener al menos 8 caracteres",
      };
    }
    const passwordHash = await bcrypt.hash(password, 10);
    user = await prisma.user.create({ data: { email, passwordHash, role: "MODERATOR" } });
  } else if (user.role !== "MODERATOR") {
    return {
      error:
        "Ese correo ya tiene una cuenta de otro tipo (trabajador/empresa/admin). Usá un correo nuevo para el moderador.",
    };
  }

  const moderator = await prisma.moderator.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });

  await prisma.moderatorAssignment.upsert({
    where: { moderatorId_chatRoomId: { moderatorId: moderator.id, chatRoomId } },
    create: { moderatorId: moderator.id, chatRoomId },
    update: {},
  });

  revalidatePath("/admin/moderadores");
  return { error: null };
}

export async function removeModeratorAssignment(assignmentId: string) {
  await requireAdmin();
  await prisma.moderatorAssignment.delete({ where: { id: assignmentId } }).catch(() => undefined);
  revalidatePath("/admin/moderadores");
}
