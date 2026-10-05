import { createServerClient } from "@repo/supabase/server";
import { client, writeClient } from "@repo/sanity";
import { SELLER_STORE_QUERY } from "@repo/sanity/queries";
import { NextRequest, NextResponse } from "next/server";
import { omitProtectedFields } from "@repo/utils";

// Fields a seller must not set on their own listing: ownership, merchandising
// controlled by U-Shop, and review-derived aggregates.
const PROTECTED_PRODUCT_FIELDS = ["store", "featured", "averageRating", "totalReviews", "ratingDistribution"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

  const { id } = await params;

  // Verify the product belongs to the seller's store
  const product = await client.fetch(
    `*[_type == "product" && _id == $id && store._ref == $storeId][0]{ _id }`,
    { id, storeId: store._id }
  );
  if (!product) {
    return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  }

  const updates = omitProtectedFields(await request.json().catch(() => null), PROTECTED_PRODUCT_FIELDS);
  if (!updates || Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No permitted fields to update" }, { status: 400 });
  }
  const updated = await writeClient.patch(id).set(updates).commit();
  return NextResponse.json({ product: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

  const { id } = await params;

  // Verify the product belongs to the seller's store
  const product = await client.fetch(
    `*[_type == "product" && _id == $id && store._ref == $storeId][0]{ _id }`,
    { id, storeId: store._id }
  );
  if (!product) {
    return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
  }

  await writeClient.delete(id);
  return NextResponse.json({ success: true });
}