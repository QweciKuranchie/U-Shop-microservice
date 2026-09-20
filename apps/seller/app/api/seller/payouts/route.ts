import { auth } from "@clerk/nextjs/server";
import { client } from "@repo/sanity";
import { SELLER_STORE_QUERY } from "@repo/sanity/queries";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await client.fetch(SELLER_STORE_QUERY, { userId });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Query Sanity for payout/transaction documents scoped to this store
  const payouts = await client.fetch(
    `*[_type == "payout" && store._ref == $storeId] | order(_createdAt desc){
      _id, _createdAt, amount, status, method, reference
    }`,
    { storeId: store._id }
  );

  if (!payouts || payouts.length === 0) {
    return NextResponse.json({
      balance: 0,
      pending: 0,
      payouts: [],
    });
  }

  // Aggregate balance and pending from real payout data
  const balance = payouts
    .filter((p: { status?: string }) => p.status === "completed")
    .reduce((sum: number, p: { amount?: number }) => sum + (p.amount || 0), 0);

  const pending = payouts
    .filter((p: { status?: string }) => p.status === "pending")
    .reduce((sum: number, p: { amount?: number }) => sum + (p.amount || 0), 0);

  return NextResponse.json({
    balance,
    pending,
    payouts,
  });
}