import { NextRequest } from "next/server";
import { auth, currentUser, clerkClient, verifyToken } from "@clerk/nextjs/server";

export type ClerkUser = Awaited<ReturnType<typeof currentUser>>;

/**
 * Robustly extracts the authenticated user from standard Clerk cookies,
 * with automatic fallback to verifying the Authorization Bearer header token.
 * This ensures API calls succeed even if browsers block third-party cookies
 * when running development keys on custom production domains.
 */
export async function getAuthUser(request?: NextRequest | Request): Promise<{
  userId: string | null;
  user: ClerkUser;
}> {
  try {
    // 1. Try standard Clerk cookies first
    const { userId: cookieUserId } = await auth();
    if (cookieUserId) {
      const user = await currentUser();
      return { userId: cookieUserId, user };
    }

    // 2. Fallback to Authorization Bearer header
    if (request) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "").trim();
        const secretKey = process.env.CLERK_SECRET_KEY;
        if (token && secretKey) {
          const verified = await verifyToken(token, { secretKey }).catch(() => null);
          if (verified?.sub) {
            let user: ClerkUser = null;
            try {
              const client = await clerkClient();
              user = (await client.users.getUser(verified.sub)) as unknown as ClerkUser;
            } catch (userErr) {
              console.warn("getAuthUser: verified sub but failed to fetch user record", userErr);
            }
            return { userId: verified.sub, user };
          }
        }
      }
    }

    return { userId: null, user: null };
  } catch (err) {
    console.error("Error in getAuthUser:", err);
    return { userId: null, user: null };
  }
}
