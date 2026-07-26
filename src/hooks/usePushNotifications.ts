"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (!user) return;
    if (!("serviceWorker" in navigator)) { console.log("[Push] No serviceWorker support"); return; }
    if (!("PushManager" in window)) { console.log("[Push] No PushManager support"); return; }
    if (!VAPID_PUBLIC_KEY) { console.log("[Push] No VAPID key"); return; }

    let swReg: ServiceWorkerRegistration;

    const run = async () => {
      try {
        console.log("[Push] Registering service worker...");
        swReg = await navigator.serviceWorker.register("/sw.js");
        console.log("[Push] SW registered, scope:", swReg.scope);
        await navigator.serviceWorker.ready;
        console.log("[Push] SW ready");

        const existing = await swReg.pushManager.getSubscription();
        if (existing) {
          console.log("[Push] Already subscribed, re-saving...");
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
          return;
        }

        console.log("[Push] Requesting notification permission...");
        const permission = await Notification.requestPermission();
        console.log("[Push] Permission:", permission);
        if (permission !== "granted") return;

        console.log("[Push] Subscribing to push...");
        const subscription = await swReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        console.log("[Push] Subscribed:", subscription.endpoint.substring(0, 60));

        const subJson = subscription.toJSON();
        const res = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: subJson.endpoint,
            p256dh: subJson.keys?.p256dh,
            auth: subJson.keys?.auth,
          }),
        });
        console.log("[Push] Subscribe API response:", res.status, await res.json());
      } catch (err) {
        console.error("[Push] Error:", err);
      }
    };

    run();

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
