import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, movieId, text } = body;

  if (!text || !userId || !movieId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: { userId, movieId, text },
    include: { user: true },
  });

  return NextResponse.json(comment);
}
