"use client";

import { usePushNotifications } from "@/hooks/usePushNotifications";

export function PushManager() {
  usePushNotifications();
  return null;
}

export function PushEnableButton() {
  const { permissionState, subscribed, enableNotifications } = usePushNotifications();

  if (permissionState === "granted" || subscribed) return null;

  return (
    <button
      onClick={enableNotifications}
      title="Увімкнути повідомлення"
      className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-amber-400 hover:bg-amber-400/10 transition-all btn-press animate-pulse"
    >
      <span className="text-base">🔔</span>
      <span className="hidden sm:inline">Увімкнути пуш</span>
    </button>
  );
}
