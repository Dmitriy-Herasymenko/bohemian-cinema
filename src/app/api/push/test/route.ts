import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import webPush from "web-push";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs: string[] = [];

  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_EMAIL;

  logs.push(`VAPID pub exists: ${!!pub} (length: ${pub?.length || 0})`);
  logs.push(`VAPID priv exists: ${!!priv} (length: ${priv?.length || 0})`);
  logs.push(`VAPID email: ${email || "not set"}`);
  logs.push(`NODE_ENV: ${process.env.NODE_ENV}`);
  logs.push(`Key raw last 10: "${pub?.slice(-10)}"`);
  logs.push(`Key has =: ${pub?.includes("=")}`);
  logs.push(`Key has +: ${pub?.includes("+")}`);
  logs.push(`Key has /: ${pub?.includes("/")}`);

  if (!pub || !priv) {
    logs.push("ERROR: Missing VAPID keys");
    return NextResponse.json({ logs, error: "Missing VAPID keys" });
  }

  try {
    const normalizedPub = pub.trim().replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
    logs.push(`Normalized length: ${normalizedPub.length}`);
    logs.push(`Normalized last 10: "${normalizedPub.slice(-10)}"`);
    webPush.setVapidDetails(
      email || "mailto:bohemian-cinema@example.com",
      normalizedPub,
      priv
    );
    logs.push("VAPID configured OK");
  } catch (err: any) {
    logs.push(`VAPID setup error: ${err.message}`);
    return NextResponse.json({ logs, error: "VAPID setup error" });
  }

  const subs = await prisma.pushSubscription.findMany();
  logs.push(`Found ${subs.length} total subscriptions`);

  const results: any[] = [];
  for (const sub of subs) {
    const type = sub.endpoint.includes("apple") ? "Apple" : "FCM";
    try {
      await webPush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify({
          title: "🧪 Тест push",
          body: "Діагностичний тест",
          url: "/chat",
        })
      );
      logs.push(`✅ Sent to ${type} user=${sub.userId}`);
      results.push({ type, userId: sub.userId, status: "ok" });
    } catch (err: any) {
      logs.push(`❌ Failed ${type} user=${sub.userId}: status=${err.statusCode} msg=${err.message?.substring(0, 100)}`);
      results.push({ type, userId: sub.userId, status: "error", statusCode: err.statusCode, message: err.message?.substring(0, 100) });
    }
  }

  return NextResponse.json({ logs, results });
}
