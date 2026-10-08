import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CATALOG_PAGE_SIZE, DEFAULT_CATALOG_PARAMS, buildCatalogQuery, catalogCacheKey,
  catalogParamsToSearchParams, paginationWindow, parseCatalogParams, searchTokens, totalPages,
} from "./catalogQuery";

describe("parseCatalogParams", () => {
  it("returns defaults for empty input", () => {
    assert.deepEqual(parseCatalogParams({}), DEFAULT_CATALOG_PARAMS);
  });

  it("accepts comma lists and repeated params, de-duplicates and trims", () => {
    const p = parseCatalogParams({ category: ["a1, b2", "a1"], brand: "x-1,y_2", condition: "new,good" });
    assert.deepEqual(p.categories, ["a1", "b2"]);
    assert.deepEqual(p.brands, ["x-1", "y_2"]);
    assert.deepEqual(p.conditions, ["new", "good"]);
  });

  it("drops hostile ids and unknown conditions/sorts (whitelists only)", () => {
    const p = parseCatalogParams({
      category: `ok1,"] || true || ["x, a b, ${"z".repeat(200)}`,
      condition: "new,DROP,__proto__",
      sort: "price; delete",
    });
    assert.deepEqual(p.categories, ["ok1"]);
    assert.deepEqual(p.conditions, ["new"]);
    assert.equal(p.sort, "name-asc");
  });

  it("clamps page and price; swaps inverted ranges; treats <=0 / junk as no bound", () => {
    assert.equal(parseCatalogParams({ page: "-4" }).page, 1);
    assert.equal(parseCatalogParams({ page: "99999" }).page, 500);
    assert.equal(parseCatalogParams({ page: "abc" }).page, 1);
    const r = parseCatalogParams({ min: "500", max: "100" });
    assert.deepEqual([r.minPrice, r.maxPrice], [100, 500]);
    const z = parseCatalogParams({ min: "0", max: "NaN" });
    assert.deepEqual([z.minPrice, z.maxPrice], [null, null]);
    assert.equal(parseCatalogParams({ max: "9e99" }).maxPrice, 10_000_000);
  });

  it("caps the free-text query and accepts the legacy ?query= alias", () => {
    assert.equal(parseCatalogParams({ q: "x".repeat(500) }).q.length, 80);
    assert.equal(parseCatalogParams({ query: "  laptop   bag " }).q, "laptop bag");
  });

  it("never throws on arbitrary garbage", () => {
    for (const v of [undefined, "", "💥", "\u0000", "%", [] as string[], ["", ""]]) {
      parseCatalogParams({ q: v, category: v, min: v, page: v, sort: v });
    }
  });
});

describe("searchTokens", () => {
  it("keeps only letters/digits (no wildcard or GROQ syntax) and caps count/length", () => {
    assert.deepEqual(searchTokens(`Lap*top "bag" OR 1=1`), ["lap", "top", "bag", "or", "1"]);
    assert.equal(searchTokens("a b c d e f g").length, 5);
    assert.equal(searchTokens("x".repeat(100))[0].length, 30);
  });
  it("supports non-latin letters", () => {
    assert.deepEqual(searchTokens("Café Ñandú"), ["café", "ñandú"]);
  });
});

