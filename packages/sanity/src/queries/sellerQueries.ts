import { defineQuery } from "next-sanity";

export const SELLER_STORE_QUERY = defineQuery(
  `*[_type == "store" && clerkUserId == $userId][0]{ _id, name }`
);

export const SELLER_PRODUCTS_COUNT_QUERY = defineQuery(
  `count(*[_type == "product" && store._ref == $storeId])`
);

export const SELLER_ORDERS_COUNT_QUERY = defineQuery(
  `count(*[_type == "order"])`
);

export const SELLER_LISTINGS_QUERY = defineQuery(
  `*[_type == "product" && store._ref == $storeId] | order(_updatedAt desc)`
);

// We might want queries for listings, orders etc. in the future.
