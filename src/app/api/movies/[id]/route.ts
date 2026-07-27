import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const movie = await prisma.movie.findUnique({
    where: { id },
    include: {
      votes: { include: { user: true } },
      comments: { include: { user: true }, orderBy: { createdAt: "desc" } },
      party: true,
    },
  });

  if (!movie) {
    return NextResponse.json({ error: "Movie not found" }, { status: 404 });
  }

  const avgRating = movie.votes.length > 0
    ? movie.votes.reduce((sum, v) => sum + v.rating, 0) / movie.votes.length
    : 0;

  return NextResponse.json({ ...movie, avgRating });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { partyId } = await request.json();

  const movie = await prisma.movie.update({
    where: { id },
    data: { partyId: partyId || null },
  });

  return NextResponse.json(movie);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const movie = await prisma.movie.findUnique({ where: { id }, select: { createdById: true } });
  if (!movie) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (movie.createdById !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.comment.deleteMany({ where: { movieId: id } });
  await prisma.vote.deleteMany({ where: { movieId: id } });
  await prisma.movie.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
