/**
 * Query + parameters for the /shop page (its richer, faceted browse).
 *
 * Extracted from `Shop.tsx` so it can be executed against test data. The FILTER
 * semantics are unchanged (hierarchical category, classification by slug or id,
 * `status` or `attributes.condition`, the price window, ...). Only the PROJECTION
 * changed: the old query used `...` (every field of every product: all images,
 * full description, ...) plus a nested `attributeValues[]{...}` on every match.
 * Now:
 *  - only the fields the card/cart/wishlist read are returned, with at most 3 images;
 *  - `attributeValues` are included ONLY when a spec filter is active, because they
 *    are needed solely to apply that fuzzy client-side match (the spec filter
 *    OPTIONS come from the category document, not from products).
 */

export interface ShopFilters {
  searchQuery?: string | null;
  classification?: string | null;
  category?: string | null;
  brand?: string | null;
  /** "min-max", e.g. "100-500" */
  price?: string | null;
  condition?: string | null;
  warranty?: string | null;
}

/** Default price window (unchanged): products outside it, or without a price, are excluded. */
export const SHOP_DEFAULT_MIN_PRICE = 0;
export const SHOP_DEFAULT_MAX_PRICE = 100000;

export function buildShopParams(f: ShopFilters): Record<string, unknown> {
  let minPrice = SHOP_DEFAULT_MIN_PRICE;
  let maxPrice = SHOP_DEFAULT_MAX_PRICE;
  if (f.price) {
    const [min, max] = f.price.split("-").map(Number);
    minPrice = min;
    maxPrice = max;
  }
  return {
    searchPattern: f.searchQuery ? `*${f.searchQuery}*` : null,
    selectedClassification: f.classification ?? null,
    selectedCategory: f.category ?? null,
    selectedBrand: f.brand ?? null,
    selectedCondition: f.condition ?? null,
    selectedWarranty: f.warranty ?? null,
    minPrice,
    maxPrice,
  };
}

const FILTER = `*[_type == 'product'
  && (!defined($searchPattern) || name match $searchPattern || description match $searchPattern)
  && (!defined($selectedClassification) || productClassification->slug.current == $selectedClassification || productClassification->_id == $selectedClassification)
  && (!defined($selectedCategory) || references(*[_type == "category" && (slug.current == $selectedCategory || parent->slug.current == $selectedCategory || parent->parent->slug.current == $selectedCategory)]._id))
  && (!defined($selectedBrand) || references(*[_type == "brand" && slug.current == $selectedBrand]._id))
  && (!defined($selectedCondition) || status == $selectedCondition || attributes.condition == $selectedCondition)
  && (!defined($selectedWarranty) || warrantyType == $selectedWarranty)
  && price >= $minPrice && price <= $maxPrice
]`;

const CARD_FIELDS = `_id, _type, _createdAt, _updatedAt, _rev, name, slug, price, discount, stock, status,
  isFlashSale, averageRating, totalReviews,
  "images": images[0...3],
  "categories": categories[]->title`;

const ATTRIBUTE_VALUES = `,
  attributeValues[]{
    _key, valueString, valueSelect, valueNumber, valueMultiSelect,
    attribute->{ _id, title, slug, type }
  }`;

/** `needsSpecs`: true only while a dynamic spec filter is active. */
export function buildShopQuery(needsSpecs: boolean): string {
  return `${FILTER} | order(name asc) {
  ${CARD_FIELDS}${needsSpecs ? ATTRIBUTE_VALUES : ""}
}`;
}
