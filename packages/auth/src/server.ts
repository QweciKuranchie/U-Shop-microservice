import { auth, clerkClient } from "@clerk/nextjs/server";
import { client } from "@repo/sanity/client";

/**
 * Validates whether the given Clerk user ID or email belongs to an authorized Administrator.
 */
export async function verifyIsAdmin(clerkUserId?: string | null): Promise<boolean> {
  try {
    if (!clerkUserId) {
      const session = await auth();
      clerkUserId = session.userId;
    }

    if (!clerkUserId) {
      return false;
    }

    // 1. Fetch user from Clerk
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId).catch(() => null);

    if (!clerkUser) {
      return false;
    }

    // 2. Check Clerk Public/Private Metadata for 'admin' role
    const publicMetadata = (clerkUser.publicMetadata || {}) as Record<string, unknown>;
    const privateMetadata = (clerkUser.privateMetadata || {}) as Record<string, unknown>;

    if (
      publicMetadata.role === "admin" ||
      publicMetadata.isAdmin === true ||
      privateMetadata.role === "admin" ||
      privateMetadata.isAdmin === true
    ) {
      return true;
    }

    // 3. Check environment-configured admin emails
    const userEmails = clerkUser.emailAddresses.map((e) => e.emailAddress.toLowerCase().trim());
    const configuredAdminEmails = [
      process.env.ADMIN_EMAIL,
      process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      ...(process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",") : []),
      "support@ushopgh.com",
      "admin@ushopgh.com",
    ]
      .filter((e): e is string => Boolean(e))
      .map((e) => e.toLowerCase().trim());

    const hasMatchingAdminEmail = userEmails.some((userEmail) =>
      configuredAdminEmails.includes(userEmail)
    );

    if (hasMatchingAdminEmail) {
      return true;
    }

    // 4. Check Sanity User Record
    const sanityUser = await client.fetch(
      `*[_type == "user" && clerkUserId == $clerkUserId][0]{
        isAdmin,
        role,
        email
      }`,
      { clerkUserId }
    ).catch(() => null);

    if (
      sanityUser &&
      (sanityUser.isAdmin === true ||
        sanityUser.role === "admin" ||
        (sanityUser.email && configuredAdminEmails.includes(sanityUser.email.toLowerCase().trim())))
    ) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error verifying admin status:", error);
    return false;
  }
}

/**
 * Enforces admin authorization in server actions or route handlers.
 * Throws or returns unauthorized response if the user is not an admin.
 */
export async function requireAdmin(): Promise<{ userId: string; isAdmin: boolean }> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized: Please log in");
  }

  const isAdmin = await verifyIsAdmin(userId);
  if (!isAdmin) {
    throw new Error("Forbidden: Administrator access required");
  }

  return { userId, isAdmin: true };
}
