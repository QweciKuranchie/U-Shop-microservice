"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

/**
 * ClerkAuthFetchInterceptor seamlessly attaches the Clerk Bearer token to all
 * client-side fetch calls destined for /api/* endpoints.
 * This guarantees that API calls succeed in environments where browsers block
 * third-party cookies (e.g. Clerk dev keys on custom production domains).
 */
export function ClerkAuthFetchInterceptor() {
  const { getToken } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;

    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      try {
        let url = "";
        if (typeof input === "string") {
          url = input;
        } else if (input instanceof URL) {
          url = input.href;
        } else if (input && typeof input === "object" && "url" in input) {
          url = (input as Request).url;
        }

        // Only attach for internal API endpoints
        const isInternalApi =
          url.startsWith("/api/") ||
          url.startsWith(`${window.location.origin}/api/`) ||
          url.includes("/api/user") ||
          url.includes("/api/orders");

        if (isInternalApi) {
          let hasAuth = false;
          if (init?.headers) {
            if (init.headers instanceof Headers) {
              hasAuth = init.headers.has("Authorization");
            } else if (Array.isArray(init.headers)) {
              hasAuth = init.headers.some(([k]) => k.toLowerCase() === "authorization");
            } else {
              hasAuth = Boolean(
                (init.headers as Record<string, string>)["Authorization"] ||
                (init.headers as Record<string, string>)["authorization"]
              );
            }
          }

          if (!hasAuth) {
            const token = await getToken().catch(() => null);
            if (token) {
              const newHeaders = new Headers(init?.headers);
              newHeaders.set("Authorization", `Bearer ${token}`);
              return originalFetch.call(window, input, {
                ...init,
                headers: newHeaders,
              });
            }
          }
        }
      } catch (err) {
        console.warn("ClerkAuthFetchInterceptor error:", err);
      }

      return originalFetch.call(window, input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [getToken]);

  return null;
}
