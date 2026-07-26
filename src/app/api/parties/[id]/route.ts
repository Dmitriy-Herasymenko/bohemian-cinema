import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const party = await prisma.party.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      movies: {
        include: {
          votes: { include: { user: true } },
          comments: { include: { user: true }, orderBy: { createdAt: "desc" } },
        },
      },
      comments: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!party) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(party);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const party = await prisma.party.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.title && { title: body.title }),
      ...(body.date && { date: new Date(body.date) }),
      ...(body.description !== undefined && { description: body.description || null }),
    },
  });

  return NextResponse.json(party);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.comment.deleteMany({ where: { movie: { partyId: id } } });
  await prisma.vote.deleteMany({ where: { movie: { partyId: id } } });
  await prisma.movie.deleteMany({ where: { partyId: id } });
  await prisma.partyMember.deleteMany({ where: { partyId: id } });
  await prisma.party.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
