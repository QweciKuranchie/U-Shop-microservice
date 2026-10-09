import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@repo/sanity";
import { checkRateLimitByKey } from "@repo/utils/rate-limit";
import { getAuthUser } from "@/lib/getAuthUser";
import { sendOrderConfirmationEmail } from "@/lib/emailService";
import { PAYMENT_METHODS } from "@/lib/orderStatus";
import { buildOrderConfirmationData, type OrderForEmail } from "@/lib/orders/orderEmail";

/**
 * Sends the confirmation email for a Pay-on-Delivery order (card/MoMo orders are
 * emailed by the payment webhook).
 *
 * The body is just `{ orderId }`. The message is built from the stored order and
 * sent to the order's own address. It used to accept a full client-built
 * `orderData` (recipient, items, totals), letting any signed-in user send
 * arbitrary, branded "order confirmation" emails to any address.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await getAuthUser(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = await checkRateLimitByKey(userId, "orders:send-email", { limit: 5, windowMs: 60_000 });
    if (limited) return limited;

    const { orderId } = (await request.json().catch(() => ({}))) as { orderId?: string };
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const order = await writeClient.fetch<
      (OrderForEmail & { clerkUserId?: string; paymentMethod?: string }) | null
    >(
      `*[_type == "order" && _id == $orderId][0]{
        orderNumber, orderDate, customerName, email, subtotal, shipping, tax, totalPrice,
        clerkUserId, paymentMethod,
        items[]{ quantity, price, product->{ name, price, images } },
        shippingAddress->{ name, address, city, state, zip }, address
      }`,
      { orderId }
    );

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.clerkUserId !== userId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    if (order.paymentMethod !== PAYMENT_METHODS.PAY_ON_DELIVERY) {
      return NextResponse.json({ error: "Confirmation emails for paid orders are sent automatically" }, { status: 400 });
    }

    const emailResult = await sendOrderConfirmationEmail(buildOrderConfirmationData(order));
    if (!emailResult.success) {
      console.error("Failed to send order confirmation email:", emailResult.error);
      return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
    }
    return NextResponse.json({ success: true, messageId: emailResult.messageId, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
