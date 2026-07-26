import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const movies = await prisma.movie.findMany({
    where: { status: "upcoming" },
  });

  if (movies.length === 0) {
    return NextResponse.json(
      { error: "No upcoming movies to choose from" },
      { status: 404 }
    );
  }

  const randomIndex = Math.floor(Math.random() * movies.length);
  const selected = movies[randomIndex];

  return NextResponse.json({
    movie: selected,
    totalOptions: movies.length,
  });
}
