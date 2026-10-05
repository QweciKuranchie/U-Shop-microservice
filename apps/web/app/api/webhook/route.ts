import { NextRequest, NextResponse, after } from "next/server";
import { verifyPaystackSignature } from "@/lib/validators";
import { verifyChargeAgainstOrder } from "@/lib/payments/chargeVerification";
import {
  fetchOrderForPayment,
  markOrderPaid,
  runPaidSideEffects,
} from "@/lib/payments/markOrderPaid";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is not configured for webhook");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // 1. Authenticity: HMAC-SHA512 over the raw body (constant-time compare).
    if (!verifyPaystackSignature(rawBody, signature, secretKey)) {
      console.warn("Paystack webhook HMAC signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const { orderId } = event.data?.metadata || {};
    if (!orderId) {
      console.warn("Paystack webhook received charge.success without orderId in metadata");
      return NextResponse.json({ received: true, warning: "Missing orderId in metadata" }, { status: 200 });
    }

    const order = await fetchOrderForPayment(orderId);
    if (!order) {
      console.warn("Order not found in Sanity for webhook:", orderId);
      return NextResponse.json({ received: true, warning: "Order not found" }, { status: 200 });
    }

    // 2. Integrity: the money received must be THIS order's total, in GHS.
    //    Mismatches are acknowledged (200) so Paystack stops retrying, left
    //    unpaid, and logged loudly for reconciliation — never silently "paid".
    const check = verifyChargeAgainstOrder(order, event.data);
    if (!check.ok) {
      console.error("Paystack webhook charge rejected", {
        orderId,
        reference: event.data?.reference,
        reason: check.reason,
        expectedPesewas: "expectedPesewas" in check ? check.expectedPesewas : undefined,
        receivedPesewas: "receivedPesewas" in check ? check.receivedPesewas : undefined,
      });
      return NextResponse.json({ received: true, warning: check.reason }, { status: 200 });
    }

    // 3. Atomic transition. A Sanity failure here MUST surface as 500 so Paystack retries.
    const { transitioned } = await markOrderPaid(orderId, {
      reference: event.data.reference,
      transactionId: event.data.id,
      amountPesewas: check.amountPesewas,
      rawPayload: rawBody,
    });

    if (!transitioned) {
      return NextResponse.json({ received: true, alreadyPaid: true }, { status: 200 });
    }

    // 4. Side effects run once, after the response is sent.
    after(() => runPaidSideEffects(order));

    return NextResponse.json({ received: true, processed: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error processing Paystack webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
