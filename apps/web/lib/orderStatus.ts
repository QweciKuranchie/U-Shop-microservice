// Order status constants
export const ORDER_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  PAID: "paid",
  SHIPPED: "shipped",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

// Payment status constants
export const PAYMENT_STATUSES = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

// Payment methods
export const PAYMENT_METHODS = {
  CARD: "card",
  MOBILE_MONEY: "momo",
  PAY_ON_DELIVERY: "cod",
} as const;

// Payment gateways
export const PAYMENT_GATEWAYS = {
  PAYSTACK: "paystack",
  NONE: "none",
} as const;

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];
export type PaymentStatus =
  (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];
export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
export type PaymentGateway =
  (typeof PAYMENT_GATEWAYS)[keyof typeof PAYMENT_GATEWAYS];
