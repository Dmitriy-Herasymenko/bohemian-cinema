import { prisma } from "@/lib/db";
import webPush from "web-push";

let vapidConfigured = false;

function ensureVapid() {
  if (vapidConfigured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) {
    console.error("[Push] Missing VAPID env vars");
    return false;
  }
  try {
    const normalizedPub = pub.trim().replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
    const normalizedPriv = priv.trim().replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
    webPush.setVapidDetails(
      process.env.VAPID_EMAIL || "mailto:bohemian-cinema@example.com",
      normalizedPub,
      normalizedPriv
    );
    vapidConfigured = true;
    return true;
  } catch (err) {
    console.error("[Push] VAPID setup error:", err);
    return false;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

async function sendPush(sub: { endpoint: string; p256dh: string; auth: string }, payload: string) {
  return withTimeout(
    webPush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload
    ),
    10000
  );
}

export async function notifyNewMovie(movieTitle: string, creatorName: string, movieSlug: string | null, creatorGender?: string) {
  if (!ensureVapid()) return;

  const subscriptions = await prisma.pushSubscription.findMany();
  if (subscriptions.length === 0) return;

  const genderLabel = creatorGender === "female" ? "👩" : "👨";
  const payload = JSON.stringify({
    title: "🍿 Нове кіно!",
    body: `${genderLabel} ${creatorName} додав "${movieTitle}"`,
    url: movieSlug ? `/movies/${movieSlug}` : "/future-movies",
  });

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await sendPush(sub, payload);
      } catch (err: any) {
        console.error(`[Push] Failed for sub ${sub.id}:`, err.statusCode || err.message);
        if (err.statusCode === 404 || err.statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
      }
    })
  );

  return results;
}

export async function notifyChatMessage(senderName: string, text: string, senderId: string, senderGender?: string) {
  if (!ensureVapid()) return;

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: { not: senderId } },
  });
  if (subscriptions.length === 0) return;

  const genderLabel = senderGender === "female" ? "👩" : "👨";
  const truncated = text.length > 80 ? text.slice(0, 80) + "…" : text;
  const payload = JSON.stringify({
    title: `${genderLabel} ${senderName}`,
    body: truncated,
    url: "/chat",
  });

  for (const sub of subscriptions) {
    const type = sub.endpoint.includes("apple") ? "Apple" : "FCM";
    try {
      await sendPush(sub, payload);
      console.log(`[Push] ✅ Sent to ${type} (${sub.endpoint.substring(0, 40)}...)`);
    } catch (err: any) {
      console.error(`[Push] ❌ Failed ${type}:`, err.statusCode || err.message?.substring(0, 150));
      if (err.statusCode === 404 || err.statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      }
    }
  }
}
