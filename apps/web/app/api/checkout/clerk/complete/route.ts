import { NextResponse } from "next/server";

/**
 * DISABLED. This endpoint used to mark ANY order (no ownership check) as paid
 * from a client-supplied `status: "completed"`, with no payment taking place — a
 * leftover from a simulated "Clerk payment" flow that nothing in the real
 * checkout uses. Real payments are confirmed only by Paystack (webhook/callback)
 * after amount verification. Mirrors the already-disabled /api/orders/[id]/pay.
 */
export async function POST() {
  return NextResponse.json({ error: "This payment method is not available." }, { status: 501 });
}
