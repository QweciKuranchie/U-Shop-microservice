import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getMyOrders } from "@repo/sanity";
import { writeClient } from "@repo/sanity";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_GATEWAYS,
  PaymentMethod,
} from "@/lib/orderStatus";
import crypto from "crypto";
import { sendOrderStatusNotification } from "@/lib/notificationService";

interface CartItem {
  product: {
    _id: string;
    name?: string;
    price?: number;
    category?: string;
  };
  quantity: number;
}

export interface BuildOrderDataInput {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  clerkUserId: string;
  items: Array<{
    product: { _id: string; price?: number };
    quantity: number;
  }>;
  shippingAddress: {
    _id: string;
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
  };
  paymentMethod: PaymentMethod;
  totalAmount: number;
  subtotal: number;
  shipping: number;
  tax: number;
}

export function buildOrderData(input: BuildOrderDataInput) {
  const isPaystack =
    input.paymentMethod === PAYMENT_METHODS.CARD ||
    input.paymentMethod === PAYMENT_METHODS.MOBILE_MONEY;

  return {
    _type: "order" as const,
    orderNumber: input.orderNumber,
    customerName: input.customerName,
    email: input.email,
    phone: input.phone,
    clerkUserId: input.clerkUserId,
    items: input.items.map((item) => ({
      _key: crypto.randomUUID(),
      product: {
        _type: "reference",
        _ref: item.product._id,
      },
      quantity: item.quantity,
      price: item.product.price ?? 0,
    })),
    totalPrice: input.totalAmount,
    currency: "GHS",
    amountDiscount: 0,
    shippingAddress: {
      _type: "reference",
      _ref: input.shippingAddress._id,
    },
    address: {
      _type: "object",
      name: input.shippingAddress.name || "",
      address: input.shippingAddress.address || "",
      city: input.shippingAddress.city || "",
      state: input.shippingAddress.state || "",
      zip: input.shippingAddress.zip || "",
    },
    orderStatus: ORDER_STATUSES.PENDING,
    status: ORDER_STATUSES.PENDING,
    orderDate: new Date().toISOString(),
    paymentMethod: input.paymentMethod,
    paymentStatus: PAYMENT_STATUSES.PENDING,
    paymentGateway: isPaystack
      ? PAYMENT_GATEWAYS.PAYSTACK
      : PAYMENT_GATEWAYS.NONE,
    subtotal: input.subtotal,
    shipping: input.shipping,
    tax: input.tax,
  };
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await getMyOrders(userId);

    return NextResponse.json(orders || []);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const POST = async (request: NextRequest) => {
  try {
    // Check authentication
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reqBody = await request.json();
    const {
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      subtotal,
      shipping,
      tax,
    } = reqBody;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress._id) {
      return NextResponse.json(
        { error: "Valid shipping address is required" },
        { status: 400 }
      );
    }

    if (
      !paymentMethod ||
      !Object.values(PAYMENT_METHODS).includes(paymentMethod)
    ) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `ORDER-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    const userEmail = user.emailAddresses[0]?.emailAddress || "";
    const userName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
    const userPhone =
      user.phoneNumbers?.[0]?.phoneNumber || shippingAddress.phone || "";

    // Create order object using pure helper
    const orderData = buildOrderData({
      orderNumber,
      customerName: userName,
      email: userEmail,
      phone: userPhone,
      clerkUserId: userId,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
      subtotal,
      shipping,
      tax,
    });

    // Create order in Sanity using writeClient (has create permissions)
    const createdOrder = await writeClient.create(orderData);

    // Track order placed event
    try {
      await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/analytics/track`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName: "order_placed",
            eventParams: {
              orderId: createdOrder._id,
              orderNumber: createdOrder.orderNumber,
              amount: totalAmount,
              status: createdOrder.orderStatus || createdOrder.status,
              userId: userId,
              paymentMethod: paymentMethod,
              itemCount: items.length,
              subtotal: subtotal,
              shipping: shipping,
              tax: tax,
              customerEmail: userEmail,
              products: items.map((item: CartItem) => ({
                productId: item.product._id,
                name: item.product.name || "Unknown Product",
                quantity: item.quantity,
                price: item.product.price || 0,
              })),
            },
          }),
        }
      );

      // Also track purchase event for e-commerce analytics
      await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/analytics/track`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName: "purchase",
            eventParams: {
              orderId: createdOrder._id,
              value: totalAmount,
              currency: "GHS",
              items: items.map((item: CartItem) => ({
                productId: item.product._id,
                name: item.product.name || "Unknown Product",
                category: item.product.category || "Uncategorized",
                quantity: item.quantity,
                price: item.product.price || 0,
              })),
              userId: userId,
            },
          }),
        }
      );
    } catch (analyticsError) {
      console.error("Failed to track order placed event:", analyticsError);
    }

    // Send order confirmation notification to user
    try {
      await sendOrderStatusNotification({
        clerkUserId: userId,
        orderNumber: createdOrder.orderNumber,
        orderId: createdOrder._id,
        status: ORDER_STATUSES.PENDING,
      });
    } catch (notificationError) {
      console.error(
        "Failed to send order confirmation notification:",
        notificationError
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        _id: createdOrder._id,
        orderNumber: createdOrder.orderNumber,
        status: createdOrder.orderStatus || createdOrder.status,
        paymentMethod: createdOrder.paymentMethod,
        totalPrice: createdOrder.totalPrice,
        currency: createdOrder.currency,
      },
      message: "Order created successfully",
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Order creation error:", error);
    return NextResponse.json(
      {
        error: errorMessage || "Failed to create order",
        details: error instanceof Error ? error.stack : null,
      },
      { status: 500 }
    );
  }
};
