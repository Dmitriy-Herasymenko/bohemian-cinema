import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
      votes: {
        include: {
          movie: {
            include: { party: true },
          },
        },
      },
      parties: {
        include: { party: true },
        orderBy: { party: { date: "desc" } },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.userId !== (await params).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { name, avatar } = await request.json();

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(avatar !== undefined && { avatar }),
    },
    select: { id: true, name: true, email: true, avatar: true },
  });

  return NextResponse.json(user);
}
