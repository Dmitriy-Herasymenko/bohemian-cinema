import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { userId } = await request.json();

  const member = await prisma.partyMember.create({
    data: { userId, partyId: id },
    include: { user: true },
  });

  return NextResponse.json(member);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { userId } = await request.json();

  await prisma.partyMember.delete({
    where: { userId_partyId: { userId, partyId: id } },
  });

  return NextResponse.json({ success: true });
}
