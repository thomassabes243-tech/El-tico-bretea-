import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// Un solo chat de comunidad para toda la app -- ya no dividido por gremio.
// Se resuelve/crea por un slug fijo en vez de guardar el id en otro lado.
export async function getCommunityChatRoom() {
  return prisma.chatRoom.upsert({
    where: { slug: "general" },
    create: { slug: "general", name: "Comunidad" },
    update: {},
  });
}

export async function isUserBlockedFromRoom(chatRoomId: string, userId: string) {
  const block = await prisma.chatRoomBlock.findUnique({
    where: { chatRoomId_userId: { chatRoomId, userId } },
  });
  return Boolean(block);
}

export function displayNameFor(user: {
  email: string;
  role: string;
  chatAlias?: string | null;
  workerProfile?: { fullName: string } | null;
  companyProfile?: { commercialName: string } | null;
}) {
  if (user.chatAlias?.trim()) return user.chatAlias.trim();
  if (user.workerProfile) return user.workerProfile.fullName;
  if (user.companyProfile) return user.companyProfile.commercialName;
  if (user.role === "MODERATOR") return "Moderador";
  if (user.role === "ADMIN") return "Administración";
  return user.email;
}

export const CHAT_MESSAGE_INCLUDE = {
  author: { include: { workerProfile: true, companyProfile: true } },
  jobPosting: { include: { company: true } },
  files: { select: { id: true, width: true, height: true } },
} satisfies Prisma.ChatMessageInclude;

export type ChatMessageWithRelations = Prisma.ChatMessageGetPayload<{
  include: typeof CHAT_MESSAGE_INCLUDE;
}>;

export function serializeChatMessage(m: ChatMessageWithRelations) {
  return {
    id: m.id,
    type: m.type,
    content: m.content,
    createdAt: m.createdAt.toISOString(),
    author: {
      id: m.author.id,
      role: m.author.role,
      name: displayNameFor(m.author),
    },
    jobPosting: m.jobPosting
      ? {
          id: m.jobPosting.id,
          title: m.jobPosting.title,
          location: m.jobPosting.location,
          companyName: m.jobPosting.company.commercialName,
          companyVerified: m.jobPosting.company.isVerified,
          isActive: m.jobPosting.isActive,
        }
      : null,
    files: m.files,
  };
}
