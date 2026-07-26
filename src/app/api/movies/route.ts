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
      party: true,
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

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, year, description, poster, trailerUrl } = await request.json();

  if (!title) {
    return NextResponse.json({ error: "Назва обов'язкова" }, { status: 400 });
  }

  const movie = await prisma.movie.create({
    data: {
      title,
      year: year || null,
      description: description || null,
      poster: poster || null,
      trailerUrl: trailerUrl || null,
    },
  });

  return NextResponse.json(movie);
}
