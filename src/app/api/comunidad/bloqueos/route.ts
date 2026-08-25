import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCommunityChatRoom, displayNameFor } from "@/lib/chat-rooms";

async function requireModeratorForRoom(userId: string, chatRoomId: string) {
  const moderator = await prisma.moderator.findUnique({ where: { userId } });
  if (!moderator) return false;
  const assignment = await prisma.moderatorAssignment.findUnique({
    where: { moderatorId_chatRoomId: { moderatorId: moderator.id, chatRoomId } },
  });
  return Boolean(assignment);
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const room = await getCommunityChatRoom();

  if (session.user.role !== "ADMIN" && !(await requireModeratorForRoom(session.user.id, room.id))) {
    return NextResponse.json({ error: "No sos moderador de esta sala" }, { status: 403 });
  }

  const blocks = await prisma.chatRoomBlock.findMany({
    where: { chatRoomId: room.id },
    include: { user: { include: { workerProfile: true, companyProfile: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    blocks: blocks.map((b) => ({
      id: b.id,
      userId: b.userId,
      name: displayNameFor(b.user),
      email: b.user.email,
      reason: b.reason,
      createdAt: b.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const room = await getCommunityChatRoom();

  if (session.user.role !== "ADMIN" && !(await requireModeratorForRoom(session.user.id, room.id))) {
    return NextResponse.json({ error: "No sos moderador de esta sala" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const targetUserId = body.userId;
  const reason = typeof body.reason === "string" ? body.reason.slice(0, 300) : null;

  if (typeof targetUserId !== "string") {
    return NextResponse.json({ error: "Falta el usuario a bloquear" }, { status: 400 });
  }
  if (targetUserId === session.user.id) {
    return NextResponse.json({ error: "No podés bloquearte a vos mismo" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  await prisma.chatRoomBlock.upsert({
    where: { chatRoomId_userId: { chatRoomId: room.id, userId: targetUserId } },
    create: { chatRoomId: room.id, userId: targetUserId, blockedById: session.user.id, reason },
    update: { reason, blockedById: session.user.id },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const room = await getCommunityChatRoom();

  if (session.user.role !== "ADMIN" && !(await requireModeratorForRoom(session.user.id, room.id))) {
    return NextResponse.json({ error: "No sos moderador de esta sala" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get("userId");
  if (!targetUserId) {
    return NextResponse.json({ error: "Falta el usuario a desbloquear" }, { status: 400 });
  }

  await prisma.chatRoomBlock
    .delete({ where: { chatRoomId_userId: { chatRoomId: room.id, userId: targetUserId } } })
    .catch(() => undefined);

  return NextResponse.json({ ok: true });
}
