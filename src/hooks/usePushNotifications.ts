"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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

async function subscribePush(userId: string) {
  if (!("serviceWorker" in navigator)) return;
  if (!("PushManager" in window)) return;

  const swReg = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  const existing = await swReg.pushManager.getSubscription();
  if (existing) {
    await existing.unsubscribe().catch(() => {});
  }

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
  console.log("[Push] Subscribed for user", userId);
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [permissionState, setPermissionState] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!("Notification" in window)) return;

    const perm = Notification.permission;
    setPermissionState(perm);

    if (perm === "granted") {
      subscribePush(user.userId)
        .then(() => setSubscribed(true))
        .catch((err) => console.error("[Push] Auto-subscribe error:", err));
    }
  }, [user]);

  const enableNotifications = useCallback(async () => {
    if (!user) return false;
    try {
      const perm = await Notification.requestPermission();
      setPermissionState(perm);
      if (perm === "granted") {
        await subscribePush(user.userId);
        setSubscribed(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error("[Push] Enable error:", err);
      return false;
    }
  }, [user]);

  return { permissionState, subscribed, enableNotifications };
}
