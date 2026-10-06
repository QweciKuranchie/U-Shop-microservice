import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { planOrderStatusBackfill, reconcileLegacyOrderStatus, ORDER_STATUS_VALUES } from "./orderStatus";

describe("reconcileLegacyOrderStatus", () => {
  it("uses the only value present; defaults to pending", () => {
    assert.equal(reconcileLegacyOrderStatus({ orderStatus: "shipped" }).orderStatus, "shipped");
    assert.equal(reconcileLegacyOrderStatus({ status: "delivered" }).orderStatus, "delivered");
    assert.equal(reconcileLegacyOrderStatus({}).orderStatus, "pending");
    assert.equal(reconcileLegacyOrderStatus({ orderStatus: "  ", status: null }).orderStatus, "pending");
  });

  it("agreeing values are not conflicts (case/space insensitive)", () => {
    const r = reconcileLegacyOrderStatus({ orderStatus: "Processing", status: " processing" });
    assert.deepEqual([r.orderStatus, r.conflict], ["processing", false]);
  });

  it("cancelled always wins (old cancel/refund paths only wrote `status`)", () => {
    assert.equal(reconcileLegacyOrderStatus({ orderStatus: "processing", status: "cancelled" }).orderStatus, "cancelled");
    assert.equal(reconcileLegacyOrderStatus({ orderStatus: "cancelled", status: "shipped" }).orderStatus, "cancelled");
  });

  it("the further-along stage wins in both directions", () => {
    // card paid: webhook advanced orderStatus, `status` stayed at its initial value
    assert.equal(reconcileLegacyOrderStatus({ orderStatus: "processing", status: "pending" }).orderStatus, "processing");
    // admin status route advanced only `status`
    assert.equal(reconcileLegacyOrderStatus({ orderStatus: "processing", status: "delivered" }).orderStatus, "delivered");
    assert.equal(reconcileLegacyOrderStatus({ orderStatus: "shipped", status: "processing" }).orderStatus, "shipped");
  });

  it("unknown values lose to known ones; same-stage ties keep orderStatus and are flagged", () => {
    assert.equal(reconcileLegacyOrderStatus({ orderStatus: "weird", status: "shipped" }).orderStatus, "shipped");
    const tie = reconcileLegacyOrderStatus({ orderStatus: "out_for_delivery", status: "failed_delivery" });
    assert.deepEqual([tie.orderStatus, tie.conflict, tie.reason], ["out_for_delivery", true, "tie_kept_orderStatus"]);
  });

  it("every value the old code wrote is in the canonical list", () => {
    for (const v of ["pending","processing","paid","shipped","out_for_delivery","delivered","cancelled","completed","confirmed","packed","ready_for_delivery","address_confirmed","order_confirmed","rescheduled","failed_delivery"]) {
      assert.ok(ORDER_STATUS_VALUES.includes(v), v);
    }
  });
});

describe("planOrderStatusBackfill", () => {
  it("is idempotent: migrated docs need nothing", () => {
    assert.deepEqual(planOrderStatusBackfill({ _id: "a", _rev: "1", orderStatus: "shipped" }), { action: "none" });
  });
  it("collapses both fields and unsets the legacy one", () => {
    const p = planOrderStatusBackfill({ _id: "a", _rev: "1", orderStatus: "pending", status: "cancelled" });
    assert.deepEqual(p, { action: "update", orderStatus: "cancelled", unsetStatus: true, conflict: true, reason: "cancelled_wins" });
  });
  it("fills a missing orderStatus without unsetting a missing status", () => {
    const p = planOrderStatusBackfill({ _id: "a", _rev: "1" });
    assert.deepEqual(p, { action: "update", orderStatus: "pending", unsetStatus: false, conflict: false, reason: "neither_defaulted_to_pending" });
  });
});
