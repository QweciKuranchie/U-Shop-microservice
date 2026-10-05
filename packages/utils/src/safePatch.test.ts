import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { omitProtectedFields, pickAllowedFields, rootKey } from "./safePatch";

describe("rootKey", () => {
  it("extracts the root segment of JSONPath-style keys", () => {
    assert.equal(rootKey("kycStatus"), "kycStatus");
    assert.equal(rootKey("store._ref"), "store");
    assert.equal(rootKey("items[0].qty"), "items");
  });
});

describe("omitProtectedFields", () => {
  const protectedKeys = ["kycStatus", "verifiedSeller", "store"];

  it("blocks self-approval of KYC / verification", () => {
    const out = omitProtectedFields({ name: "Shop", kycStatus: "approved", verifiedSeller: true }, protectedKeys);
    assert.deepEqual(out, { name: "Shop" });
  });

  it("blocks JSONPath bypasses and system fields", () => {
    const out = omitProtectedFields(
      { "store._ref": "other", "store": {}, "kycStatus[0]": 1, _id: "x", _rev: "y", price: 5 },
      protectedKeys
    );
    assert.deepEqual(out, { price: 5 });
  });

  it("rejects non-object bodies", () => {
    for (const b of [null, undefined, "x", 5, [], [{ a: 1 }]]) assert.equal(omitProtectedFields(b, []), null);
  });
});

describe("pickAllowedFields", () => {
  it("keeps only allowed roots (and their paths)", () => {
    const out = pickAllowedFields({ orderStatus: "shipped", paymentStatus: "paid", totalPrice: 1, "address.city": "x" }, ["orderStatus"]);
    assert.deepEqual(out, { orderStatus: "shipped" });
  });
});
