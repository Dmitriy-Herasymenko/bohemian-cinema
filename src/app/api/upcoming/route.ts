import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const movies = await prisma.movie.findMany({
    where: { status: "upcoming" },
    include: {
      votes: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(movies);
}
