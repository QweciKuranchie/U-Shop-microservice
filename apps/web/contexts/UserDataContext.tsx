"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth, useUser } from "@clerk/nextjs";

interface UserData {
  ordersCount: number;
  unreadNotifications: number;
  walletBalance: number;
  isLoading: boolean;
}

interface UserDataContextType extends UserData {
  refreshUserData: () => Promise<void>;
}

const EMPTY: UserData = { ordersCount: 0, unreadNotifications: 0, walletBalance: 0, isLoading: false };
const CACHE_DURATION = 30_000;

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id;
  const [userData, setUserData] = useState<UserData>(EMPTY);

  // Cache is keyed by user id and lives with the provider. It used to be a
  // module-level variable shared by whoever was signed in, so switching accounts
  // within 30s could show the previous account's wallet balance.
  const cache = useRef<{ userId: string; data: UserData; at: number } | null>(null);

  const fetchUserData = useCallback(
    async (forceRefresh = false, signal?: AbortSignal) => {
      if (!userId || !isLoaded) return;

      const hit = cache.current;
      if (!forceRefresh && hit && hit.userId === userId && Date.now() - hit.at < CACHE_DURATION) {
        setUserData(hit.data);
        return;
      }

      setUserData((prev) => ({ ...prev, isLoading: true }));
      try {
        const token = await getToken().catch(() => null);
        const response = await fetch("/api/user/combined-data", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
          signal,
        });

        if (!response.ok) {
          setUserData((prev) => ({ ...prev, isLoading: false }));
          return;
        }
        const data = await response.json();
        const next: UserData = {
          ordersCount: data.ordersCount || 0,
          unreadNotifications: data.unreadNotifications || 0,
          walletBalance: data.walletBalance || 0,
          isLoading: false,
        };
        cache.current = { userId, data: next, at: Date.now() };
        setUserData(next);
      } catch (error) {
        if ((error as Error).name === "AbortError") return; // unmounted / user changed
        console.error("Error fetching user data:", error);
        setUserData((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [userId, isLoaded, getToken]
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      cache.current = null;
      setUserData(EMPTY);
      return;
    }
    const controller = new AbortController();
    fetchUserData(false, controller.signal);
    return () => controller.abort();
  }, [userId, isLoaded, fetchUserData]);

  const refreshUserData = useCallback(() => fetchUserData(true), [fetchUserData]);

  // Stable identity: consumers re-render only when the data actually changes,
  // not on every provider render.
  const value = useMemo(() => ({ ...userData, refreshUserData }), [userData, refreshUserData]);

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
}
