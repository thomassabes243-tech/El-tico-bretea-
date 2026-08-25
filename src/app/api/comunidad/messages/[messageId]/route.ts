import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCommunityChatRoom } from "@/lib/chat-rooms";
import { deleteChatImage } from "@/lib/storage";

async function requireModeratorForRoom(userId: string, chatRoomId: string) {
  const moderator = await prisma.moderator.findUnique({ where: { userId } });
  if (!moderator) return false;
  const assignment = await prisma.moderatorAssignment.findUnique({
    where: { moderatorId_chatRoomId: { moderatorId: moderator.id, chatRoomId } },
  });
  return Boolean(assignment);
}

// Un mensaje (texto, foto o vacante compartida) lo puede borrar su propio
// autor, o un moderador asignado a esa sala (salvo que el autor sea otro
// moderador -- misma regla que bloquear autores). Borrar también elimina
// las fotos asociadas del almacenamiento (no solo la referencia en la BD).
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { messageId } = await params;
  const room = await getCommunityChatRoom();

  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: {
      files: { select: { storageKey: true } },
      author: { select: { role: true } },
    },
  });
  if (!message || message.chatRoomId !== room.id) {
    return NextResponse.json({ error: "Mensaje no encontrado" }, { status: 404 });
  }

  const isOwn = message.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  const isModerator =
    !isOwn &&
    !isAdmin &&
    message.author.role !== "MODERATOR" &&
    (await requireModeratorForRoom(session.user.id, room.id));

  if (!isOwn && !isAdmin && !isModerator) {
    return NextResponse.json({ error: "No podés borrar este mensaje" }, { status: 403 });
  }

  await Promise.all(
    message.files.map((f) => deleteChatImage(f.storageKey).catch(() => undefined))
  );
  await prisma.chatMessage.delete({ where: { id: messageId } });

  return NextResponse.json({ ok: true });
}
