import { z } from "zod";

// ==========================================
// Sanity Schema Enums & Literals
// ==========================================

export const ProductStatusList = [
  { title: "Brand New / Sealed", value: "new" },
  { title: "Trending / Hot Deal", value: "hot" },
  { title: "Used - Like New / Open Box", value: "like_new" },
  { title: "Used - Excellent Condition", value: "excellent" },
  { title: "Used - Good Condition", value: "good" },
  { title: "Used - Fair Condition", value: "fair" },
  { title: "Used - For Parts", value: "for_parts" },
] as const;

export const ProductConditionList = [
  { title: "Brand New", value: "new" },
  { title: "Used / Pre-Owned", value: "used" },
] as const;

export const CategoryLevelList = [
  { title: "Top Category", value: "category" },
  { title: "Subcategory", value: "subcategory" },
  { title: "Leaf Category", value: "leaf" },
] as const;

export const SellerTypeList = [
  { title: "Personal Seller", value: "personal" },
  { title: "Verified Business", value: "business" },
  { title: "Campus Student Seller", value: "student" },
] as const;

// ==========================================
// Form Validation Schemas (Sanity-Aligned)
// ==========================================

export const CategoryFormSchema = z.object({
  title: z.string().min(1, { message: "Category title is required" }),
  slug: z.string().min(1, { message: "Category slug is required" }),
  productClassificationId: z.string().optional().default(""),
  parentId: z.string().optional().default(""),
  level: z.enum(["category", "subcategory", "leaf"]).default("leaf"),
  description: z.string().optional().default(""),
});

export const ProductFormSchema = z.object({
  name: z
    .string()
    .min(10, { message: "Title should be at least 10 characters" })
    .max(100, { message: "Title cannot exceed 100 characters" }),
  slug: z.string().optional().default(""),
  price: z.number().min(0, { message: "Price must be positive" }),
  discount: z.number().min(0).max(100).default(0),
  stock: z.number().min(0).default(1),
  condition: z.enum(["new", "used"]).default("new"),
  status: z
    .enum(["new", "hot", "like_new", "excellent", "good", "fair", "for_parts"])
    .default("new"),
  classificationId: z.string().optional().default(""),
  categoryId: z.string().optional().default(""),
  brandId: z.string().optional().default(""),
  storeId: z.string().optional().default(""),
  sellerType: z.enum(["personal", "business", "student"]).default("personal"),
  featured: z.boolean().default(false),
  isFlashSale: z.boolean().default(false),
  isStudentDeal: z.boolean().default(false),
  isClearance: z.boolean().default(false),
  isBlackFriday: z.boolean().default(false),
  shortDescription: z.string().default(""),
  description: z.string().default(""),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  images: z.record(z.string(), z.string()).default({}),
});

export const BrandFormSchema = z.object({
  name: z.string().min(1, { message: "Brand name is required" }),
  slug: z.string().min(1, { message: "Brand slug is required" }),
  description: z.string().optional().default(""),
  featured: z.boolean().default(false),
});

export const StoreFormSchema = z.object({
  name: z.string().min(1, { message: "Store name is required" }),
  slug: z.string().min(1, { message: "Store slug is required" }),
  ownerName: z.string().min(1, { message: "Owner name is required" }),
  clerkUserId: z.string().min(1, { message: "Clerk User ID is required" }),
  locationId: z.string().optional().default(""),
  sellerType: z.enum(["personal", "business", "student"]).default("personal"),
  description: z.string().optional().default(""),
});

export const UserFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  username: z.string().min(1, { message: "Username is required" }),
  emailAddress: z.array(z.string()).min(1, { message: "At least one email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const OrderFormSchema = z.object({
  amount: z.number().min(1, { message: "Amount must be at least 1" }),
  userId: z.string().min(1, { message: "User ID is required" }),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled", "success", "failed"]),
});

// ==========================================
// Entity Types (Exact Sanity Schema Match)
// ==========================================

export type ProductClassificationType = {
  _id: string;
  id?: string;
  title: string;
  slug: string;
};

export type BrandType = {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  featured?: boolean;
};

export type StoreType = {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  ownerName: string;
  clerkUserId: string;
  location?: { _ref: string; name?: string };
  sellerType?: "personal" | "business" | "student";
  description?: string;
  status?: "active" | "pending" | "suspended";
};

export type CategoryType = {
  _id?: string;
  id?: string | number;
  title: string;
  name?: string;
  slug: string;
  productType?: { _ref?: string; title?: string };
  parent?: { _ref?: string; title?: string };
  level?: "category" | "subcategory" | "leaf";
  image?: string;
  description?: string;
  productCount?: number;
};

export type ProductType = {
  _id?: string;
  id: string | number;
  name: string;
  slug?: { current: string } | string;
  brand?: { _ref?: string; name?: string };
  category?: { _ref?: string; title?: string };
  productClassification?: { _ref?: string; title?: string };
  categorySlug?: string;
  price: number;
  discount?: number;
  stock?: number;
  condition?: "new" | "used";
  status?: "new" | "hot" | "like_new" | "excellent" | "good" | "fair" | "for_parts" | string;
  sellerType?: "personal" | "business" | "student";
  featured?: boolean;
  isFlashSale?: boolean;
  isStudentDeal?: boolean;
  isClearance?: boolean;
  isBlackFriday?: boolean;
  shortDescription?: string;
  description?: string;
  sizes: string[];
  colors: string[];
  images: Record<string, string>;
};

export type ProductsType = ProductType[];

export type OrderType = {
  _id: string;
  id?: string;
  orderNumber?: string;
  customerName?: string;
  email: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "success" | "failed" | string;
  amount: number;
  totalPrice?: number;
  userId?: string;
  clerkUserId?: string;
  fullName?: string;
  items?: unknown[];
  createdAt?: string;
  orderDate?: string;
};

export type OrderChartType = {
  month: string;
  total: number;
  successful: number;
};

export type ChartDistributionType = {
  label: string;
  value: number;
  fill: string;
};

export type ActionItemType = {
  id: string;
  title: string;
  type: "order" | "inventory" | "review" | "user";
  date: string;
  isUrgent?: boolean;
};


