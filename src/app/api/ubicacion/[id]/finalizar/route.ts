import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.locationShare.updateMany({
    where: { id, workerId: session.user.id },
    data: { status: "FINALIZADA" },
  });

  return NextResponse.json({ ok: true });
}
