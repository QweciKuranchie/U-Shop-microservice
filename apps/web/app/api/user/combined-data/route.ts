import { NextRequest, NextResponse } from "next/server";
import { client } from "@repo/sanity";
import { getAuthUser } from "@/lib/getAuthUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Combined API endpoint to fetch all user data in a single request
 * Optimized for Next.js 16 and React 19
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await getAuthUser(request);

    if (!userId) {
      return NextResponse.json(
        {
          user: null,
          ordersCount: 0,
          unreadNotifications: 0,
          walletBalance: 0,
          preferences: {},
          authenticated: false,
        },
        { status: 200 }
      );
    }

    // Fetch user data (including preferences and embedded unread notifications count) and orders count
    const [userData, orders] = await Promise.all([
      client.fetch(
        `*[_type == "user" && clerkUserId == $userId][0]{
          _id,
          email,
          role,
          walletBalance,
          preferences,
          "unreadCount": count(notifications[read == false])
        }`,
        { userId }
      ),
      client.fetch(
        `count(*[_type == "order" && (clerkUserId == $userId || userId == $userId)])`,
        { userId }
      ),
    ]);

    return NextResponse.json(
      {
        user: userData
          ? {
              _id: userData._id,
              email: userData.email,
              role: userData.role,
              walletBalance: userData.walletBalance,
            }
          : null,
        ordersCount: orders || 0,
        unreadNotifications: userData?.unreadCount || 0,
        walletBalance: userData?.walletBalance || 0,
        preferences: userData?.preferences || {},
        authenticated: true,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching combined user data:", error);
    return NextResponse.json(
      {
        user: null,
        ordersCount: 0,
        unreadNotifications: 0,
        walletBalance: 0,
        preferences: {},
        authenticated: false,
      },
      { status: 200 }
    );
  }
}
