import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toPesewas, verifyChargeAgainstOrder } from "./chargeVerification";

const order = { totalPrice: 1234.56, currency: "GHS" };
const good = { status: "success", amount: 123456, currency: "GHS" };

describe("verifyChargeAgainstOrder", () => {
  it("accepts an exact, successful, same-currency charge", () => {
    assert.deepEqual(verifyChargeAgainstOrder(order, good), { ok: true, amountPesewas: 123456 });
  });

  it("REJECTS underpayment (the pay-GHS-1-for-a-GHS-5000-order attack)", () => {
    const r = verifyChargeAgainstOrder({ totalPrice: 5000 }, { ...good, amount: 100 });
    assert.equal(r.ok, false);
    assert.equal(!r.ok && r.reason, "amount_mismatch");
  });

  it("rejects overpayment too (reconcile manually rather than auto-accept)", () => {
    assert.equal(verifyChargeAgainstOrder(order, { ...good, amount: 123457 }).ok, false);
  });

  it("rejects wrong currency, non-success status, and junk amounts", () => {
    assert.equal(verifyChargeAgainstOrder(order, { ...good, currency: "USD" }).ok, false);
    assert.equal(verifyChargeAgainstOrder(order, { ...good, status: "failed" }).ok, false);
    assert.equal(verifyChargeAgainstOrder(order, { ...good, amount: 1234.56 }).ok, false); // not integer pesewas
    assert.equal(verifyChargeAgainstOrder(order, { ...good, amount: undefined }).ok, false);
  });

  it("rejects orders with no usable total (never auto-pays a GHS 0 order)", () => {
    for (const totalPrice of [0, -5, NaN, undefined, null]) {
      assert.equal(verifyChargeAgainstOrder({ totalPrice }, good).ok, false);
    }
  });

  it("is case-insensitive on currency and defaults the order currency to GHS", () => {
    assert.equal(verifyChargeAgainstOrder({ totalPrice: 1 }, { status: "success", amount: 100, currency: "ghs" }).ok, true);
  });
});

describe("toPesewas", () => {
  it("rounds like the amount sent at initialisation", () => {
    assert.equal(toPesewas(841.995), 84200);
    assert.equal(toPesewas(0.1 + 0.2), 30);
  });
});
