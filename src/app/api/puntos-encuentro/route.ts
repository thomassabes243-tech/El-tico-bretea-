import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  const points = await prisma.safeMeetingPoint.findMany({
    where: {
      isActive: true,
      ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
    },
    orderBy: { city: "asc" },
  });

  return NextResponse.json({ points });
}
