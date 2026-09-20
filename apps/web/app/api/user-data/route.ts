import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  getUserAddressesByEmail,
  getUserOrdersByEmail,
} from "@repo/sanity/queries";
import { verifyIsAdmin } from "@repo/auth";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get email from query parameters
    const { searchParams } = new URL(request.url);
    const paramEmail = searchParams.get("email");

    // Fetch user details from Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId).catch(() => null);

    const userEmails =
      clerkUser?.emailAddresses.map((e) => e.emailAddress.toLowerCase().trim()) || [];
    const primaryEmail =
      clerkUser?.emailAddresses[0]?.emailAddress || paramEmail || "";

    const isAdmin = await verifyIsAdmin(userId);

    // If paramEmail is specified and valid/authorized, use it; otherwise fallback to primary email
    let targetEmail = primaryEmail;
    if (paramEmail) {
      const normalizedParam = paramEmail.toLowerCase().trim();
      if (isAdmin || userEmails.includes(normalizedParam)) {
        targetEmail = paramEmail;
      }
    }

    if (!targetEmail) {
      return NextResponse.json({ addresses: [], orders: [] }, { status: 200 });
    }

    // Fetch user data from Sanity
    const [addresses, orders] = await Promise.all([
      getUserAddressesByEmail(targetEmail),
      getUserOrdersByEmail(targetEmail),
    ]);

    return NextResponse.json({
      addresses: addresses || [],
      orders: orders || [],
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
