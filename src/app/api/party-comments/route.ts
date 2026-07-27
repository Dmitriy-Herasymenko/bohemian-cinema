import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const partyId = searchParams.get("partyId");
  if (!partyId) return NextResponse.json({ error: "partyId required" }, { status: 400 });

  const comments = await prisma.partyComment.findMany({
    where: { partyId },
    include: { user: { select: { id: true, name: true, avatar: true, gender: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { partyId, text, image } = await request.json();
  if (!partyId) return NextResponse.json({ error: "partyId required" }, { status: 400 });
  if (!text?.trim() && !image) return NextResponse.json({ error: "text or image required" }, { status: 400 });

  const comment = await prisma.partyComment.upsert({
    where: { userId_partyId: { userId: session.userId, partyId } },
    update: { text: text?.trim() || "", image: image || null },
    create: { userId: session.userId, partyId, text: text?.trim() || "", image: image || null },
    include: { user: { select: { id: true, name: true, avatar: true, gender: true } } },
  });

  return NextResponse.json(comment);
}
