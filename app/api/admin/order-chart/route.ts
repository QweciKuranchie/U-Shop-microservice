import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { auth } from "@clerk/nextjs/server";
import { verifyIsAdmin } from "@/lib/adminAuth";

interface SanityOrderForChart {
  totalPrice?: number;
  amount?: number;
  status?: string;
  orderDate?: string;
  _createdAt?: string;
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyIsAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const orders: SanityOrderForChart[] = await client.fetch(
      `*[_type == "order"] {
        totalPrice,
        amount,
        status,
        orderDate,
        _createdAt
      }`
    );

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const currentMonthIndex = new Date().getMonth();
    // Get last 6 months
    const last6Months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      last6Months.push(months[idx]);
    }

    const chartDataMap: Record<string, { total: number; successful: number }> = {};
    last6Months.forEach((m) => {
      chartDataMap[m] = { total: 0, successful: 0 };
    });

    orders.forEach((ord: SanityOrderForChart) => {
      const dateStr = ord.orderDate || ord._createdAt;
      if (!dateStr) return;
      const date = new Date(dateStr);
      const monthName = months[date.getMonth()];
      if (chartDataMap[monthName]) {
        const amt = ord.totalPrice !== undefined ? ord.totalPrice : (ord.amount ? ord.amount / 100 : 0);
        chartDataMap[monthName].total += amt;
        if (ord.status === "delivered" || ord.status === "paid" || ord.status === "success" || ord.status === "completed") {
          chartDataMap[monthName].successful += amt;
        }
      }
    });

    const chartData = last6Months.map((month) => {
      const data = chartDataMap[month];
      return {
        month,
        total: Math.round(data.total),
        successful: Math.round(data.successful),
      };
    });

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Error generating order chart data:", error);
    return NextResponse.json([], { status: 500 });
  }
}
