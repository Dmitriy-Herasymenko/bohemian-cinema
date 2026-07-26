import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const parties = await prisma.party.findMany({
    include: {
      members: { include: { user: true } },
      movies: {
        include: {
          votes: { include: { user: true } },
          comments: { include: { user: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(parties);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Увійдіть в акаунт" }, { status: 401 });
  }

  const body = await request.json();
  const { title, date, description, memberIds } = body;

  if (!title || !date) {
    return NextResponse.json({ error: "Назва і дата обов'язкові" }, { status: 400 });
  }

  const party = await prisma.party.create({
    data: {
      title,
      date: new Date(date),
      description: description || null,
      members: {
        create: [
          { userId: session.userId },
          ...(memberIds || []).filter((id: string) => id !== session.userId).map((id: string) => ({ userId: id })),
        ],
      },
    },
    include: { members: { include: { user: true } } },
  });

  return NextResponse.json(party);
}
