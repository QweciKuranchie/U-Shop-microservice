"use client";

import useCartStore, { CartItem } from "@/store";
import { PAYMENT_METHODS, PaymentMethod } from "@/lib/orderStatus";
import { useRef } from "react";
import { toast } from "sonner";

// Extended interface for email preparation that can handle Sanity images
interface EmailOrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string | Record<string, unknown>;
}

interface EmailOrderData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderDate: string;
  items: EmailOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  estimatedDelivery?: string;
}

interface Address {
  _id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  default: boolean;
  createdAt: string;
}

interface UserLike {
  id?: string;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  emailAddresses?: Array<{ emailAddress: string }>;
}

export function resolveCustomerName(user: UserLike | null | undefined): string {
  if (!user) return "Customer";
  if (user.fullName && user.fullName.trim() !== "") {
    return user.fullName.trim();
  }
  const nameParts = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (nameParts !== "") {
    return nameParts;
  }
  const email = user.emailAddresses?.[0]?.emailAddress;
  if (email && email.includes("@")) {
    const localPart = email.split("@")[0];
    if (localPart && localPart.trim() !== "") {
      return localPart.trim();
    }
  }
  return "Customer";
}

interface UseOrderPlacementProps {
  user: UserLike | null;
}

export function useOrderPlacement({ user }: UseOrderPlacementProps) {
  const {
    items: cart,
    isPlacingOrder,
    orderStep,
    setOrderPlacementState,
  } = useCartStore();

  // One key per checkout attempt: a double-click or a retry after a network
  // timeout resolves to the SAME order on the server instead of creating a second.
  const attemptKey = useRef<string | null>(null);

  const placeOrder = async (
    selectedAddress: Address,
    selectedPaymentMethod: PaymentMethod,
    subtotal: number,
    shipping: number,
    tax: number,
    total: number,
    redirectToCheckout: boolean = false,
    promoCode?: string | null
  ) => {
    if (!selectedAddress) {
      toast.error("Address Required", {
        description: "Please select a shipping address",
        duration: 4000,
      });
      return { success: false };
    }

    if (cart.length === 0) {
      toast.error("Cart is empty", {
        description: "Add some products to your cart first",
        duration: 4000,
      });
      return { success: false };
    }

    // Create a snapshot of the cart before any modifications
    const cartSnapshot: CartItem[] = JSON.parse(JSON.stringify(cart));

    // Check stock availability
    const outOfStockItems = cartSnapshot.filter(
      (item) => item.product.stock === 0
    );
    if (outOfStockItems.length > 0) {
      toast.error("Insufficient Stock", {
        description: `${outOfStockItems.map((i) => i.product.name).join(", ")} ${
          outOfStockItems.length > 1 ? "are" : "is"
        } out of stock`,
        duration: 5000,
      });
      return { success: false };
    }

    // Check if any item quantity exceeds available stock
    const insufficientStockItems = cartSnapshot.filter(
      (item) => item.quantity > (item.product.stock || 0)
    );
    if (insufficientStockItems.length > 0) {
      toast.error("Stock Limit Exceeded", {
        description: `${insufficientStockItems.map((i) => i.product.name).join(", ")} ${
          insufficientStockItems.length > 1 ? "have" : "has"
        } insufficient stock`,
        duration: 5000,
      });
      return { success: false };
    }

    setOrderPlacementState(true, "validating");

    try {
      // Step 1: Validate and prepare order data
      setOrderPlacementState(true, "creating");

      attemptKey.current ??= crypto.randomUUID();

      // Send intent only. The server prices the order from the catalogue; the
      // total below is just "what the shopper saw", used to detect price changes.
      const orderData = {
        items: cartSnapshot.map((i) => ({ product: { _id: i.product._id }, quantity: i.quantity })),
        shippingAddress: { _id: selectedAddress._id },
        paymentMethod: selectedPaymentMethod,
        totalAmount: total,
        promoCode: promoCode ?? undefined,
        idempotencyKey: attemptKey.current,
      };

      // Create order in Sanity
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const orderResult = await orderResponse.json();
      attemptKey.current = null; // order exists; the next purchase gets a fresh key
      const orderId = orderResult.order._id;
      const orderNumber = orderResult.order.orderNumber;

      // Handle Cash on Delivery
      if (selectedPaymentMethod === PAYMENT_METHODS.PAY_ON_DELIVERY) {
        setOrderPlacementState(true, "emailing");

        try {
          await fetch("/api/orders/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId }),
          });
        } catch (emailError) {
          console.error("Email sending failed for COD order:", emailError);
        }

        setOrderPlacementState(true, "redirecting");

        if (redirectToCheckout) {
          toast.success("Order Created! Redirecting to Checkout 🛒", {
            description: "Taking you to the checkout page...",
            duration: 3000,
          });
          return {
            success: true,
            orderId,
            orderNumber,
            redirectTo: `/checkout?order_id=${orderId}&orderNumber=${orderNumber}&payment_method=cod`,
            isCheckoutRedirect: true,
          };
        } else {
          toast.success("Order Confirmed! 🚚", {
            description: "You'll pay upon delivery",
            duration: 4000,
          });
          return {
            success: true,
            orderId,
            orderNumber,
            redirectTo: `/success?order_id=${orderId}&orderNumber=${orderNumber}&payment_method=cod`,
            isCOD: true,
          };
        }
      }

      // Card and Mobile Money: Paystack flow will be executed by checkout component
      setOrderPlacementState(true, "redirecting");
      return {
        success: true,
        orderId,
        orderNumber,
        paymentRequired: true,
        paymentMethod: selectedPaymentMethod,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Order placement error:", error);
      toast.error("Order Failed", {
        description: errorMessage || "Please try again",
        duration: 5000,
      });
      // Reset state on error
      setOrderPlacementState(false, "validating");
      return { success: false, error: errorMessage };
    }
  };

  return {
    placeOrder,
    isPlacingOrder,
    orderStep,
    cartSnapshot: cart,
  };
}
