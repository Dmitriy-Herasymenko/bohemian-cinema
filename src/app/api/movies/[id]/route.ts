import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.comment.deleteMany({ where: { movieId: id } });
  await prisma.vote.deleteMany({ where: { movieId: id } });
  await prisma.movie.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
