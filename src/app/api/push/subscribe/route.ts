import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { endpoint, p256dh, auth } = await request.json();
    if (!endpoint || !p256dh || !auth) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });

    await prisma.pushSubscription.deleteMany({ where: { endpoint } });

    await prisma.pushSubscription.create({
      data: { userId: session.userId, endpoint, p256dh, auth },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Push Subscribe] Error:", err?.message, err?.code, err?.meta);
    return NextResponse.json({ error: err?.message, code: err?.code, meta: err?.meta }, { status: 500 });
  }
}
