import { createServerClient } from "@repo/supabase/server";
import { client, writeClient } from "@repo/sanity";
import { SELLER_STORE_QUERY, SELLER_ORDER_OWNERSHIP_QUERY } from "@repo/sanity/queries";
import { NextRequest, NextResponse } from "next/server";
import { pickAllowedFields } from "@repo/utils";

// Sellers may only advance fulfilment. They must never touch payment, totals,
// ownership or any other order field (previously the whole body was `set` as-is).
const SELLER_ORDER_FIELDS = ["orderStatus", "status"] as const;
const SELLER_FULFILMENT_STATUSES = new Set(["processing", "shipped", "out_for_delivery", "delivered"]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const store = await client.fetch(SELLER_STORE_QUERY, { userId: user.id });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const { orderId } = await params;

  const ownershipCheck = await client.fetch(SELLER_ORDER_OWNERSHIP_QUERY, {
    orderId,
    storeId: store._id,
  });
  if (!ownershipCheck) {
    return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  }

  const updates = pickAllowedFields(await request.json().catch(() => null), SELLER_ORDER_FIELDS);
  if (!updates || Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No permitted fields to update" }, { status: 400 });
  }
  for (const value of Object.values(updates)) {
    if (typeof value !== "string" || !SELLER_FULFILMENT_STATUSES.has(value)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
  }
  const updated = await writeClient.patch(orderId).set(updates).commit();
  return NextResponse.json({ order: updated });
}