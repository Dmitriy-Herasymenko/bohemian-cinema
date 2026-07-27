import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notifyChatMessage } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const before = url.searchParams.get("before");

  const messages = await prisma.chatMessage.findMany({
    where: before ? { createdAt: { lt: new Date(before) } } : {},
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(messages.reverse());
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text } = await request.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const message = await prisma.chatMessage.create({
    data: { text: text.trim(), userId: session.userId },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  });

  const response = NextResponse.json(message);

  try {
    await Promise.race([
      notifyChatMessage(session.name, text.trim(), session.userId, session.gender),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Push timeout")), 8000)),
    ]);
    console.log("[Chat] Push notifications sent successfully");
  } catch (err: any) {
    console.error("[Chat] Push notification issue:", err?.statusCode || err?.message);
  }

  return response;
}
