import { createServerClient } from "@repo/supabase/server";
import { client } from "@repo/sanity";
import { SELLER_STORE_QUERY, SELLER_ORDERS_QUERY } from "@repo/sanity/queries";
import { NextResponse } from "next/server";

interface Order {
  _id: string;
  _createdAt: string;
  totalAmount: number;
}

/**
 * Aggregates order revenue into 7 daily buckets for the last 7 days.
 * Returns an array of { name: string, revenue: number } with exactly 7 entries.
 */
export function aggregateWeeklyRevenue(
  orders: Order[]
): Array<{ name: string; revenue: number }> {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const buckets: Array<{ name: string; revenue: number }> = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayRevenue = orders
      .filter((order) => {
        const orderDate = new Date(order._createdAt);
        return orderDate >= date && orderDate < nextDate;
      })
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    buckets.push({
      name: dayNames[date.getDay()],
      revenue: dayRevenue,
    });
  }

  return buckets;
}

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await client.fetch(SELLER_STORE_QUERY, { userId: user.id });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const orders = await client.fetch(SELLER_ORDERS_QUERY, { storeId: store._id });
  const weeklyRevenue = aggregateWeeklyRevenue(orders || []);

  return NextResponse.json({ weeklyRevenue });
}