import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateShippingFee,
  computeOrderTotals,
  resolvePromoCode,
  roundMoney,
  type PricingAddress,
  type PricingLine,
} from "./pricing";

/**
 * VERBATIM copy of the logic that previously lived inline in
 * apps/web/components/checkout/CheckoutContent.tsx + store.ts. Kept here as the
 * behavioural oracle: the shared module must produce the same payable amounts.
 */
function legacyTotals(
  lines: PricingLine[],
  isBusiness: boolean,
  applied: { type: "percentage" | "fixed"; amount: number } | null,
  addr: PricingAddress | null
) {
  const getSubTotalPrice = () =>
    lines.reduce((t, i) => {
      const cp = i.price ?? 0;
      const d = i.discount ?? 0;
      return t + (cp + (d * cp) / 100) * i.quantity;
    }, 0);
  const getTotalDiscount = () =>
    lines.reduce((t, i) => {
      const cp = i.price ?? 0;
      const d = i.discount ?? 0;
      return t + ((d * cp) / 100) * i.quantity;
    }, 0);
  const grossSubtotal = getSubTotalPrice();
  const totalDiscount = getTotalDiscount();
  const currentSubtotal = grossSubtotal - totalDiscount;
  const businessDiscount = isBusiness ? currentSubtotal * 0.02 : 0;
  const finalSubtotal = currentSubtotal - businessDiscount;
  const promoDiscountAmount = applied
    ? applied.type === "percentage"
      ? (finalSubtotal * applied.amount) / 100
      : applied.amount
    : 0;
  const calc = (a: PricingAddress | null, s: number): number => {
    if (s >= 500) return 0;
    if (!a) return 20;
    const location = `${a.city || ""} ${a.state || ""} ${a.address || ""}`.toLowerCase();
    if (["accra", "tema", "legon", "madina", "spintex", "east legon", "kasoa", "adenta", "dome", "achimota"].some((k) => location.includes(k))) return 15;
    if (["kumasi", "obuasi", "ashanti"].some((k) => location.includes(k))) return 25;
    return 35;
  };
  const shipping = calc(addr, finalSubtotal);
  const total = Math.max(0, finalSubtotal - promoDiscountAmount + shipping);
  return { finalSubtotal, shipping, total, businessDiscount, promoDiscountAmount, totalDiscount };
}

// Deterministic PRNG so failures are reproducible.
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("computeOrderTotals", () => {
  it("matches the legacy client formulas (to the pesewa) across 5,000 random carts", () => {
    const rand = mulberry32(42);
    const addrs: (PricingAddress | null)[] = [
      null,
      { city: "Accra", state: "Greater Accra", address: "12 Oxford St" },
      { city: "Kumasi", state: "Ashanti", address: "Adum" },
      { city: "Tamale", state: "Northern", address: "Central" },
      { city: "", state: "", address: "Spintex Road" },
    ];
    const promos = [null, "SAVE10", "FLAT20"] as const;

    for (let n = 0; n < 5000; n++) {
      const lines: PricingLine[] = Array.from({ length: 1 + Math.floor(rand() * 5) }, () => ({
        price: Math.round(rand() * 80000) / 100,
        discount: rand() < 0.5 ? 0 : Math.floor(rand() * 60),
        quantity: 1 + Math.floor(rand() * 4),
      }));
      const isBusiness = rand() < 0.5;
      const addr = addrs[Math.floor(rand() * addrs.length)];
      const promoCode = promos[Math.floor(rand() * promos.length)];
      const applied = resolvePromoCode(promoCode);

      const legacy = legacyTotals(lines, isBusiness, applied, addr);
      const next = computeOrderTotals({ lines, isBusiness, promoCode, address: addr });

      // Payable amount must agree to the pesewa.
      assert.equal(next.total, roundMoney(legacy.total), `total mismatch #${n}`);
      assert.equal(next.subtotal, roundMoney(legacy.finalSubtotal), `subtotal mismatch #${n}`);
      assert.equal(next.businessDiscount, roundMoney(legacy.businessDiscount));
      assert.equal(next.promoDiscount, roundMoney(legacy.promoDiscountAmount));
      assert.equal(next.productDiscount, roundMoney(legacy.totalDiscount));
      // Shipping may only differ at the exact free-shipping boundary, where the
      // legacy code compared an un-rounded float (e.g. 499.99999999999994).
      if (Math.abs(legacy.finalSubtotal - 500) > 0.005) {
        assert.equal(next.shipping, legacy.shipping, `shipping mismatch #${n}`);
      }
    }
  });

  it("a promo larger than the subtotal never makes the total negative", () => {
    // Legacy behaviour preserved: shipping is added AFTER the promo, so
    // 5 - 20 + 20 (default shipping) = 5, and the result is clamped at >= 0.
    const t = computeOrderTotals({ lines: [{ price: 5, quantity: 1 }], promoCode: "FLAT20" });
    assert.equal(t.total, 5);
    assert.ok(t.total >= 0);
  });

  it("float noise at the free-shipping boundary does not deny free shipping", () => {
    // 0.1 + 0.2 style noise: these three prices sum to 499.99999999999994 in IEEE-754.
    const lines = [{ price: 100.1, quantity: 1 }, { price: 200.2, quantity: 1 }, { price: 199.7, quantity: 1 }];
    const t = computeOrderTotals({ lines, address: { city: "Accra" } });
    assert.equal(t.subtotal, 500);
    assert.equal(t.shipping, 0);
  });

  it("is robust to hostile / malformed input", () => {
    const t = computeOrderTotals({
      lines: [
        { price: NaN, quantity: 2 },
        { price: Infinity, discount: NaN, quantity: 1 },
        { price: 10, quantity: -5 },
        { price: 10, quantity: 1.9 }, // floors to 1
      ],
    });
    assert.equal(t.currentSubtotal, 10);
    assert.ok(Number.isFinite(t.total));
  });
});

describe("resolvePromoCode", () => {
  it("is case/space insensitive and rejects unknown + prototype keys", () => {
    assert.deepEqual(resolvePromoCode(" save10 "), { code: "SAVE10", type: "percentage", amount: 10 });
    assert.equal(resolvePromoCode("nope"), null);
    assert.equal(resolvePromoCode("__proto__"), null);
    assert.equal(resolvePromoCode("constructor"), null);
    assert.equal(resolvePromoCode(""), null);
    assert.equal(resolvePromoCode(undefined), null);
  });
});

describe("calculateShippingFee", () => {
  it("applies the free-shipping threshold, zones, and default", () => {
    assert.equal(calculateShippingFee(null, 500), 0);
    assert.equal(calculateShippingFee(null, 499.99), 20);
    assert.equal(calculateShippingFee({ city: "Tema" }, 10), 15);
    assert.equal(calculateShippingFee({ state: "Ashanti" }, 10), 25);
    assert.equal(calculateShippingFee({ city: "Bolgatanga" }, 10), 35);
  });
});
