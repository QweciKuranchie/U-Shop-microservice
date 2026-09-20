import { createServerClient } from "@repo/supabase/server";
import { client, writeClient } from "@repo/sanity";
import { SELLER_STORE_QUERY, SELLER_ORDER_OWNERSHIP_QUERY } from "@repo/sanity/queries";
import { NextRequest, NextResponse } from "next/server";

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

  const body = await request.json();
  const updated = await writeClient.patch(orderId).set(body).commit();
  return NextResponse.json({ order: updated });
}