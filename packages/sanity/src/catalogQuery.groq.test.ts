import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluate, parse } from "groq-js";
import {
  CATALOG_MAX_PRICE_QUERY,
  CATALOG_PAGE_SIZE,
  DEFAULT_CATALOG_PARAMS,
  buildCatalogQuery,
  parseCatalogParams,
  type CatalogParams,
} from "./catalogQuery";

/**
 * EXECUTES the generated GROQ against an in-memory dataset with a real GROQ
 * engine, so filters, sorting, paging, totals and search are verified by result,
 * not just by the shape of the query text.
 */

const ref = (id: string) => ({ _type: "reference", _ref: id });
const cat = (id: string, title: string) => ({ _id: id, _type: "category", title });

// 60 products: enough for 3 pages (24/page) and every filter to bite.
const products = Array.from({ length: 60 }, (_, i) => {
  const n = i + 1;
  return {
    _id: `p${n}`,
    _type: "product",
    _rev: "r",
    _createdAt: new Date(Date.UTC(2026, 0, 1 + i)).toISOString(), // p60 newest
    _updatedAt: "2026-01-01T00:00:00Z",
    name: n === 7 ? "Apple iPhone 15" : n === 8 ? "ZTE Phone Case" : `Item ${String(n).padStart(2, "0")}`,
    description: n === 9 ? "A great laptop for students" : "generic",
    slug: { current: `item-${n}` },
    price: n * 10, // 10..600
    discount: 0,
    stock: 5,
    status: n % 3 === 0 ? "refurbished" : n % 3 === 1 ? "new" : "good",
    isFlashSale: false,
    images: [{ _key: "k", asset: ref("img") }, {}, {}, {}, {}],
    categories: n <= 30 ? [{ _key: "a", ...ref("c-phones") }] : [{ _key: "a", ...ref("c-laptops") }],
    brand: n % 2 === 0 ? ref("b-apple") : ref("b-dell"),
  };
});
const dataset = [
  ...products,
  cat("c-phones", "Phones"),
  cat("c-laptops", "Laptops"),
  // approved + unapproved reviews for p1
  { _id: "r1", _type: "review", product: ref("p1"), status: "approved", rating: 5 },
  { _id: "r2", _type: "review", product: ref("p1"), status: "approved", rating: 3 },
  { _id: "r3", _type: "review", product: ref("p1"), status: "pending", rating: 1 },
];

async function run(overrides: Partial<CatalogParams> = {}, data: unknown[] = dataset) {
  const { query, params } = buildCatalogQuery({ ...DEFAULT_CATALOG_PARAMS, ...overrides });
  const value = await evaluate(parse(query, { params }), { dataset: data, params });
  return (await value.get()) as { total: number; items: Array<Record<string, any>> };
}
const ids = (r: { items: Array<{ _id: string }> }) => r.items.map((i) => i._id);

