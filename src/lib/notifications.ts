import { prisma } from "@/lib/db";
import webPush from "web-push";

let vapidConfigured = false;

function ensureVapid() {
  if (vapidConfigured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webPush.setVapidDetails(
    process.env.VAPID_EMAIL || "mailto:bohemian-cinema@example.com",
    pub,
    priv
  );
  vapidConfigured = true;
  return true;
}

export async function notifyNewMovie(movieTitle: string, creatorName: string, movieSlug: string | null) {
  if (!ensureVapid()) return;

  const subscriptions = await prisma.pushSubscription.findMany();
  if (subscriptions.length === 0) return;

  const payload = JSON.stringify({
    title: "🍿 Нове кіно!",
    body: `${creatorName} додав(ла) "${movieTitle}"`,
    url: movieSlug ? `/movies/${movieSlug}` : "/future-movies",
  });

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webPush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      ).catch((err) => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          return prisma.pushSubscription.deleteMany({ where: { id: sub.id } });
        }
        throw err;
      })
    )
  );

  return results;
}
