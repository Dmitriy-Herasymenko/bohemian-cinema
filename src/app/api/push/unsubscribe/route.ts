import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint } = await request.json();
  if (endpoint) {
    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  } else {
    await prisma.pushSubscription.deleteMany({ where: { userId: session.userId } });
  }

  return NextResponse.json({ ok: true });
}
