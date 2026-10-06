import { NextRequest, NextResponse } from "next/server";
import { checkRateLimitByKey } from "@repo/utils/rate-limit";
import { getAuthUser } from "@/lib/getAuthUser";
import { payOrderWithWallet } from "@/lib/wallet/walletService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { userId } = await getAuthUser(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = await checkRateLimitByKey(userId, "orders:pay-wallet", { limit: 10, windowMs: 60_000 });
    if (limited) return limited;

    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Debit + mark-paid happen in one revision-guarded Sanity transaction.
    const result = await payOrderWithWallet(userId, orderId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment processed successfully",
        newBalance: result.newBalance,
        orderId: result.orderId,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
