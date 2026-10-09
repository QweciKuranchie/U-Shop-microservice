/**
 * Server-driven product catalogue: URL params -> validated params -> one GROQ query.
 *
 * Pure (no Next.js / Sanity client imports) so it is safe in client bundles and
 * unit-testable. Used by:
 *  - the /product page (server): parseCatalogParams -> getProductsPage
 *  - ProductCatalog (client): catalogParamsToSearchParams / paginationWindow
 *
 * Safety: nothing from the URL is ever interpolated into GROQ. The query text is
 * assembled only from fixed fragments chosen by whitelisted enums; all user input
 * travels as query PARAMETERS (`$t0`, `$categories`, ...).
 */
import type { Product } from "./types";

export const CATALOG_PAGE_SIZE = 24;
export const CATALOG_SORTS = ["name-asc", "name-desc", "price-low", "price-high", "newest"] as const;
export type CatalogSort = (typeof CATALOG_SORTS)[number];
export const CATALOG_CONDITIONS = [
  "new", "refurbished", "like_new", "excellent", "good", "fair", "for_parts",
] as const;

const MAX_PAGE = 500;
const MAX_PRICE = 10_000_000;
const MAX_IDS = 20;
const MAX_TOKENS = 5;
const MAX_TOKEN_LENGTH = 30;
const MAX_QUERY_LENGTH = 80;
const ID_PATTERN = /^[A-Za-z0-9_.-]{1,128}$/;

export interface CatalogParams {
  q: string;
  categories: string[];
  brands: string[];
  conditions: string[];
  minPrice: number | null;
  maxPrice: number | null;
  sort: CatalogSort;
  page: number;
}

export const DEFAULT_CATALOG_PARAMS: Readonly<CatalogParams> = Object.freeze({
  q: "",
  categories: [],
  brands: [],
  conditions: [],
  minPrice: null,
  maxPrice: null,
  sort: "name-asc",
  page: 1,
});

/** Exactly what ProductCard, the cart store and the wishlist read - nothing more. */
export type CatalogProduct = Omit<
  Pick<
    Product,
    | "_id" | "_type" | "_createdAt" | "_updatedAt" | "_rev" | "name" | "slug" | "images" | "price" | "discount"
    | "stock" | "status" | "isFlashSale" | "averageRating" | "totalReviews"
  >,
  never
> & { categories?: string[] };

export interface CatalogPage {
  items: CatalogProduct[];
  total: number;
}

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);

/** Accepts `a,b` and repeated `?x=a&x=b`; trims, de-duplicates, caps. */
function list(v: string | string[] | undefined, accept: (s: string) => boolean): string[] {
  const parts = (Array.isArray(v) ? v : v === undefined ? [] : [v]).flatMap((s) => s.split(","));
  const out: string[] = [];
  for (const raw of parts) {
    const s = raw.trim();
    if (s && accept(s) && !out.includes(s)) out.push(s);
    if (out.length >= MAX_IDS) break;
  }
  return out;
}

function price(v: string | undefined): number | null {
  if (v === undefined || v.trim() === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return null; // 0 / negative = no bound
  return Math.round(Math.min(n, MAX_PRICE) * 100) / 100;
}

/** Sanitise raw URL input into a fully-valid CatalogParams. Never throws. */
export function parseCatalogParams(raw: RawParams): CatalogParams {
  const q = (first(raw.q) ?? first(raw.query) ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH);

  let minPrice = price(first(raw.min));
  let maxPrice = price(first(raw.max));
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];

  const sortRaw = first(raw.sort);
  const sort = (CATALOG_SORTS as readonly string[]).includes(sortRaw ?? "")
    ? (sortRaw as CatalogSort)
    : DEFAULT_CATALOG_PARAMS.sort;

  const pageNum = Math.floor(Number(first(raw.page)));
  const page = Number.isFinite(pageNum) ? Math.min(Math.max(pageNum, 1), MAX_PAGE) : 1;

  return {
    q,
    categories: list(raw.category, (s) => ID_PATTERN.test(s)),
    brands: list(raw.brand, (s) => ID_PATTERN.test(s)),
    conditions: list(raw.condition, (s) => (CATALOG_CONDITIONS as readonly string[]).includes(s)),
    minPrice,
    maxPrice,
    sort,
    page,
  };
}

/**
 * Search tokens: letters/digits only, so no GROQ/wildcard syntax can sneak in.
 * Each token is matched as a SUBSTRING (`*token*`), like the old client-side
 * `includes()` and the /shop page ("phone" still finds "iPhone"). Multiple tokens
 * must all match (AND).
 */
export function searchTokens(q: string): string[] {
  return q
    .normalize("NFKC")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .slice(0, MAX_TOKENS)
    .map((t) => t.slice(0, MAX_TOKEN_LENGTH));
}

/** Highest price in the catalogue; used to bound the price slider. */
export const CATALOG_MAX_PRICE_QUERY = `math::max(*[_type == "product" && defined(price)].price)`;

