import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

export interface MiddlewareConfig {
  /** Glob patterns for routes that require authentication */
  protectedRoutes: string[];
  /**
   * Optional extra check after Clerk authentication passes.
   * Return a NextResponse redirect to block the request (e.g. store-existence check).
   */
  afterAuth?: (
    auth: { userId: string },
    req: NextRequest
  ) => Promise<Response | null>;
}

/**
 * Factory that produces a Clerk middleware configured for the calling app.
 */
export function createMiddleware(config: MiddlewareConfig | string[]) {
  const normalizedConfig: MiddlewareConfig = Array.isArray(config)
    ? { protectedRoutes: config }
    : config;

  const isProtected = createRouteMatcher(normalizedConfig.protectedRoutes);

  return clerkMiddleware(async (auth, req) => {
    if (isProtected(req)) {
      await auth.protect();

      if (normalizedConfig.afterAuth) {
        const { userId } = await auth();
        if (userId) {
          const redirect = await normalizedConfig.afterAuth({ userId }, req);
          if (redirect) return redirect;
        }
      }
    }
  });
}
