import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { verifyPaystackSignature } from "@/lib/validators";
import { sendOrderConfirmationEmail } from "@/lib/emailService";
import { sendOrderStatusNotification } from "@/lib/notificationService";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is not configured for webhook");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // 1. Verify HMAC-SHA512 signature
    const isValid = verifyPaystackSignature(rawBody, signature, secretKey);
    if (!isValid) {
      console.warn("Paystack webhook HMAC signature verification failed");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // 2. Parse event and check type
    const event = JSON.parse(rawBody);
    if (event.event !== "charge.success") {
      // Non-charge.success events are acknowledged without error
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const { orderId, orderNumber, channel } = event.data?.metadata || {};

    if (!orderId) {
      console.warn("Paystack webhook received charge.success without orderId in metadata");
      return NextResponse.json(
        { received: true, warning: "Missing orderId in metadata" },
        { status: 200 }
      );
    }

    // 3. Check existing order in Sanity for idempotency
    const existingOrder = await writeClient.fetch(
      `*[_type == "order" && _id == $orderId][0]{
        _id,
        orderNumber,
        paymentStatus,
        orderStatus,
        customerName,
        email,
        totalPrice,
        subtotal,
        shipping,
        tax,
        items[]{
          quantity,
          price,
          product->{
            name,
            price,
            images
          }
        },
        shippingAddress->{
          name,
          address,
          city,
          state,
          zip
        },
        address,
        clerkUserId
      }`,
      { orderId }
    );

    if (!existingOrder) {
      console.warn("Order not found in Sanity for webhook:", orderId);
      return NextResponse.json(
        { received: true, warning: "Order not found" },
        { status: 200 }
      );
    }

    // Idempotency: if order is already paid, do not re-process side effects
    if (existingOrder.paymentStatus === "paid") {
      return NextResponse.json(
        { received: true, alreadyPaid: true },
        { status: 200 }
      );
    }

    // 4. Authoritative Sanity patch
    try {
      await writeClient
        .patch(orderId)
        .set({
          paymentStatus: "paid",
          orderStatus: "processing",
          paystackReference: event.data.reference,
          paystackTransactionId: String(event.data.id),
          paystackMetadata: rawBody,
        })
        .commit();
    } catch (patchError) {
      console.error("Failed to patch Sanity order in webhook:", patchError);
      // Return 500 so Paystack retries
      return NextResponse.json(
        { error: "Failed to update order state" },
        { status: 500 }
      );
    }

    // 5. Dispatch side effects concurrently with Promise.allSettled
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const sideEffects = [
      // 5a. Confirmation email
      (async () => {
        try {
          const resolvedAddress = existingOrder.shippingAddress || existingOrder.address || {};
          await sendOrderConfirmationEmail({
            customerName: existingOrder.customerName || "Customer",
            customerEmail: existingOrder.email || "",
            orderId: existingOrder.orderNumber || orderNumber || orderId,
            orderDate: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            items: (existingOrder.items || []).map(
              (item: {
                quantity: number;
                price?: number;
                product?: { name?: string; price?: number; images?: Array<{ asset?: { _ref?: string } }> };
              }) => ({
                name: item.product?.name || "Product",
                price: item.price ?? item.product?.price ?? 0,
                quantity: item.quantity || 1,
                image: item.product?.images?.[0] ? undefined : undefined,
              })
            ),
            subtotal: existingOrder.subtotal || 0,
            shipping: existingOrder.shipping || 0,
            tax: existingOrder.tax || 0,
            total: existingOrder.totalPrice || 0,
            shippingAddress: {
              name: resolvedAddress.name || "",
              street: resolvedAddress.address || "",
              city: resolvedAddress.city || "",
              state: resolvedAddress.state || "",
              zipCode: resolvedAddress.zip || "",
              country: "Ghana",
            },
          });
        } catch (emailErr) {
          console.error("Webhook email notification error:", emailErr);
        }
      })(),

      // 5b. Analytics tracking
      (async () => {
        try {
          await fetch(`${baseUrl}/api/analytics/track`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventName: "order_paid",
              eventParams: {
                orderId: existingOrder._id,
                orderNumber: existingOrder.orderNumber,
                amount: existingOrder.totalPrice,
                status: "paid",
                userId: existingOrder.clerkUserId,
                paymentMethod: channel || "paystack",
                paystackReference: event.data.reference,
              },
            }),
          });
        } catch (analyticsErr) {
          console.error("Webhook analytics tracking error:", analyticsErr);
        }
      })(),

      // 5c. User push/in-app notification
      (async () => {
        try {
          if (existingOrder.clerkUserId) {
            await sendOrderStatusNotification({
              clerkUserId: existingOrder.clerkUserId,
              orderNumber: existingOrder.orderNumber,
              orderId: existingOrder._id,
              status: "processing",
              previousStatus: "pending",
            });
          }
        } catch (notificationErr) {
          console.error("Webhook push notification error:", notificationErr);
        }
      })(),
    ];

    await Promise.allSettled(sideEffects);

    return NextResponse.json(
      { received: true, processed: true },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error processing Paystack webhook:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
