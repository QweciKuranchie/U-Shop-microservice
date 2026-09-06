import { auth } from "@clerk/nextjs/server";
import { client, writeClient } from "@repo/sanity";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await client.fetch(`*[_type == "store" && clerkUserId == $userId][0]`, { userId });
  return NextResponse.json({ store });
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await client.fetch(`*[_type == "store" && clerkUserId == $userId][0]{ _id }`, { userId });
  if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

  const body = await request.json();
  const updated = await writeClient.patch(store._id).set(body).commit();
  return NextResponse.json({ store: updated });
}