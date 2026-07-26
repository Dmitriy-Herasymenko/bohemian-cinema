import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { movieId, rating } = await request.json();

  if (rating < 1 || rating > 10) {
    return NextResponse.json({ error: "Оцінка від 1 до 10" }, { status: 400 });
  }

  const movie = await prisma.movie.findUnique({ where: { id: movieId } });
  if (!movie) {
    return NextResponse.json({ error: "Фільм не знайдено" }, { status: 404 });
  }

  if (movie.partyId) {
    const isMember = await prisma.partyMember.findUnique({
      where: { userId_partyId: { userId: session.userId, partyId: movie.partyId } },
    });
    if (!isMember) {
      return NextResponse.json({ error: "Тільки учасники п'янки можуть голосувати" }, { status: 403 });
    }
  }

  const vote = await prisma.vote.upsert({
    where: { userId_movieId: { userId: session.userId, movieId } },
    update: { rating },
    create: { userId: session.userId, movieId, rating },
  });

  return NextResponse.json(vote);
}
