import crypto from "node:crypto";
import {
  ORDER_STATUSES,
  PAYMENT_GATEWAYS,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  type PaymentMethod,
} from "@/lib/orderStatus";

/**
 * Lives here (not in `app/api/orders/route.ts`) because Next.js route modules
 * may only export HTTP handlers/config; exporting helpers from a route file is
 * rejected by Next's route-type validation.
 */

export interface BuildOrderDataInput {
  /** When set, makes creation idempotent (used with `createIfNotExists`). */
  documentId?: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  clerkUserId: string;
  /** Prices here MUST come from the server-side catalogue, never from the client. */
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
  shippingAddress: {
    _id: string;
    name?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
  };
  paymentMethod: PaymentMethod;
  totalAmount: number;
  subtotal: number;
  shipping: number;
  tax: number;
}

/** Collision-resistant order number; same visible shape as before (ORDER-<ts>-<9 chars>). */
export function generateOrderNumber(now: number = Date.now()): string {
  const suffix = crypto.randomBytes(6).toString("hex").slice(0, 9).toUpperCase();
  return `ORDER-${now}-${suffix}`;
}

export function buildOrderData(input: BuildOrderDataInput) {
  const isPaystack =
    input.paymentMethod === PAYMENT_METHODS.CARD ||
    input.paymentMethod === PAYMENT_METHODS.MOBILE_MONEY;

  return {
    ...(input.documentId ? { _id: input.documentId } : {}),
    _type: "order" as const,
    orderNumber: input.orderNumber,
    customerName: input.customerName,
    email: input.email,
    phone: input.phone,
    clerkUserId: input.clerkUserId,
    items: input.items.map((item) => ({
      _key: crypto.randomUUID(),
      product: { _type: "reference", _ref: item.productId },
      quantity: item.quantity,
      price: item.unitPrice,
    })),
    totalPrice: input.totalAmount,
    currency: "GHS",
    amountDiscount: 0,
    shippingAddress: { _type: "reference", _ref: input.shippingAddress._id },
    address: {
      _type: "object",
      name: input.shippingAddress.name || "",
      address: input.shippingAddress.address || "",
      city: input.shippingAddress.city || "",
      state: input.shippingAddress.state || "",
      zip: input.shippingAddress.zip || "",
    },
    orderStatus: ORDER_STATUSES.PENDING,
    orderDate: new Date().toISOString(),
    paymentMethod: input.paymentMethod,
    paymentStatus: PAYMENT_STATUSES.PENDING,
    paymentGateway: isPaystack ? PAYMENT_GATEWAYS.PAYSTACK : PAYMENT_GATEWAYS.NONE,
    subtotal: input.subtotal,
    shipping: input.shipping,
    tax: input.tax,
  };
}
