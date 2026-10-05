import { NextRequest, NextResponse, after } from "next/server";
import { verifyChargeAgainstOrder } from "@/lib/payments/chargeVerification";
import {
  fetchOrderForPayment,
  markOrderPaid,
  runPaidSideEffects,
} from "@/lib/payments/markOrderPaid";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  const fail = (reason: string) =>
    NextResponse.redirect(
      new URL(
        `/checkout/payment-failed?${reference ? `reference=${encodeURIComponent(reference)}&` : ""}reason=${encodeURIComponent(reason)}`,
        baseUrl
      )
    );

  if (!reference) return fail("missing_reference");

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error("PAYSTACK_SECRET_KEY is not set in callback");
    return fail("internal_error");
  }

  try {
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${secretKey}` },
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      }
    );
    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.status || verifyData.data?.status !== "success") {
      const reason = verifyData?.data?.status || verifyData?.message || "verification_failed";
      console.warn("Paystack callback verification failed:", { reference, reason });
      return fail(reason);
    }

    const { orderId, orderNumber, channel } = verifyData.data.metadata || {};

    if (orderId) {
      const order = await fetchOrderForPayment(orderId);

      if (order) {
        // Same integrity gate as the webhook: right order, right amount, right currency.
        const check = verifyChargeAgainstOrder(order, verifyData.data);
        if (!check.ok) {
          console.error("Paystack callback charge rejected", { orderId, reference, reason: check.reason });
          return fail(check.reason);
        }

        // Shared, atomic transition. Whichever of {callback, webhook} wins runs the
        // side effects exactly once, so the confirmation email/notification can no
        // longer be skipped just because the browser redirect arrived first.
        const { transitioned } = await markOrderPaid(orderId, {
          reference,
          transactionId: verifyData.data.id,
          amountPesewas: check.amountPesewas,
        }).catch((error) => {
          // Best-effort here: the webhook is the authoritative retrying path.
          console.error("Callback markOrderPaid failed (webhook will reconcile):", error);
          return { transitioned: false };
        });

        if (transitioned) after(() => runPaidSideEffects(order));
      }
    }

    const successParams = new URLSearchParams({
      order_id: orderId || "",
      orderNumber: orderNumber || "",
      payment_method: channel || "card",
    });
    return NextResponse.redirect(new URL(`/success?${successParams.toString()}`, baseUrl));
  } catch (error) {
    console.error("Error in Paystack callback:", error);
    return fail("verification_failed");
  }
}
