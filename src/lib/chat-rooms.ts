import { prisma } from "@/lib/prisma";
import { COMMUNITY_CATEGORIES } from "@/lib/constants";
import type { CommunityCategory, Prisma } from "@prisma/client";

export function communityCategoryFromSlug(slug: string): CommunityCategory | null {
  const match = COMMUNITY_CATEGORIES.find((c) => c.value.toLowerCase() === slug);
  return (match?.value as CommunityCategory) ?? null;
}

export async function getChatRoomBySlug(slug: string) {
  const category = communityCategoryFromSlug(slug);
  if (!category) return null;
  return prisma.chatRoom.findFirst({ where: { category } });
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
  workerProfile?: { fullName: string } | null;
  companyProfile?: { commercialName: string } | null;
}) {
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