describe("catalogue GROQ (executed)", () => {
  it("returns a page of 24 and the TRUE total, not just what is on the page", async () => {
    const r = await run();
    assert.equal(r.total, 60);
    assert.equal(r.items.length, CATALOG_PAGE_SIZE);
  });

  it("pages are disjoint and together cover everything exactly once", async () => {
    const seen = new Set<string>();
    for (const page of [1, 2, 3]) {
      const r = await run({ page });
      for (const id of ids(r)) {
        assert.ok(!seen.has(id), `${id} repeated across pages`);
        seen.add(id);
      }
    }
    assert.equal(seen.size, 60);
    assert.equal((await run({ page: 3 })).items.length, 60 - 48); // last page is partial
    assert.equal((await run({ page: 4 })).items.length, 0); // past the end is empty, total still correct
    assert.equal((await run({ page: 4 })).total, 60);
  });

  it("sorts: name, price and newest", async () => {
    assert.deepEqual(ids(await run({ sort: "price-low" })).slice(0, 3), ["p1", "p2", "p3"]);
    assert.deepEqual(ids(await run({ sort: "price-high" })).slice(0, 3), ["p60", "p59", "p58"]);
    assert.deepEqual(ids(await run({ sort: "newest" })).slice(0, 3), ["p60", "p59", "p58"]);
    const asc = (await run({ sort: "name-asc" })).items.map((i) => i.name.toLowerCase());
    assert.deepEqual(asc, [...asc].sort());
    const desc = (await run({ sort: "name-desc" })).items.map((i) => i.name.toLowerCase());
    assert.deepEqual(desc, [...desc].sort().reverse());
  });

  it("price range is inclusive and totals reflect it", async () => {
    const r = await run({ minPrice: 100, maxPrice: 200, sort: "price-low" });
    assert.equal(r.total, 11); // 100,110,...,200
    assert.ok(r.items.every((i) => i.price >= 100 && i.price <= 200));
  });

  it("filters by category, brand and condition (and combines them with AND)", async () => {
    assert.equal((await run({ categories: ["c-phones"] })).total, 30);
    assert.equal((await run({ brands: ["b-apple"] })).total, 30);
    assert.equal((await run({ conditions: ["refurbished"] })).total, 20);
    const both = await run({ categories: ["c-laptops"], brands: ["b-apple"], conditions: ["new"] });
    assert.ok(both.items.every((i) => i.categories[0] === "Laptops"));
    assert.equal(both.total, products.filter((p) => p.categories[0]._ref === "c-laptops" && p.brand._ref === "b-apple" && p.status === "new").length);
    // multiple values within one facet are OR
    assert.equal((await run({ categories: ["c-phones", "c-laptops"] })).total, 60);
  });

  it("search is a SUBSTRING match like the old UI: 'phone' finds 'iPhone' and 'Phone Case'", async () => {
    const r = await run({ q: "phone" });
    assert.deepEqual(ids(r).sort(), ["p7", "p8"]);
    assert.equal(r.total, 2);
  });

  it("search also covers the description, and multiple words must ALL match", async () => {
    assert.deepEqual(ids(await run({ q: "laptop" })), ["p9"]);
    assert.deepEqual(ids(await run({ q: "laptop students" })), ["p9"]);
    assert.equal((await run({ q: "laptop banana" })).total, 0);
  });

  it("hostile search input cannot change the query or crash it", async () => {
    for (const q of [`"] || true || *[`, "* ", "}{ ..., x", "a'b\"c", "\\", "%00", "🙂", "name == 'x'"]) {
      const r = await run(parseCatalogParams({ q }));
      assert.ok(typeof r.total === "number" && r.total <= 60, `q=${q}`);
    }
  });

  it("projects what the card needs: resolved category titles, 3 images, approved-review rating", async () => {
    const r = await run({ sort: "price-low" });
    const p1 = r.items[0];
    assert.equal(p1._id, "p1");
    assert.deepEqual(p1.categories, ["Phones"]);
    assert.ok(p1.images.length <= 3);
    assert.equal(p1.totalReviews, 2); // the pending review is excluded
    assert.equal(p1.averageRating, 4);
    assert.equal(r.items[1].totalReviews, 0);
  });

  it("max-price query drives the slider bound", async () => {
    const v = await evaluate(parse(CATALOG_MAX_PRICE_QUERY), { dataset });
    assert.equal(await v.get(), 600);
  });

  it("category filter also matches the legacy single `category` reference and ignores products without any", async () => {
    const mk = (id: string, extra: object) => ({ _id: id, _type: "product", name: id, price: 1, _createdAt: "2026-01-01T00:00:00Z", ...extra });
    const data = [
      mk("multi", { categories: [{ _key: "a", _ref: "c1" }, { _key: "b", _ref: "c2" }] }),
      mk("legacy", { category: { _ref: "c1" } }),
      mk("other", { categories: [{ _key: "a", _ref: "c9" }] }),
      mk("none", {}),
    ];
    assert.deepEqual(ids(await run({ categories: ["c1"], sort: "name-asc" }, data)).sort(), ["legacy", "multi"]);
    assert.deepEqual(ids(await run({ categories: ["c2"] }, data)), ["multi"]);
    assert.equal((await run({ categories: ["nope"] }, data)).total, 0);
  });
});
