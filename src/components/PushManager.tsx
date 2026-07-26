"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";

export function PushManager() {
  usePushNotifications();
  return null;
}
