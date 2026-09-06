/**
 * Next.js 16 Caching Revolution - Cache Utilities
 *
 * This module provides cache tag management and invalidation utilities
 * for the entire application using Next.js 16's new caching features.
 */

// ============================================================================
// CACHE TAG DEFINITIONS
// ============================================================================

export const CACHE_TAGS = {
  // Product-related tags
  PRODUCTS: "products",
  PRODUCT: (id: string) => `product-${id}`,
  PRODUCT_REVIEWS: (productId: string) => `product-reviews-${productId}`,
  RELATED_PRODUCTS: (productId: string) => `related-products-${productId}`,

  // Category-related tags
  CATEGORIES: "categories",
  CATEGORY: (slug: string) => `category-${slug}`,
  CATEGORY_PRODUCTS: (slug: string) => `category-products-${slug}`,

  // Brand-related tags
  BRANDS: "brands",
  BRAND: (slug: string) => `brand-${slug}`,
  BRAND_PRODUCTS: (slug: string) => `brand-products-${slug}`,

  // User-related tags
  USER: (userId: string) => `user-${userId}`,
  USER_ORDERS: (userId: string) => `user-orders-${userId}`,
  USER_WISHLIST: (userId: string) => `user-wishlist-${userId}`,
  USER_CART: (userId: string) => `user-cart-${userId}`,
  USER_REVIEWS: (userId: string) => `user-reviews-${userId}`,

  // Order-related tags
  ORDERS: "orders",
  ORDER: (orderId: string) => `order-${orderId}`,

  // Review-related tags
  REVIEWS: "reviews",
  REVIEW: (reviewId: string) => `review-${reviewId}`,

  // Static content tags (rarely change)
  HOMEPAGE: "homepage",
  NAVIGATION: "navigation",
  FOOTER: "footer",
  BANNERS: "banners",
  FEATURED: "featured",
  DEALS: "deals",
} as const;

// ============================================================================
// CACHE INVALIDATION HELPERS
// ============================================================================

export async function invalidateProducts() {
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/", "layout");
  revalidatePath("/shop", "page");
  revalidatePath("/category/[slug]", "page");
}

export async function invalidateProduct(
  productId: string,
  productSlug?: string
) {
  const { revalidatePath } = await import("next/cache");
  if (productSlug) {
    revalidatePath(`/product/${productSlug}`, "page");
  }
  revalidatePath("/shop", "page");
  revalidatePath("/", "layout");
}

export async function invalidateProductReviews(
  productId: string,
  productSlug?: string
) {
  const { revalidatePath } = await import("next/cache");
  if (productSlug) {
    revalidatePath(`/product/${productSlug}`, "page");
  }
  revalidatePath("/shop", "page");
}

export async function invalidateCategory(categorySlug: string) {
  const { revalidatePath } = await import("next/cache");
  revalidatePath(`/category/${categorySlug}`, "page");
  revalidatePath("/shop", "page");
  revalidatePath("/", "layout");
}

export async function invalidateAllCategories() {
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/category/[slug]", "page");
  revalidatePath("/shop", "page");
  revalidatePath("/", "layout");
}

export async function invalidateBrand(brandSlug: string) {
  const { revalidatePath } = await import("next/cache");
  revalidatePath(`/brand/${brandSlug}`, "page");
  revalidatePath("/shop", "page");
  revalidatePath("/", "layout");
}

export async function invalidateUser(_userId?: string) {
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/user", "layout");
}

export async function invalidateUserOrders(_userId?: string) {
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/user/orders", "page");
  revalidatePath("/user", "layout");
}

export async function invalidateOrder(_orderId: string, userId?: string) {
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/user/orders", "page");
  if (userId) {
    revalidatePath("/user", "layout");
  }
  revalidatePath("/admin", "layout");
}

export async function invalidateUserWishlist(_userId?: string) {
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/wishlist", "page");
  revalidatePath("/user", "layout");
}

export async function invalidateUserCart(_userId?: string) {
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/cart", "page");
  revalidatePath("/", "layout");
}

export async function invalidateHomepage() {
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/", "page");
}

export async function invalidateNavigation() {
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/", "layout");
}

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

export const CACHE_CONFIG = {
  STATIC: {
    revalidate: 3600,
  },
  HOMEPAGE: {
    revalidate: 300,
  },
  PRODUCT_LIST: {
    revalidate: 600,
  },
  PRODUCT_DETAIL: {
    revalidate: 1800,
  },
  CATEGORY: {
    revalidate: 900,
  },
  REVIEWS: {
    revalidate: 300,
  },
  USER_DATA: {
    revalidate: 0,
  },
  ORDERS: {
    revalidate: 60,
  },
} as const;

// ============================================================================
// COMPREHENSIVE INVALIDATION HELPERS
// ============================================================================

export async function invalidateProductUpdate(
  productSlug?: string,
  categorySlug?: string
) {
  const { revalidatePath } = await import("next/cache");
  if (productSlug) {
    revalidatePath(`/product/${productSlug}`, "page");
  }
  if (categorySlug) {
    revalidatePath(`/category/${categorySlug}`, "page");
  }
  revalidatePath("/shop", "page");
  revalidatePath("/", "layout");
}

export async function invalidateOrderUpdate(
  userId: string,
  productSlugs?: string[]
) {
  const { revalidatePath } = await import("next/cache");
  revalidatePath("/user/orders", "page");
  revalidatePath("/admin", "layout");

  if (productSlugs && productSlugs.length > 0) {
    productSlugs.forEach((slug) => {
      revalidatePath(`/product/${slug}`, "page");
    });
  }
}
