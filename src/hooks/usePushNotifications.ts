"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthContext";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return;

    let swReg: ServiceWorkerRegistration;

    const run = async () => {
      swReg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const existing = await swReg.pushManager.getSubscription();
      if (existing) return;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const subscription = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });

      const subJson = subscription.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          p256dh: subJson.keys?.p256dh,
          auth: subJson.keys?.auth,
        }),
      });
    };

    run().catch(() => {});

    return () => {
      if (swReg) {
        swReg.pushManager.getSubscription().then((sub) => {
          if (sub) {
            const endpoint = sub.endpoint;
            sub.unsubscribe().catch(() => {});
            fetch("/api/push/unsubscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ endpoint }),
            }).catch(() => {});
          }
        });
      }
    };
  }, [user]);
}
