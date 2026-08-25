import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getCommunityChatRoom,
  isUserBlockedFromRoom,
  CHAT_MESSAGE_INCLUDE,
  serializeChatMessage,
} from "@/lib/chat-rooms";
import { chatMessageSchema } from "@/lib/validations";
import { cleanupExpiredChatFiles } from "@/lib/storage";
import { detectContactInfoLeak } from "@/lib/safety";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const room = await getCommunityChatRoom();

  await cleanupExpiredChatFiles().catch(() => undefined);

  const { searchParams } = new URL(request.url);
  const after = searchParams.get("after");

  let ordered;
  if (after) {
    ordered = await prisma.chatMessage.findMany({
      where: { chatRoomId: room.id, createdAt: { gt: new Date(after) } },
      include: CHAT_MESSAGE_INCLUDE,
      orderBy: { createdAt: "asc" },
      take: 100,
    });
  } else {
    const recent = await prisma.chatMessage.findMany({
      where: { chatRoomId: room.id },
      include: CHAT_MESSAGE_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    ordered = recent.slice().reverse();
  }

  const blocked = await isUserBlockedFromRoom(room.id, session.user.id);

  return NextResponse.json({
    roomId: room.id,
    blocked,
    messages: ordered.map(serializeChatMessage),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const room = await getCommunityChatRoom();

  if (await isUserBlockedFromRoom(room.id, session.user.id)) {
    return NextResponse.json({ error: "Un moderador te bloqueó el acceso a esta sala" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
  }

  if (session.user.role === "COMPANY") {
    const company = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
      select: { isVerified: true },
    });
    if (company && !company.isVerified) {
      const leakReason = detectContactInfoLeak(parsed.data.content);
      if (leakReason) {
        return NextResponse.json(
          {
            error: `Como empresa no verificada, no podés compartir datos de contacto directo en el chat (${leakReason}). Una vez verificada tu cuenta esta restricción se levanta.`,
          },
          { status: 400 }
        );
      }
    }
  }

  const message = await prisma.chatMessage.create({
    data: {
      chatRoomId: room.id,
      authorId: session.user.id,
      type: "TEXT",
      content: parsed.data.content,
    },
    include: CHAT_MESSAGE_INCLUDE,
  });

  return NextResponse.json(serializeChatMessage(message), { status: 201 });
}
