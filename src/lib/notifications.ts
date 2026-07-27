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
    webPush.setVapidDetails(
      process.env.VAPID_EMAIL || "mailto:bohemian-cinema@example.com",
      pub,
      priv
    );
    vapidConfigured = true;
    return true;
  } catch (err) {
    console.error("[Push] VAPID setup error:", err);
    return false;
  }
}

export async function notifyNewMovie(movieTitle: string, creatorName: string, movieSlug: string | null, creatorGender?: string) {
  if (!ensureVapid()) return;

  const subscriptions = await prisma.pushSubscription.findMany();
  console.log(`[Push] Found ${subscriptions.length} subscriptions, sending notifications...`);
  if (subscriptions.length === 0) return;

  const genderLabel = creatorGender === "female" ? "👩" : "👨";
  const payload = JSON.stringify({
    title: "🍿 Нове кіно!",
    body: `${genderLabel} ${creatorName} додав "${movieTitle}"`,
    url: movieSlug ? `/movies/${movieSlug}` : "/future-movies",
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webPush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      ).catch((err) => {
        console.error(`[Push] Failed for sub ${sub.id}:`, err.statusCode, err.message);
        if (err.statusCode === 404 || err.statusCode === 410) {
          return prisma.pushSubscription.deleteMany({ where: { id: sub.id } });
        }
        throw err;
      })
    )
  );

  console.log("[Push] Results:", results.map((r) => r.status));
  return results;
}

export async function notifyChatMessage(senderName: string, text: string, senderId: string, senderGender?: string) {
  if (!ensureVapid()) return;

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: { not: senderId } },
  });
  console.log(`[Push] Chat: sending to ${subscriptions.length} subscriptions (excluding sender)`);
  if (subscriptions.length === 0) return;

  const genderLabel = senderGender === "female" ? "👩" : "👨";
  const truncated = text.length > 80 ? text.slice(0, 80) + "…" : text;
  const payload = JSON.stringify({
    title: `${genderLabel} ${senderName}`,
    body: truncated,
    url: "/chat",
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webPush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      ).catch((err) => {
        console.error(`[Push] Chat failed for sub ${sub.id}:`, err.statusCode, err.message);
        if (err.statusCode === 404 || err.statusCode === 410) {
          return prisma.pushSubscription.deleteMany({ where: { id: sub.id } });
        }
        throw err;
      })
    )
  );

  console.log("[Push] Chat results:", results.map((r) => r.status));
  return results;
}
