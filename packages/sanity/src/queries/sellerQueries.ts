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

// Returns orders that contain at least one product belonging to the seller's store
export const SELLER_ORDERS_QUERY = defineQuery(
  `*[_type == "order" && count(products[product->store._ref == $storeId]) > 0]
   | order(_createdAt desc)[0...50]{
     _id, _createdAt, status, totalAmount,
     products[]{ quantity, product->{ _id, name, store->{ _id } } }
   }`
);

// Verifies a single order belongs to the seller's store (used for PATCH ownership check)
export const SELLER_ORDER_OWNERSHIP_QUERY = defineQuery(
  `*[_type == "order" && _id == $orderId && count(products[product->store._ref == $storeId]) > 0][0]{ _id }`
);
