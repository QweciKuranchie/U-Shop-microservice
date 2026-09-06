export const DEFAULT_CURRENCY = "GHS";
export const DEFAULT_LOCALE = "en-GH";

export const PRODUCT_STATUS = {
  NEW: "new",
  HOT: "hot",
  SALE: "sale",
} as const;

export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export const SELLER_TYPES = {
  STUDENT: "student",
  BUSINESS: "business",
  CAMPUS_AMBASSADOR: "campus_ambassador",
  PERSONAL: "personal",
} as const;
