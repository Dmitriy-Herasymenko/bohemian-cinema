import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const movies = await prisma.movie.findMany({
    include: {
      votes: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const moviesWithRating = movies.map((movie) => ({
    ...movie,
    avgRating:
      movie.votes.length > 0
        ? movie.votes.reduce((sum, v) => sum + v.rating, 0) / movie.votes.length
        : 0,
    totalVotes: movie.votes.length,
  }));

  return NextResponse.json(moviesWithRating);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, year, description, poster, status } = body;

  const movie = await prisma.movie.create({
    data: {
      title,
      year: year ? parseInt(year) : null,
      description,
      poster,
      status: status || "watched",
    },
  });

  return NextResponse.json(movie);
}
