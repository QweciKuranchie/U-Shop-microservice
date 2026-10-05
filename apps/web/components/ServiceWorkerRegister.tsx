"use client";

import { useEffect } from "react";

const UPDATE_CHECK_MS = 60 * 60 * 1000;

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        if (cancelled) return;
        // Cleared on unmount (previously never cleared; StrictMode/HMR stacked them).
        intervalId = setInterval(() => {
          registration.update().catch(() => {});
        }, UPDATE_CHECK_MS);
      })
      .catch((error) => console.error("[SW] Registration failed:", error));

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return null;
}
