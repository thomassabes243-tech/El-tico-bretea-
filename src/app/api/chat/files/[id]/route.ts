import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteChatImage, readChatImage } from "@/lib/storage";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const file = await prisma.chatFile.findUnique({ where: { id } });
  if (!file) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  if (file.expiresAt.getTime() <= Date.now()) {
    await deleteChatImage(file.storageKey);
    await prisma.chatFile.delete({ where: { id: file.id } }).catch(() => undefined);
    return NextResponse.json({ error: "Este archivo ya venció (24h)" }, { status: 404 });
  }

  try {
    const bytes = await readChatImage(file.storageKey);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": file.mimeType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[chat/files] No se pudo leer la imagen:", err);
    return NextResponse.json({ error: "Archivo no disponible" }, { status: 404 });
  }
}
