import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [standalone, upcomingParties] = await Promise.all([
    prisma.movie.findMany({ where: { partyId: null } }),
    prisma.party.findMany({ where: { status: "upcoming" }, include: { movies: true } }),
  ]);

  const upcomingMovies = upcomingParties.flatMap((p) => p.movies);
  const movies = [...standalone, ...upcomingMovies];

  if (movies.length === 0) {
    return NextResponse.json({ error: "No movies to choose from" }, { status: 404 });
  }

  const randomIndex = Math.floor(Math.random() * movies.length);

  return NextResponse.json({
    movie: movies[randomIndex],
    totalOptions: movies.length,
  });
}