describe("buildCatalogQuery", () => {
  it("puts ALL user input in parameters, never in the query text", () => {
    const evil = parseCatalogParams({ q: `laptop" || true`, category: "cat1", brand: "br1", min: "10", max: "99", condition: "new" });
    const { query, params } = buildCatalogQuery(evil);
    for (const needle of ["laptop", "cat1", "br1", "99", "true"]) {
      assert.ok(!query.replace(/_type == "product"|\|\| /g, "").includes(needle) || needle === "true" ? true : false, needle);
    }
    assert.ok(!query.includes("laptop"));
    assert.ok(!query.includes("cat1") && !query.includes("br1"));
    assert.deepEqual(params.categories, ["cat1"]);
    assert.deepEqual(params.brands, ["br1"]);
    assert.equal(params.t0, "*laptop*");
    assert.equal(params.minPrice, 10);
    assert.equal(params.maxPrice, 99);
  });

  it("every $param used in the query is supplied, and none are left dangling", () => {
    const p = parseCatalogParams({ q: "a b", category: "c", brand: "b", condition: "new", min: "1", max: "2", page: "3" });
    const { query, params } = buildCatalogQuery(p);
    const used = new Set([...query.matchAll(/\$(\w+)/g)].map((m) => m[1]));
    assert.deepEqual([...used].sort(), Object.keys(params).sort());
  });

  it("only includes clauses for active filters", () => {
    const { query, params } = buildCatalogQuery(DEFAULT_CATALOG_PARAMS as never);
    assert.ok(!query.includes("$categories") && !query.includes("$minPrice") && !query.includes("match"));
    assert.deepEqual(Object.keys(params).sort(), ["end", "start"]);
  });

  it("paginates with the right offsets and a stable tie-break order", () => {
    const { params, query } = buildCatalogQuery(parseCatalogParams({ page: "3" }));
    assert.equal(params.start, 2 * CATALOG_PAGE_SIZE);
    assert.equal(params.end, 3 * CATALOG_PAGE_SIZE);
    assert.ok(query.includes("_id asc")); // deterministic paging across pages
  });

  it("each sort maps to its own order clause", () => {
    const seen = new Set<string>();
    for (const sort of ["name-asc", "name-desc", "price-low", "price-high", "newest"]) {
      seen.add(buildCatalogQuery(parseCatalogParams({ sort })).query.match(/order\(([^)]*\)?[^)]*)\)/)![1]);
    }
    assert.equal(seen.size, 5);
  });

  it("projects the fields the card/cart/wishlist read, and no heavy ones", () => {
    const { query } = buildCatalogQuery(DEFAULT_CATALOG_PARAMS as never);
    for (const f of ["_id", "_type", "_updatedAt", "_rev", "name", "slug", "price", "discount", "stock", "status", "isFlashSale", "averageRating", "totalReviews", `"categories"`, `"images"`]) {
      assert.ok(query.includes(f), f);
    }
    // No spread projection (`{ ... }` / `...,` pulls every field of every document).
    // Range syntax such as [$start...$end] and images[0...3] is legitimate.
    assert.ok(!/(\{|,)\s*\.\.\.\s*(,|\})/.test(query), "must not use a ... spread projection");
    assert.ok(!query.includes("description,"));
  });
});

describe("URL round-trip", () => {
  it("parse(toSearchParams(p)) === p, and defaults are omitted", () => {
    const p = parseCatalogParams({ q: "bag", category: "a,b", brand: "x", condition: "new", min: "5", max: "50", sort: "price-low", page: "2" });
    const back = parseCatalogParams(Object.fromEntries(catalogParamsToSearchParams(p)));
    assert.deepEqual(back, p);
    assert.equal(catalogParamsToSearchParams(DEFAULT_CATALOG_PARAMS as never).toString(), "");
  });
  it("cache key ignores id order", () => {
    const a = parseCatalogParams({ category: "b,a" });
    const b = parseCatalogParams({ category: "a,b" });
    assert.equal(catalogCacheKey(a), catalogCacheKey(b));
  });
});

describe("paging helpers", () => {
  it("totalPages is at least 1", () => {
    assert.equal(totalPages(0), 1);
    assert.equal(totalPages(24), 1);
    assert.equal(totalPages(25), 2);
  });
  it("paginationWindow is compact with gaps and always includes first/last/current", () => {
    assert.deepEqual(paginationWindow(1, 5), [1, 2, 3, 4, 5]);
    assert.deepEqual(paginationWindow(8, 20), [1, "…", 7, 8, 9, "…", 20]);
    assert.deepEqual(paginationWindow(1, 20), [1, 2, 3, 4, "…", 20]);
    assert.deepEqual(paginationWindow(20, 20), [1, "…", 17, 18, 19, 20]);
    for (let page = 1; page <= 30; page++) {
      const w = paginationWindow(page, 30);
      assert.ok(w.includes(page) && w.includes(1) && w.includes(30) && w.length <= 9);
    }
  });
});

import { sliderMax, CATALOG_MAX_PRICE_QUERY } from "./catalogQuery";

describe("sliderMax", () => {
  it("never goes below 1000, rounds up to a stable step, and tolerates junk", () => {
    assert.equal(sliderMax(null), 1000);
    assert.equal(sliderMax(undefined), 1000);
    assert.equal(sliderMax(NaN), 1000);
    assert.equal(sliderMax(999), 1000);
    assert.equal(sliderMax(1001), 1100);
    assert.equal(sliderMax(25000), 25000);
    assert.equal(sliderMax(25000.5), 25100);
  });
  it("max-price query is a fixed string (no user input)", () => {
    assert.ok(!CATALOG_MAX_PRICE_QUERY.includes("$"));
  });
});

describe("substring search", () => {
  it("matches inside words like the old client-side includes()", () => {
    const { query, params } = buildCatalogQuery(parseCatalogParams({ q: "phone" }));
    assert.equal(params.t0, "*phone*");
    assert.ok(query.includes("name match $t0"));
  });
});
