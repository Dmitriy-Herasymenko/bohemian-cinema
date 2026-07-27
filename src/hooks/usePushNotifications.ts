"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthContext";

const VAPID_PUBLIC_KEY = "BGEsTWpsZ1qNNl8g3N5tiHJu7GW0faTNc2QRxa4eZpwy4HK7k5P6acQaRbDey767A_SUnX_jwNT6lktUSzjoKKs";

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
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (!("PushManager" in window)) return;
    if (!VAPID_PUBLIC_KEY) return;

    const prevUserId = prevUserIdRef.current;
    const currentUserId = user?.userId ?? null;
    prevUserIdRef.current = currentUserId;

    if (!currentUserId) {
      if (prevUserId) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.pushManager.getSubscription().then((sub) => {
            if (sub) {
              sub.unsubscribe().catch(() => {});
              fetch("/api/push/unsubscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ endpoint: sub.endpoint }),
              }).catch(() => {});
            }
          });
        });
      }
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const swReg = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;

        const existing = await swReg.pushManager.getSubscription();

        if (existing) {
          console.log("[Push] Existing subscription found, syncing userId...");
          const subJson = existing.toJSON();
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              endpoint: subJson.endpoint,
              p256dh: subJson.keys?.p256dh,
              auth: subJson.keys?.auth,
            }),
          });
          console.log("[Push] Synced existing subscription for user", currentUserId);
          return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const subscription = await swReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
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
        console.log("[Push] New subscription created for user", currentUserId);
      } catch (err) {
        if (!cancelled) console.error("[Push] Error:", err);
      }
    };

    run();

    return () => { cancelled = true; };
  }, [user]);
}
