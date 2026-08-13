import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getChatRoomBySlug } from "@/lib/chat-rooms";
import { TopBar } from "@/components/nav/TopBar";
import { BottomNav } from "@/components/nav/BottomNav";
import { ModerationPanel } from "@/components/chat/ModerationPanel";
import { COMMUNITY_CATEGORIES } from "@/lib/constants";

export default async function ModeracionSalaPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/iniciar-sesion");
  if (session.user.role !== "MODERATOR") redirect("/perfil");

  const { category } = await params;
  const community = COMMUNITY_CATEGORIES.find((c) => c.value.toLowerCase() === category);
  if (!community) notFound();

  const room = await getChatRoomBySlug(category);
  if (!room) notFound();

  const moderator = await prisma.moderator.findUnique({ where: { userId: session.user.id } });
  const assignment = moderator
    ? await prisma.moderatorAssignment.findUnique({
        where: { moderatorId_chatRoomId: { moderatorId: moderator.id, chatRoomId: room.id } },
      })
    : null;
  if (!assignment) redirect("/perfil");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 pb-28 pt-5">
        <div className="px-4">
          <Link href={`/comunidad/${category}`} className="flex items-center gap-1 text-sm font-medium text-navy-800/60">
            <ChevronLeft className="h-4 w-4" /> {community.label}
          </Link>
          <h1 className="mt-2 text-xl font-extrabold tracking-tight text-navy-900">Moderación</h1>
        </div>
        <ModerationPanel categorySlug={category} />
      </main>
      <BottomNav />
    </div>
  );
}
