import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { writeClient, client } from "@repo/sanity";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Fetch the order
    const order = await client.fetch(
      `*[_type == "order" && _id == $orderId][0]{
        _id,
        orderNumber,
        totalPrice,
        paymentStatus,
        status,
        clerkUserId
      }`,
      { orderId }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify the order belongs to the user
    if (order.clerkUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if order is already paid
    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "Order is already paid" },
        { status: 400 }
      );
    }

    const orderTotal = order.totalPrice || 0;

    // Get user document
    const user = await client.fetch(
      `*[_type == "user" && clerkUserId == $userId][0]{
        _id,
        walletBalance
      }`,
      { userId }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentBalance = user.walletBalance || 0;

    // Check if user has enough balance
    if (currentBalance < orderTotal) {
      return NextResponse.json(
        { error: "Insufficient wallet balance. Please refund or add funds to your wallet." },
        { status: 400 }
      );
    }

    const newBalance = currentBalance - orderTotal;
    const transactionId = `TXN-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Create wallet transaction
    const transaction = {
      id: transactionId,
      type: "debit_purchase",
      amount: orderTotal,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      description: `Payment for order #${order.orderNumber}`,
      orderId: order._id,
      createdAt: new Date().toISOString(),
      status: "completed",
      processedBy: "system",
    };

    // Update user wallet
    await writeClient
      .patch(user._id)
      .set({ walletBalance: newBalance })
      .setIfMissing({ walletTransactions: [] })
      .append("walletTransactions", [transaction])
      .commit();

    // Update order status to paid and confirmed (processing)
    await writeClient
      .patch(orderId)
      .set({
        paymentStatus: "paid",
        status: "processing", // Move order to processing after payment
        paidAt: new Date().toISOString(),
      })
      .commit();

    return NextResponse.json(
      {
        success: true,
        message: "Payment processed successfully",
        newBalance,
        orderId: order._id,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
