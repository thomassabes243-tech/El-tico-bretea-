import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShieldBan } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getChatRoomBySlug, isUserBlockedFromRoom, CHAT_MESSAGE_INCLUDE, serializeChatMessage } from "@/lib/chat-rooms";
import { cleanupExpiredChatFiles } from "@/lib/storage";
import { TopBar } from "@/components/nav/TopBar";
import { CategoryIcon } from "@/components/brand/CategoryIcon";
import { ChatRoomView } from "@/components/chat/ChatRoomView";
import { CancunScene } from "@/components/brand/scenery/CancunScene";
import { ChiapasScene } from "@/components/brand/scenery/ChiapasScene";
import { CoffeeMountainsScene } from "@/components/brand/scenery/CoffeeMountainsScene";
import { COMMUNITY_CATEGORIES } from "@/lib/constants";
import type { LaborCategory } from "@prisma/client";
import type { ComponentType } from "react";

const COMMUNITY_SCENES: Record<string, ComponentType<{ className?: string }>> = {
  CONSTRUCCION: CoffeeMountainsScene,
  HOTELES_TURISMO: CancunScene,
  PROFESIONALES: ChiapasScene,
};

export default async function ComunidadCategoriaPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");

  const { category } = await params;
  const community = COMMUNITY_CATEGORIES.find((c) => c.value.toLowerCase() === category);
  if (!community) notFound();

  const room = await getChatRoomBySlug(category);
  if (!room) notFound();

  await cleanupExpiredChatFiles().catch(() => undefined);

  const [recentMessages, blocked] = await Promise.all([
    prisma.chatMessage.findMany({
      where: { chatRoomId: room.id },
      include: CHAT_MESSAGE_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    isUserBlockedFromRoom(room.id, session.user.id),
  ]);

  const initialMessages = recentMessages.slice().reverse().map(serializeChatMessage);

  const isCompany = session.user.role === "COMPANY";
  let companyJobs: { id: string; title: string }[] = [];
  if (isCompany) {
    const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
    if (company) {
      companyJobs = await prisma.jobPosting.findMany({
        where: { companyId: company.id, isActive: true, laborCategory: room.category as LaborCategory },
        select: { id: true, title: true },
        orderBy: { createdAt: "desc" },
      });
    }
  }

  let canModerate = false;
  if (session.user.role === "MODERATOR") {
    const moderator = await prisma.moderator.findUnique({ where: { userId: session.user.id } });
    if (moderator) {
      const assignment = await prisma.moderatorAssignment.findUnique({
        where: { moderatorId_chatRoomId: { moderatorId: moderator.id, chatRoomId: room.id } },
      });
      canModerate = Boolean(assignment);
    }
  }

  const Scene = COMMUNITY_SCENES[community.value];

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <TopBar />
      <div className="relative h-24 shrink-0 overflow-hidden border-b border-sand-200">
        {Scene && <Scene className="absolute inset-0 h-full w-full" />}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/75 via-navy-950/45 to-navy-950/15" />
        <div className="relative flex h-full items-center gap-3 px-4">
          <Link href="/comunidad" className="text-white/80">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <CategoryIcon category={community.value} size="sm" tone="red" />
          <div className="flex-1">
            <h1 className="text-sm font-extrabold text-white drop-shadow-sm">{community.label}</h1>
            <p className="text-[11px] text-white/70">Comunidad en vivo</p>
          </div>
          {canModerate && (
            <Link
              href={`/comunidad/${category}/moderacion`}
              className="flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-navy-800 backdrop-blur-sm"
            >
              <ShieldBan className="h-3.5 w-3.5" /> Moderar
            </Link>
          )}
        </div>
      </div>

      <ChatRoomView
        categorySlug={category}
        initialMessages={initialMessages}
        initialBlocked={blocked}
        currentUserId={session.user.id}
        isCompany={isCompany}
        companyJobs={companyJobs}
        canModerate={canModerate}
      />
    </div>
  );
}
