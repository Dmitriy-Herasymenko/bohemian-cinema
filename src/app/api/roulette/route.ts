import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const parties = await prisma.party.findMany({
    where: { status: "upcoming" },
    include: { movies: true },
  });

  const movies = parties.flatMap((p) => p.movies);

  if (movies.length === 0) {
    return NextResponse.json({ error: "No movies to choose from" }, { status: 404 });
  }

  const randomIndex = Math.floor(Math.random() * movies.length);

  return NextResponse.json({
    movie: movies[randomIndex],
    totalOptions: movies.length,
  });
}
