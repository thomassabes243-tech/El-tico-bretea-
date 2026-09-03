"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function toggleUserBlocked(userId: string, nextValue: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { isBlocked: nextValue } });
  revalidatePath("/admin/usuarios");
}

/**
 * Da o quita el rol de Administrador a cualquier cuenta. No hay límite de
 * cuántas cuentas pueden ser admin a la vez. Un admin no puede quitarse el
 * rol a sí mismo desde acá, para no dejar el panel sin nadie con acceso por
 * accidente -- si hace falta, tiene que hacerlo otro admin.
 *
 * Al quitar el rol, vuelve al rol que le corresponde según el perfil que ya
 * tenga (trabajador, empresa o moderador); si no tiene ninguno, vuelve a
 * trabajador por defecto.
 */
export async function toggleUserAdmin(userId: string, nextValue: boolean) {
  const session = await requireAdmin();
  if (!nextValue && userId === session.user.id) {
    throw new Error("No podés quitarte el rol de Administrador a vos mismo");
  }

  let role: "ADMIN" | "WORKER" | "COMPANY" | "MODERATOR" = "ADMIN";
  if (!nextValue) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { workerProfile: { select: { id: true } }, companyProfile: { select: { id: true } }, moderator: { select: { id: true } } },
    });
    role = user?.workerProfile
      ? "WORKER"
      : user?.companyProfile
        ? "COMPANY"
        : user?.moderator
          ? "MODERATOR"
          : "WORKER";
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/usuarios");
}

/**
 * Premium de cortesía otorgado a mano por un admin. Hasta que exista un
 * procesador de pagos conectado, esta es la única forma real de activar
 * Premium — sin esto, el flag nunca podría encenderse.
 */
export async function toggleWorkerPremium(workerId: string, nextValue: boolean) {
  await requireAdmin();
  await prisma.workerProfile.update({ where: { id: workerId }, data: { isPremium: nextValue } });
  revalidatePath("/admin/usuarios");
}

/**
 * No hay flujo de "recuperar contraseña" por correo (la app no tiene un
 * proveedor de email configurado) -- en su lugar, el admin genera una
 * contraseña nueva acá y se la pasa a la persona por fuera de la app
 * (WhatsApp, en persona, etc). Se devuelve en texto plano UNA sola vez, en
 * la respuesta de esta acción; nunca se guarda en ningún lado.
 */
export async function resetUserPassword(userId: string): Promise<string> {
  await requireAdmin();
  const newPassword = randomUUID().slice(0, 8);
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return newPassword;
}
