import { createServerClient } from "@repo/supabase/server";
import { client, writeClient } from "@repo/sanity";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Check Supabase stores table first
  const { data: seller } = await supabase
    .from("sellers")
    .select("id, seller_type, status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (seller) {
    const { data: store } = await supabase
      .from("stores")
      .select("*")
      .eq("seller_id", seller.id)
      .maybeSingle();

    if (store) {
      return NextResponse.json({ store });
    }
  }

  // 2. Fallback to Sanity store
  const sanityStore = await client.fetch(
    `*[_type == "store" && (supabaseUserId == $userId || clerkUserId == $userId)][0]`,
    { userId: user.id }
  );
  return NextResponse.json({ store: sanityStore });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  // Update in Supabase stores table if exists
  const { data: seller } = await supabase
    .from("sellers")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (seller) {
    await supabase
      .from("stores")
      .update({
        name: body.name,
        description: body.description,
        location: body.location,
        updated_at: new Date().toISOString(),
      })
      .eq("seller_id", seller.id);
  }

  // Update in Sanity if document exists
  const store = await client.fetch(
    `*[_type == "store" && (supabaseUserId == $userId || clerkUserId == $userId)][0]{ _id }`,
    { userId: user.id }
  );

  if (store?._id) {
    const updated = await writeClient.patch(store._id).set(body).commit();
    return NextResponse.json({ store: updated });
  }

  return NextResponse.json({ success: true });
}