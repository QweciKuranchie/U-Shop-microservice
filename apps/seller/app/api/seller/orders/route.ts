import { auth } from "@clerk/nextjs/server";
import { client } from "@repo/sanity";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await client.fetch(`*[_type == "order"] | order(_createdAt desc)[0...50]`);
  return NextResponse.json({ orders });
}