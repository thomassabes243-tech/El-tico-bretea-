import Link from "next/link";
import { MessageCircle, ShieldBan, AlertTriangle } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getCommunityChatRoom,
  isUserBlockedFromRoom,
  CHAT_MESSAGE_INCLUDE,
  serializeChatMessage,
} from "@/lib/chat-rooms";
import { cleanupExpiredChatFiles } from "@/lib/storage";
import { TopBar } from "@/components/nav/TopBar";
import { ChatRoomView } from "@/components/chat/ChatRoomView";
import { QuickChatAccessForm } from "@/components/community/QuickChatAccessForm";
import { CommunityInviteBanner } from "@/components/community/CommunityInviteBanner";

export default async function ComunidadPage() {
  const session = await auth();
  const room = await getCommunityChatRoom();

  if (!session?.user) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden">
        <TopBar />
        <div className="relative h-20 shrink-0 overflow-hidden border-b border-sand-200 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950">
          <div className="relative flex h-full items-center gap-3 px-4">
            <MessageCircle className="h-5 w-5 text-white/80" />
            <div className="flex-1">
              <h1 className="text-sm font-extrabold text-white drop-shadow-sm">Comunidad</h1>
              <p className="text-[11px] text-white/70">Chat en vivo de toda la comunidad</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pb-8">
          <CommunityInviteBanner />
          <Link href="/alertas-estafa" className="mx-4 mt-3 block">
            <div className="flex items-center gap-3 rounded-2xl border border-mx-red-600/20 bg-mx-red-100/40 p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-mx-red-600/15 text-mx-red-600">
                <AlertTriangle className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-navy-900">Alertas de estafas</p>
                <p className="text-xs text-navy-800/50">Reportá o consultá ofertas sospechosas</p>
              </div>
            </div>
          </Link>
          <QuickChatAccessForm />
        </div>
      </div>
    );
  }

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
        where: { companyId: company.id, isActive: true },
        select: { id: true, title: true },
        orderBy: { createdAt: "desc" },
      });
    }
  }

  // El admin modera cualquier sala sin necesitar asignación. Cualquier otra
  // cuenta (trabajador, empresa o moderador puro) puede moderar si tiene un
  // registro de Moderator con una asignación a esta sala -- moderar es un
  // extra sobre la cuenta, no depende de que el rol sea MODERATOR.
  let canModerate = session.user.role === "ADMIN";
  if (!canModerate) {
    const moderator = await prisma.moderator.findUnique({ where: { userId: session.user.id } });
    if (moderator) {
      const assignment = await prisma.moderatorAssignment.findUnique({
        where: { moderatorId_chatRoomId: { moderatorId: moderator.id, chatRoomId: room.id } },
      });
      canModerate = Boolean(assignment);
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <TopBar />
      <div className="relative h-16 shrink-0 overflow-hidden border-b border-sand-200 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950">
        <div className="relative flex h-full items-center gap-3 px-4">
          <MessageCircle className="h-5 w-5 text-white/80" />
          <div className="flex-1">
            <h1 className="text-sm font-extrabold text-white drop-shadow-sm">Comunidad</h1>
            <p className="text-[11px] text-white/70">Chat en vivo</p>
          </div>
          <Link
            href="/alertas-estafa"
            className="flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white/90"
            title="Alertas de estafas"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
          </Link>
          {canModerate && (
            <Link
              href="/comunidad/moderacion"
              className="flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-navy-800 backdrop-blur-sm"
            >
              <ShieldBan className="h-3.5 w-3.5" /> Moderar
            </Link>
          )}
        </div>
      </div>

      <ChatRoomView
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
