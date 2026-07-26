import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import webPush from "web-push";

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(
    process.env.VAPID_EMAIL || "mailto:bohemian-cinema@example.com",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { endpoint, p256dh, auth } = await request.json();
  if (!endpoint || !p256dh || !auth) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { userId: session.userId, p256dh, auth },
    create: { userId: session.userId, endpoint, p256dh, auth },
  });

  return NextResponse.json({ ok: true });
}
