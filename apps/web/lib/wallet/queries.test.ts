import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluate, parse } from "groq-js";
import { WALLET_USER_QUERY } from "./queries";

const dataset = [
  {
    _id: "u1", _type: "user", _rev: "rev1", clerkUserId: "clerk_1", walletBalance: 50,
    walletTransactions: [
      { _key: "a", type: "credit_refund", orderId: "order-A", amount: 20 },
      { _key: "b", type: "debit_purchase", orderId: "order-B", amount: 10 },
    ],
  },
  { _id: "u2", _type: "user", _rev: "rev2", clerkUserId: "clerk_2" }, // brand-new wallet: no balance/transactions
];

async function load(clerkUserId: string, refundOrderId: string | null) {
  const params = { clerkUserId, refundOrderId };
  return (await (await evaluate(parse(WALLET_USER_QUERY, { params }), { dataset, params })).get()) as any;
}

describe("WALLET_USER_QUERY (executed)", () => {
  it("flags an order that was ALREADY refunded, so a retry cannot credit twice", async () => {
    const u = await load("clerk_1", "order-A");
    assert.equal(u.alreadyCredited, true);
    assert.equal(u._rev, "rev1"); // the revision the optimistic lock will guard on
    assert.equal(u.walletBalance, 50);
  });

  it("does not flag a different order, or a non-refund transaction for the same order", async () => {
    assert.equal((await load("clerk_1", "order-Z")).alreadyCredited, false);
    assert.equal((await load("clerk_1", "order-B")).alreadyCredited, false); // order-B is a debit, not a refund
  });

  it("is false when no refund order is given (plain debit lookups)", async () => {
    assert.equal((await load("clerk_1", null)).alreadyCredited, false);
  });

  it("handles a user with no wallet fields yet", async () => {
    const u = await load("clerk_2", "order-A");
    assert.equal(u.alreadyCredited, false);
    assert.equal(u._id, "u2");
  });

  it("returns null for an unknown user", async () => {
    assert.equal(await load("nobody", "order-A"), null);
  });
});