/** Slider ceiling: never below 1000 (as before), rounded UP so it doesn't jitter. */
export function sliderMax(maxPrice: number | null | undefined): number {
  const m = typeof maxPrice === "number" && Number.isFinite(maxPrice) ? maxPrice : 0;
  return Math.max(1000, Math.ceil(m / 100) * 100);
}

const ORDER_BY: Record<CatalogSort, string> = {
  "name-asc": "lower(name) asc, _id asc",
  "name-desc": "lower(name) desc, _id asc",
  "price-low": "coalesce(price, 0) asc, _id asc",
  "price-high": "coalesce(price, 0) desc, _id asc",
  newest: "_createdAt desc, _id asc",
};

const CARD_PROJECTION = `{
    _id, _type, _createdAt, _updatedAt, _rev, name, slug, price, discount, stock, status, isFlashSale,
    "images": images[0...3],
    "categories": categories[]->title,
    "averageRating": coalesce(math::avg(*[_type == "review" && product._ref == ^._id && status == "approved"].rating), averageRating, 0),
    "totalReviews": coalesce(count(*[_type == "review" && product._ref == ^._id && status == "approved"]), totalReviews, 0)
  }`;

export function buildCatalogQuery(p: CatalogParams): { query: string; params: Record<string, unknown> } {
  const clauses = [`_type == "product"`];
  const params: Record<string, unknown> = {};

  searchTokens(p.q).forEach((token, i) => {
    params[`t${i}`] = `*${token}*`;
    clauses.push(`(name match $t${i} || description match $t${i})`);
  });
  if (p.categories.length) {
    params.categories = p.categories;
    // `categories[]._ref in $x` would test whether the whole ARRAY is an element of $x
    // (never true). Filter the elements instead: any overlap, or the legacy single ref.
    clauses.push(`(count(categories[_ref in $categories]) > 0 || category._ref in $categories)`);
  }
  if (p.brands.length) {
    params.brands = p.brands;
    clauses.push(`brand._ref in $brands`);
  }
  if (p.conditions.length) {
    params.conditions = p.conditions;
    clauses.push(`status in $conditions`);
  }
  if (p.minPrice !== null) {
    params.minPrice = p.minPrice;
    clauses.push(`coalesce(price, 0) >= $minPrice`);
  }
  if (p.maxPrice !== null) {
    params.maxPrice = p.maxPrice;
    clauses.push(`coalesce(price, 0) <= $maxPrice`);
  }

  const filter = clauses.join(" && ");
  params.start = (p.page - 1) * CATALOG_PAGE_SIZE;
  params.end = params.start as number + CATALOG_PAGE_SIZE;

  return {
    query: `{
  "total": count(*[${filter}]),
  "items": *[${filter}] | order(${ORDER_BY[p.sort]}) [$start...$end] ${CARD_PROJECTION}
}`,
    params,
  };
}

/** Query string for a params object; defaults are omitted so URLs stay short and canonical. */
export function catalogParamsToSearchParams(p: CatalogParams): URLSearchParams {
  const sp = new URLSearchParams();
  if (p.q) sp.set("q", p.q);
  if (p.categories.length) sp.set("category", p.categories.join(","));
  if (p.brands.length) sp.set("brand", p.brands.join(","));
  if (p.conditions.length) sp.set("condition", p.conditions.join(","));
  if (p.minPrice !== null) sp.set("min", String(p.minPrice));
  if (p.maxPrice !== null) sp.set("max", String(p.maxPrice));
  if (p.sort !== DEFAULT_CATALOG_PARAMS.sort) sp.set("sort", p.sort);
  if (p.page > 1) sp.set("page", String(p.page));
  return sp;
}

export function totalPages(total: number, pageSize: number = CATALOG_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(Math.max(0, total) / pageSize));
}

/**
 * Compact page list for the pager: always first, last and the current +/- 1,
 * with "…" gaps. e.g. page 8 of 20 -> [1, "…", 7, 8, 9, "…", 20].
 */
export function paginationWindow(page: number, pages: number): Array<number | "…"> {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const keep = new Set([1, pages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => keep.add(n));
  if (page >= pages - 2) [pages - 1, pages - 2, pages - 3].forEach((n) => keep.add(n));
  const sorted = [...keep].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

/** Stable cache key: equal filters in a different order share one cache entry. */
export function catalogCacheKey(p: CatalogParams): string {
  return JSON.stringify({
    ...p,
    categories: [...p.categories].sort(),
    brands: [...p.brands].sort(),
    conditions: [...p.conditions].sort(),
  });
}

/**
 * Adapter for components typed against the generated `Product` (ProductCard, the
 * cart and wishlist buttons, the cart store).
 *
 * The one known difference: the generated type models `categories` as unresolved
 * references, while every list projection here (and the old full-catalogue query)
 * resolves them to TITLES (`string[]`), which is what the cart pages read. Every
 * other field those components use is present in CARD_PROJECTION (see the test
 * "projects the fields the card/cart/wishlist read"). Kept as a single, named
 * boundary rather than scattering casts through the UI.
 */
export function toProduct(product: CatalogProduct): Product {
  return product as unknown as Product;
}
