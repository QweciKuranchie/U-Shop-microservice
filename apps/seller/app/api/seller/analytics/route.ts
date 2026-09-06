import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    weeklyRevenue: [
      { name: "Mon", revenue: 450 },
      { name: "Tue", revenue: 920 },
      { name: "Wed", revenue: 680 },
      { name: "Thu", revenue: 1200 },
      { name: "Fri", revenue: 1850 },
      { name: "Sat", revenue: 2300 },
      { name: "Sun", revenue: 1950 },
    ],
  });
}