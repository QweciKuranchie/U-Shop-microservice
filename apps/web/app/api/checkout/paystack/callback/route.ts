import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  // If reference is missing, redirect to payment-failed
  if (!reference) {
    return NextResponse.redirect(
      new URL("/checkout/payment-failed?reason=missing_reference", baseUrl)
    );
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error("PAYSTACK_SECRET_KEY is not set in callback");
    return NextResponse.redirect(
      new URL(
        `/checkout/payment-failed?reference=${encodeURIComponent(reference)}&reason=internal_error`,
        baseUrl
      )
    );
  }

  try {
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        cache: "no-store",
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok || !verifyData.status || verifyData.data?.status !== "success") {
      const reason = verifyData?.data?.status || verifyData?.message || "verification_failed";
      console.warn("Paystack callback verification failed:", { reference, reason });
      return NextResponse.redirect(
        new URL(
          `/checkout/payment-failed?reference=${encodeURIComponent(reference)}&reason=${encodeURIComponent(reason)}`,
          baseUrl
        )
      );
    }

    const { orderId, orderNumber, channel } = verifyData.data.metadata || {};

    // Best-effort Sanity patch (non-blocking for redirect, webhook is authoritative)
    if (orderId) {
      try {
        await writeClient
          .patch(orderId)
          .set({
            paymentStatus: "paid",
            orderStatus: "processing",
            paystackReference: reference,
            paystackTransactionId: String(verifyData.data.id),
          })
          .commit();
      } catch (patchError) {
        console.error(
          "Best-effort Sanity patch failed in callback (webhook will reconcile):",
          patchError
        );
      }
    }

    const successParams = new URLSearchParams({
      order_id: orderId || "",
      orderNumber: orderNumber || "",
      payment_method: channel || "card",
    });

    return NextResponse.redirect(
      new URL(`/success?${successParams.toString()}`, baseUrl)
    );
  } catch (error) {
    console.error("Error in Paystack callback:", error);
    return NextResponse.redirect(
      new URL(
        `/checkout/payment-failed?reference=${encodeURIComponent(reference)}&reason=verification_failed`,
        baseUrl
      )
    );
  }
}
