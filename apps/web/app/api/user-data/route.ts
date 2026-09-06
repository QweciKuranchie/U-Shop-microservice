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
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Verify user owns this email or is an admin (prevents IDOR)
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId).catch(() => null);
    const userEmails = clerkUser?.emailAddresses.map((e) => e.emailAddress.toLowerCase()) || [];
    const isAdmin = await verifyIsAdmin(userId);

    if (!isAdmin && !userEmails.includes(email.toLowerCase().trim())) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to view this user's data" },
        { status: 403 }
      );
    }

    // Fetch user data from Sanity
    const [addresses, orders] = await Promise.all([
      getUserAddressesByEmail(email),
      getUserOrdersByEmail(email),
    ]);

    return NextResponse.json({
      addresses,
      orders,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
