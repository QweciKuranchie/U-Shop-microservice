/**
 * Canonical order lifecycle: the single definition shared by the Sanity schema,
 * the apps and the backfill script. The stored field is `orderStatus`.
 *
 * History: orders used to carry TWO status fields (`status` and `orderStatus`)
 * that different code paths updated independently, so they drifted apart.
 * `orderStatus` is the one declared in the schema and is now the only one
 * written or read. `reconcileLegacyOrderStatus` defines how old documents that
 * carry both are collapsed into one value.
 */

export const ORDER_STATUS_OPTIONS = [
  { value: "pending", title: "Pending", rank: 0 },
  { value: "paid", title: "Paid", rank: 1 },
  { value: "address_confirmed", title: "Address confirmed", rank: 2 },
  { value: "order_confirmed", title: "Order confirmed", rank: 3 },
  { value: "confirmed", title: "Confirmed", rank: 3 },
  { value: "processing", title: "Processing", rank: 4 },
  { value: "packed", title: "Packed", rank: 5 },
  { value: "ready_for_delivery", title: "Ready for delivery", rank: 6 },
  { value: "shipped", title: "Shipped", rank: 7 },
  { value: "out_for_delivery", title: "Out for delivery", rank: 8 },
  { value: "rescheduled", title: "Rescheduled", rank: 8 },
  { value: "failed_delivery", title: "Failed delivery", rank: 8 },
  { value: "delivered", title: "Delivered", rank: 9 },
  { value: "completed", title: "Completed", rank: 10 },
  { value: "cancelled", title: "Cancelled", rank: 99 },
] as const;

export type OrderStatusValue = (typeof ORDER_STATUS_OPTIONS)[number]["value"];

export const ORDER_STATUS_VALUES: readonly string[] = ORDER_STATUS_OPTIONS.map((o) => o.value);

const RANK = new Map<string, number>(ORDER_STATUS_OPTIONS.map((o) => [o.value, o.rank]));

const norm = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim().toLowerCase() : undefined;

export interface StatusReconciliation {
  /** The value to store in `orderStatus`. */
  orderStatus: string;
  /** True when both fields were present and disagreed (worth a human glance). */
  conflict: boolean;
  /** Why this value won. */
  reason:
    | "only_orderStatus"
    | "only_status"
    | "neither_defaulted_to_pending"
    | "agree"
    | "cancelled_wins"
    | "further_along_wins"
    | "unknown_value_loses"
    | "tie_kept_orderStatus";
}

/**
 * Collapse legacy `{orderStatus, status}` into one value.
 *
 * Rules, in order:
 *  1. Only one present → use it. Neither → "pending".
 *  2. Equal → that value.
 *  3. Either is "cancelled" → cancelled. Cancellation is terminal; the old refund
 *     and cancel paths only ever wrote `status`, so orderStatus is often stale.
 *  4. Otherwise the further-along lifecycle stage wins: orders only move forward,
 *     and each writer only ever advanced its own field.
 *  5. A value outside the known lifecycle loses to a known one.
 *  6. Same stage, different value (e.g. out_for_delivery vs failed_delivery):
 *     keep `orderStatus` and flag it as a conflict for review.
 */
export function reconcileLegacyOrderStatus(input: {
  orderStatus?: unknown;
  status?: unknown;
}): StatusReconciliation {
  const o = norm(input.orderStatus);
  const s = norm(input.status);

  if (o === undefined && s === undefined) {
    return { orderStatus: "pending", conflict: false, reason: "neither_defaulted_to_pending" };
  }
  if (s === undefined) return { orderStatus: o!, conflict: false, reason: "only_orderStatus" };
  if (o === undefined) return { orderStatus: s, conflict: false, reason: "only_status" };
  if (o === s) return { orderStatus: o, conflict: false, reason: "agree" };

  if (o === "cancelled" || s === "cancelled") {
    return { orderStatus: "cancelled", conflict: true, reason: "cancelled_wins" };
  }

  const ro = RANK.get(o);
  const rs = RANK.get(s);
  if (ro === undefined && rs !== undefined) return { orderStatus: s, conflict: true, reason: "unknown_value_loses" };
  if (rs === undefined && ro !== undefined) return { orderStatus: o, conflict: true, reason: "unknown_value_loses" };
  if (ro !== undefined && rs !== undefined) {
    if (ro > rs) return { orderStatus: o, conflict: true, reason: "further_along_wins" };
    if (rs > ro) return { orderStatus: s, conflict: true, reason: "further_along_wins" };
  }
  return { orderStatus: o, conflict: true, reason: "tie_kept_orderStatus" };
}

export interface BackfillDoc {
  _id: string;
  _rev: string;
  orderStatus?: unknown;
  status?: unknown;
}

export type BackfillPlan =
  | { action: "none" }
  | { action: "update"; orderStatus: string; unsetStatus: boolean; conflict: boolean; reason: StatusReconciliation["reason"] };

/** What to do for one order document. Idempotent: a migrated doc yields `none`. */
export function planOrderStatusBackfill(doc: BackfillDoc): BackfillPlan {
  const hasLegacy = doc.status !== undefined && doc.status !== null;
  const hasCanonical = typeof doc.orderStatus === "string" && doc.orderStatus.trim() !== "";
  if (!hasLegacy && hasCanonical) return { action: "none" };

  const r = reconcileLegacyOrderStatus(doc);
  return { action: "update", orderStatus: r.orderStatus, unsetStatus: hasLegacy, conflict: r.conflict, reason: r.reason };
}
