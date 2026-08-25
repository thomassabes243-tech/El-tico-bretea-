import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCommunityChatRoom } from "@/lib/chat-rooms";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { ModerationPanel } from "@/components/chat/ModerationPanel";

export default async function ModeracionSalaPage() {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");

  const room = await getCommunityChatRoom();

  // El admin modera cualquier sala sin necesitar una asignación explícita.
  if (session.user.role !== "ADMIN") {
    const moderator = await prisma.moderator.findUnique({ where: { userId: session.user.id } });
    const assignment = moderator
      ? await prisma.moderatorAssignment.findUnique({
          where: { moderatorId_chatRoomId: { moderatorId: moderator.id, chatRoomId: room.id } },
        })
      : null;
    if (!assignment) redirect("/perfil");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 pb-28 pt-5">
        <div className="px-4">
          <Link href="/comunidad" className="flex items-center gap-1 text-sm font-medium text-navy-800/60">
            <ChevronLeft className="h-4 w-4" /> Comunidad
          </Link>
          <h1 className="mt-2 text-xl font-extrabold tracking-tight text-navy-900">Moderación</h1>
        </div>
        <ModerationPanel />
      </main>
      <BottomNav />
    </div>
  );
}
