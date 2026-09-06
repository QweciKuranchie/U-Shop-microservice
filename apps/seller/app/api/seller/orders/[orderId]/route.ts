import { auth } from "@clerk/nextjs/server";
import { writeClient } from "@repo/sanity";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId } = await params;
  const body = await request.json();

  const updated = await writeClient.patch(orderId).set(body).commit();
  return NextResponse.json({ order: updated });
}