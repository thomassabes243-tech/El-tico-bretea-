import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCommunityChatRoom, isUserBlockedFromRoom, CHAT_MESSAGE_INCLUDE, serializeChatMessage } from "@/lib/chat-rooms";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Solo empresas pueden compartir vacantes" }, { status: 403 });
  }

  const room = await getCommunityChatRoom();

  if (await isUserBlockedFromRoom(room.id, session.user.id)) {
    return NextResponse.json({ error: "Un moderador te bloqueó el acceso a esta sala" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const jobPostingId = body.jobPostingId;
  if (typeof jobPostingId !== "string") {
    return NextResponse.json({ error: "Falta la vacante a compartir" }, { status: 400 });
  }

  const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
  const jobPosting = await prisma.jobPosting.findUnique({ where: { id: jobPostingId } });

  if (!company || !jobPosting || jobPosting.companyId !== company.id) {
    return NextResponse.json({ error: "Vacante no encontrada" }, { status: 404 });
  }
  if (!jobPosting.isActive) {
    return NextResponse.json({ error: "Esta vacante ya no está activa" }, { status: 400 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      chatRoomId: room.id,
      authorId: session.user.id,
      type: "JOB_SHARE",
      jobPostingId: jobPosting.id,
    },
    include: CHAT_MESSAGE_INCLUDE,
  });

  return NextResponse.json(serializeChatMessage(message), { status: 201 });
}
