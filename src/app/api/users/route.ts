import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, avatar: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(users);
}
