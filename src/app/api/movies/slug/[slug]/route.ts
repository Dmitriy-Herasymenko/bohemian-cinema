import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const movie = await prisma.movie.findUnique({
    where: { slug },
    include: {
      votes: { include: { user: { select: { id: true, name: true } } } },
      comments: { include: { user: { select: { id: true, name: true, avatar: true } } }, orderBy: { createdAt: "desc" } },
      party: { select: { id: true, title: true, date: true } },
      createdBy: { select: { id: true, name: true, avatar: true } },
    },
  });

  if (!movie) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const partyMembers = movie.partyId
    ? await prisma.partyMember.findMany({
        where: { partyId: movie.partyId },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      })
    : [];

  return NextResponse.json({
    ...movie,
    partyMembers: partyMembers.map((m) => m.user),
  });
}
