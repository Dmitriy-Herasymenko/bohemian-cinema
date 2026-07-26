import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  const movies = await prisma.movie.findMany({
    where: { partyId: null },
    include: {
      votes: { include: { user: true } },
      comments: { include: { user: true }, orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const moviesWithRating = movies.map((movie) => ({
    ...movie,
    avgRating: movie.votes.length > 0
      ? movie.votes.reduce((sum, v) => sum + v.rating, 0) / movie.votes.length
      : 0,
    totalVotes: movie.votes.length,
  }));

  return NextResponse.json(moviesWithRating);
}
