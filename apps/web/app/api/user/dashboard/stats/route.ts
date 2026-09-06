import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import type { SanityNotificationItem, SanityOrder } from "@repo/sanity/queries";
import { getUserOrders, getUserWishlist, getUserNotifications } from "@repo/sanity/queries";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const [userOrders, userWishlist, userNotifications] =
      await Promise.all([
        getUserOrders(user.id),
        getUserWishlist(user.id),
        getUserNotifications(user.id),
      ]);

    // Calculate stats from real data
    const stats = {
      ordersCount: userOrders?.length || 0,
      wishlistCount: userWishlist?.length || 0,
      notificationsCount: userNotifications?.length || 0,
      unreadNotifications:
        userNotifications?.filter((n: SanityNotificationItem) => !n.read)?.length || 0,
    };

    // Create recent activity from real data
    const recentActivity = [];

    // Add recent orders to activity
    if (userOrders && userOrders.length > 0) {
      const recentOrders = userOrders
        .sort(
          (a: SanityOrder, b: SanityOrder) =>
            new Date(b.orderDate || b._createdAt || 0).getTime() -
            new Date(a.orderDate || a._createdAt || 0).getTime()
        )
        .slice(0, 2);

      recentOrders.forEach((order: SanityOrder) => {
        recentActivity.push({
          id: `order-${order._id}`,
          title: `Order ${
            order.status === "delivered"
              ? "Delivered"
              : order.status === "shipped"
              ? "Shipped"
              : "Placed"
          }`,
          description: `Order #${order.orderNumber} ${
            order.status === "delivered"
              ? "has been delivered"
              : order.status === "shipped"
              ? "has been shipped"
              : "has been placed successfully"
          }`,
          timestamp: order.orderDate || order._createdAt || new Date().toISOString(),
          type: "order" as const,
        });
      });
    }

    // Add recent wishlist items to activity
    if (userWishlist && userWishlist.length > 0) {
      const recentWishlistItem = userWishlist[0];
      if (recentWishlistItem) {
        recentActivity.push({
          id: `wishlist-${recentWishlistItem._id}`,
          title: "Item Added to Wishlist",
          description: `Added ${recentWishlistItem.name} to your wishlist`,
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // Approximate time
          type: "wishlist" as const,
        });
      }
    }

    // Add recent notifications to activity
    if (userNotifications && userNotifications.length > 0) {
      const recentNotifications = userNotifications
        .sort(
          (a: SanityNotificationItem, b: SanityNotificationItem) =>
            new Date(b.sentAt || b._createdAt || 0).getTime() - new Date(a.sentAt || a._createdAt || 0).getTime()
        )
        .slice(0, 1);

      recentNotifications.forEach((notification: SanityNotificationItem) => {
        const msg = notification.message || "";
        recentActivity.push({
          id: `notification-${notification.id || notification._id}`,
          title: notification.title || "Notification",
          description:
            msg.length > 80
              ? msg.substring(0, 80) + "..."
              : msg,
          timestamp: notification.sentAt || notification._createdAt || new Date().toISOString(),
          type: "notification" as const,
        });
      });
    }

    // Sort activity by timestamp (newest first) and limit to 4 items
    recentActivity.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const limitedActivity = recentActivity.slice(0, 4);

    return NextResponse.json({
      success: true,
      stats,
      recentActivity: limitedActivity,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
