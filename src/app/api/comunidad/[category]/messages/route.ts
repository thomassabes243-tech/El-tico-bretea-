import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getChatRoomBySlug,
  isUserBlockedFromRoom,
  CHAT_MESSAGE_INCLUDE,
  serializeChatMessage,
} from "@/lib/chat-rooms";
import { chatMessageSchema } from "@/lib/validations";
import { cleanupExpiredChatFiles } from "@/lib/storage";

export async function GET(request: Request, { params }: { params: Promise<{ category: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { category } = await params;
  const room = await getChatRoomBySlug(category);
  if (!room) return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });

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

export async function POST(request: Request, { params }: { params: Promise<{ category: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { category } = await params;
  const room = await getChatRoomBySlug(category);
  if (!room) return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });

  if (await isUserBlockedFromRoom(room.id, session.user.id)) {
    return NextResponse.json({ error: "Un moderador te bloqueó el acceso a esta sala" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
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
