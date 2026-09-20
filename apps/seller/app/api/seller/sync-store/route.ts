import { createAdminClient } from "@repo/supabase/admin";
import { syncStoreToSanity } from "@/lib/kyc-sync";
import { backendClient } from "@repo/sanity";
import type { Store, Seller, KycSubmission } from "@repo/supabase/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Optional token validation
    if (authHeader && serviceKey && !authHeader.includes(serviceKey)) {
      // Optional check
    }

    const body = await request.json();
    const { sellerId, storeId, action } = body;

    if (!sellerId && !storeId) {
      return NextResponse.json(
        { error: "sellerId or storeId is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch store
    let store: Store | null = null;
    if (storeId) {
      const { data } = await supabase.from("stores").select("*").eq("id", storeId).maybeSingle();
      store = data as Store | null;
    } else if (sellerId) {
      const { data } = await supabase.from("stores").select("*").eq("seller_id", sellerId).maybeSingle();
      store = data as Store | null;
    }

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Fetch seller
    const { data: sellerData } = await supabase
      .from("sellers")
      .select("*")
      .eq("id", store.seller_id)
      .maybeSingle();

    const seller = sellerData as Seller | null;
    if (!seller) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 });
    }

    // Fetch latest KYC submission
    const { data: kycData } = await supabase
      .from("kyc_submissions")
      .select("*")
      .eq("seller_id", seller.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const kyc = kycData as KycSubmission | null;

    if (action === "approve") {
      // 1. Update Supabase records
      await (supabase.from("stores") as any)
        .update({ status: "active", updated_at: new Date().toISOString() })
        .eq("id", store.id);

      await (supabase.from("sellers") as any)
        .update({ status: "active", updated_at: new Date().toISOString() })
        .eq("id", seller.id);

      if (kyc?.id) {
        await (supabase.from("kyc_submissions") as any)
          .update({
            status: "approved",
            reviewed_at: new Date().toISOString(),
            reviewed_by: body.reviewedBy || "admin",
          })
          .eq("id", kyc.id);
      }

      // 2. Sync to Sanity as active store
      const sanityStoreId = await syncStoreToSanity({
        storeId: store.id,
        sellerId: seller.id,
        supabaseUserId: seller.auth_user_id,
        name: store.name,
        slug: store.slug,
        ownerName: store.owner_name,
        sellerType: seller.seller_type,
        phone: seller.phone || "",
        email: seller.email,
        location: store.location || undefined,
        description: store.description || undefined,
        nationalIdNumber: kyc?.national_id_number || undefined,
        businessName: kyc?.business_name || undefined,
        businessRegistrationNumber: kyc?.registration_number || undefined,
        university: kyc?.university || undefined,
        studentIdNumber: kyc?.student_id_number || undefined,
        studentEmail: kyc?.student_email || undefined,
      });

      if (sanityStoreId) {
        // Mark active and verified in Sanity
        await backendClient
          .patch(sanityStoreId)
          .set({
            status: "active",
            kycStatus: "approved",
            verifiedSeller: true,
            verifiedStudent: seller.seller_type === "student",
          })
          .commit();

        await (supabase.from("stores") as any)
          .update({ sanity_store_id: sanityStoreId })
          .eq("id", store.id);
      }

      return NextResponse.json({
        success: true,
        message: "Seller approved and synced to Sanity",
        sanityStoreId,
      });
    } else if (action === "reject") {
      const reason = body.reason || "KYC verification documents could not be verified.";

      await (supabase.from("stores") as any)
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", store.id);

      await (supabase.from("sellers") as any)
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("id", seller.id);

      if (kyc?.id) {
        await (supabase.from("kyc_submissions") as any)
          .update({
            status: "rejected",
            rejection_reason: reason,
            reviewed_at: new Date().toISOString(),
            reviewed_by: body.reviewedBy || "admin",
          })
          .eq("id", kyc.id);
      }

      return NextResponse.json({
        success: true,
        message: "Seller KYC marked rejected",
      });
    }

    return NextResponse.json({ error: "Invalid action. Use 'approve' or 'reject'." }, { status: 400 });
  } catch (err: unknown) {
    console.error("Store sync error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
