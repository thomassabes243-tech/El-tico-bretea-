"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function assignModerator(formData: FormData) {
  await requireAdmin();

  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const chatRoomId = String(formData.get("chatRoomId") || "");

  if (!email || !chatRoomId) {
    throw new Error("Correo y sala son requeridos");
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    if (password.length < 8) {
      throw new Error("Para crear una cuenta nueva de moderador, la contraseña debe tener al menos 8 caracteres");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    user = await prisma.user.create({ data: { email, passwordHash, role: "MODERATOR" } });
  } else if (user.role !== "MODERATOR") {
    throw new Error(
      "Ese correo ya tiene una cuenta de otro tipo (trabajador/empresa/admin). Usá un correo nuevo para el moderador."
    );
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
}

export async function removeModeratorAssignment(assignmentId: string) {
  await requireAdmin();
  await prisma.moderatorAssignment.delete({ where: { id: assignmentId } }).catch(() => undefined);
  revalidatePath("/admin/moderadores");
}
