import type { OrderConfirmationData } from "@/lib/emailService";
import { getEmailImageUrl } from "@/lib/emailImageUtils";

export interface OrderForEmail {
  orderNumber?: string | null;
  orderDate?: string | null;
  customerName?: string | null;
  email?: string | null;
  subtotal?: number | null;
  shipping?: number | null;
  tax?: number | null;
  totalPrice?: number | null;
  items?: Array<{
    quantity?: number | null;
    price?: number | null;
    product?: { name?: string | null; price?: number | null; images?: unknown[] | null } | null;
  }> | null;
  shippingAddress?: AddressLike | null;
  address?: AddressLike | null;
}

interface AddressLike {
  name?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}

/**
 * Single builder for the order-confirmation email payload. It replaces two
 * hand-rolled copies (Paystack webhook and the client-driven send-email route).
 * The webhook copy also had `image: x ? undefined : undefined` (always
 * undefined), so paid-order emails never showed product images; this restores
 * them using the same helper the COD email already used.
 */
export function buildOrderConfirmationData(order: OrderForEmail): OrderConfirmationData {
  const addr = order.shippingAddress || order.address || {};
  const when = order.orderDate ? new Date(order.orderDate) : new Date();

  return {
    customerName: order.customerName || "Customer",
    customerEmail: order.email || "",
    orderId: order.orderNumber || "",
    orderDate: when.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    items: (order.items || []).map((item) => ({
      name: item.product?.name || "Product",
      price: item.price ?? item.product?.price ?? 0,
      quantity: item.quantity || 1,
      image: getEmailImageUrl(item.product?.images?.[0] as Parameters<typeof getEmailImageUrl>[0]),
    })),
    subtotal: order.subtotal || 0,
    shipping: order.shipping || 0,
    tax: order.tax || 0,
    total: order.totalPrice || 0,
    shippingAddress: {
      name: addr.name || "",
      street: addr.address || "",
      city: addr.city || "",
      state: addr.state || "",
      zipCode: addr.zip || "",
      country: "Ghana",
    },
  };
}
