import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const isMember = await prisma.partyMember.findUnique({
    where: { userId_partyId: { userId: session.userId, partyId: id } },
  });

  if (!isMember) {
    return NextResponse.json({ error: "Ви не учасник цієї п'янки" }, { status: 403 });
  }

  const { title, year, description, poster, trailerUrl } = await request.json();

  if (!title) {
    return NextResponse.json({ error: "Назва обов'язкова" }, { status: 400 });
  }

  const movie = await prisma.movie.create({
    data: {
      title,
      year: year ? parseInt(year) : null,
      description: description || null,
      poster: poster || null,
      trailerUrl: trailerUrl || null,
      partyId: id,
    },
  });

  return NextResponse.json(movie);
}
