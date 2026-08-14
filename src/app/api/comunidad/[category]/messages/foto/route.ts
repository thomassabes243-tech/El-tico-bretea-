import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getChatRoomBySlug, isUserBlockedFromRoom, CHAT_MESSAGE_INCLUDE, serializeChatMessage } from "@/lib/chat-rooms";
import { MAX_UPLOAD_BYTES } from "@/lib/chat-limits";
import { saveChatImage } from "@/lib/storage";

export async function POST(request: Request, { params }: { params: Promise<{ category: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { category } = await params;
  const room = await getChatRoomBySlug(category);
  if (!room) return NextResponse.json({ error: "Sala no encontrada" }, { status: 404 });

  if (await isUserBlockedFromRoom(room.id, session.user.id)) {
    return NextResponse.json({ error: "Un moderador te bloqueó el acceso a esta sala" }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const caption = formData?.get("caption");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Adjuntá una imagen" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "La imagen es muy grande (máx. 8MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let saved;
  try {
    saved = await saveChatImage(buffer);
  } catch {
    return NextResponse.json({ error: "No se pudo procesar la imagen" }, { status: 400 });
  }

  const message = await prisma.chatMessage.create({
    data: {
      chatRoomId: room.id,
      authorId: session.user.id,
      type: "TEXT",
      content: typeof caption === "string" && caption.trim() ? caption.trim().slice(0, 500) : null,
      files: {
        create: {
          uploaderId: session.user.id,
          storageKey: saved.key,
          mimeType: saved.mimeType,
          sizeBytes: saved.sizeBytes,
          width: saved.width,
          height: saved.height,
          expiresAt: saved.expiresAt,
        },
      },
    },
    include: CHAT_MESSAGE_INCLUDE,
  });

  return NextResponse.json(serializeChatMessage(message), { status: 201 });
}
