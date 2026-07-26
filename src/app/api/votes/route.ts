import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, movieId, rating } = body;

  if (rating < 1 || rating > 10) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 10" },
      { status: 400 }
    );
  }

  const vote = await prisma.vote.upsert({
    where: { userId_movieId: { userId, movieId } },
    update: { rating },
    create: { userId, movieId, rating },
  });

  return NextResponse.json(vote);
}
