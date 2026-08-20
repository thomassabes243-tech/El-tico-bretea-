"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export type AssignModeratorState = { error: string | null };

export type ModeratorSearchResult = {
  id: string;
  email: string;
  role: "WORKER" | "COMPANY" | "MODERATOR";
  displayName: string | null;
};

// Busca cuentas YA existentes (trabajador, empresa o moderador) por correo
// o nombre, para asignarlas como moderadoras sin tocar su rol -- una
// persona sigue siendo trabajador/empresa como siempre, y además puede
// moderar las salas que se le asignen (la tabla Moderator es un extra
// sobre la cuenta, no reemplaza su rol).
export async function searchAssignableUsers(query: string): Promise<ModeratorSearchResult[]> {
  await requireAdmin();

  const q = query.trim();
  if (q.length < 2) return [];

  const users = await prisma.user.findMany({
    where: {
      role: { in: ["WORKER", "COMPANY", "MODERATOR"] },
      OR: [
        { email: { contains: q, mode: "insensitive" } },
        { workerProfile: { fullName: { contains: q, mode: "insensitive" } } },
        { companyProfile: { commercialName: { contains: q, mode: "insensitive" } } },
      ],
    },
    include: {
      workerProfile: { select: { fullName: true } },
      companyProfile: { select: { commercialName: true } },
    },
    orderBy: { email: "asc" },
    take: 8,
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role as "WORKER" | "COMPANY" | "MODERATOR",
    displayName: u.workerProfile?.fullName ?? u.companyProfile?.commercialName ?? null,
  }));
}

// Asigna como moderadora a una cuenta que YA existe en la app (encontrada
// con searchAssignableUsers) -- no crea nada, no toca el rol ni la
// contraseña, solo agrega la capacidad de moderar la sala elegida.
export async function assignExistingUserAsModerator(
  userId: string,
  chatRoomId: string
): Promise<AssignModeratorState> {
  await requireAdmin();

  if (!userId || !chatRoomId) {
    return { error: "Elegí una persona y una sala" };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { error: "Esa cuenta ya no existe" };
  }
  if (user.role === "ADMIN") {
    return { error: "Un administrador ya puede moderar cualquier sala, no hace falta asignarlo" };
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
        "Esa cuenta ya existe en la app -- usá el buscador de arriba para encontrarla y asignarla directo, no hace falta crear una cuenta nueva.",
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
