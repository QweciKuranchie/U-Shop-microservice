"use client";

import { useState } from "react";

export interface PushNotificationState {
  isLoading: boolean;
  token: string | null;
  permissionDenied: boolean;
  tokenError: boolean;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isLoading: false,
    token: null,
    permissionDenied: false,
    tokenError: false,
  });

  const requestPermission = async (): Promise<PushNotificationState> => {
    setState((s) => ({ ...s, isLoading: true, permissionDenied: false, tokenError: false }));

    try {
      if (typeof window === "undefined" || !("Notification" in window)) {
        const next = { ...state, isLoading: false, tokenError: true };
        setState(next);
        return next;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        const next = { ...state, isLoading: false, permissionDenied: true };
        setState(next);
        return next;
      }

      // Dynamic imports avoid SSR issues
      const { getMessagingInstance } = await import("@/lib/firebase");
      const { getToken } = await import("firebase/messaging");

      const messaging = getMessagingInstance();
      if (!messaging) {
        const next = { ...state, isLoading: false, tokenError: true };
        setState(next);
        return next;
      }

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      const token = await getToken(messaging, { vapidKey });

      if (!token) {
        const next = { ...state, isLoading: false, tokenError: true };
        setState(next);
        return next;
      }

      const res = await fetch("/api/user/push-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const next = { ...state, isLoading: false, tokenError: true };
        setState(next);
        return next;
      }

      const next = { isLoading: false, token, permissionDenied: false, tokenError: false };
      setState(next);
      return next;
    } catch (error) {
      console.error("Push notification registration failed:", error);
      const next = { ...state, isLoading: false, tokenError: true };
      setState(next);
      return next;
    }
  };

  const clearToken = async (): Promise<void> => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const { getMessagingInstance } = await import("@/lib/firebase");
      const { deleteToken } = await import("firebase/messaging");

      const messaging = getMessagingInstance();
      if (messaging) {
        await deleteToken(messaging);
      }
    } catch (error) {
      console.error("Failed to delete FCM token from browser:", error);
    }

    try {
      await fetch("/api/user/push-token", { method: "DELETE" });
    } catch (error) {
      console.error("Failed to delete FCM token from server:", error);
    }

    setState({ isLoading: false, token: null, permissionDenied: false, tokenError: false });
  };

  return { ...state, requestPermission, clearToken };
}
