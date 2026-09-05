import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { verifyIsAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyIsAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const client = await clerkClient();
    const response = await client.users.getUserList({
      limit,
      offset,
    });

    const totalCount = response.totalCount ?? response.data.length;

    return NextResponse.json({
      data: response.data,
      totalCount,
    });
  } catch (error: unknown) {
    console.error("Error fetching Clerk users:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch users";
    return NextResponse.json(
      { error: message, data: [], totalCount: 0 },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyIsAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { firstName, lastName, username, emailAddress, password } = body;

    const client = await clerkClient();
    const newUser = await client.users.createUser({
      firstName,
      lastName,
      username,
      emailAddress: Array.isArray(emailAddress) ? emailAddress : [emailAddress],
      password,
    });

    return NextResponse.json({
      success: true,
      user: newUser,
    });
  } catch (error: unknown) {
    console.error("Error creating Clerk user:", error);
    const message = error instanceof Error ? error.message : "Failed to create user";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
