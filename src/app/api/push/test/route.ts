import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import webPush from "web-push";
import { NextResponse } from "next/server";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs: string[] = [];

  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;

  if (!pub || !priv) {
    return NextResponse.json({ error: "Missing VAPID keys" });
  }

  try {
    const normalizedPub = pub.trim().replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
    const normalizedPriv = priv.trim().replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
    webPush.setVapidDetails(
      process.env.VAPID_EMAIL || "mailto:bohemian-cinema@example.com",
      normalizedPub,
      normalizedPriv
    );
    logs.push("VAPID configured OK");
  } catch (err: any) {
    logs.push(`VAPID setup error: ${err.message}`);
    return NextResponse.json({ logs });
  }

  const subs = await prisma.pushSubscription.findMany();
  logs.push(`Found ${subs.length} subscriptions`);

  const results: any[] = [];
  for (const sub of subs) {
    const type = sub.endpoint.includes("apple") ? "Apple" : "FCM";
    try {
      await withTimeout(
        webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({
            title: "🧪 Тест push",
            body: "Діагностичний тест",
            url: "/chat",
          })
        ),
        10000
      );
      logs.push(`✅ Sent to ${type}`);
      results.push({ type, userId: sub.userId, status: "ok" });
    } catch (err: any) {
      logs.push(`❌ ${type}: ${err.statusCode || err.message?.substring(0, 80)}`);
      results.push({ type, userId: sub.userId, status: "error", msg: err.statusCode || err.message?.substring(0, 80) });
      if (err.statusCode === 404 || err.statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
        logs.push(`Deleted stale sub`);
      }
    }
  }

  return NextResponse.json({ logs, results });
}
